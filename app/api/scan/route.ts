import { NextRequest, NextResponse } from "next/server";
import { db as dbLib } from "@/lib/db";
import { creators } from "@/lib/schema";
import { eq } from "drizzle-orm";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function scrapeYouTube(channelUrl: string): Promise<string> {
  try {
    let channelId = "";
    const ytMatch = channelUrl.match(/(?:channel\/|@)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      channelId = ytMatch[1];
    }
    
    if (!channelId || !YOUTUBE_API_KEY) {
      return `YouTube channel: ${channelUrl}`;
    }

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&forHandle=${channelId.replace("@", "")}&type=channel&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchRes.json();
    if (searchData.items?.[0]?.id?.channelId) {
      channelId = searchData.items[0].id.channelId;
    }

    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=15&order=date&key=${YOUTUBE_API_KEY}`
    );
    const videoData = await videoRes.json();
    
    const content: string[] = [];
    if (videoData.items) {
      for (const item of videoData.items) {
        if (item.snippet) {
          content.push(`Video Title: ${item.snippet.title}`);
          content.push(`Published: ${item.snippet.publishedAt}`);
          if (item.snippet.description) {
            content.push(`Description: ${item.snippet.description.slice(0, 500)}`);
          }
        }
      }
    }
    
    return content.join("\n");
  } catch {
    return `YouTube channel: ${channelUrl}`;
  }
}

async function scrapeGeneric(url: string, platform: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CreatorAI/1.0)",
      },
    });
    const html = await res.text();
    
    const content: string[] = [];
    content.push(`${platform}: ${url}`);
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) content.push(`Page Title: ${titleMatch[1]}`);
    
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaDesc) content.push(`Description: ${metaDesc[1]}`);
    
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitle) content.push(`OG Title: ${ogTitle[1]}`);
    
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDesc) content.push(`OG Description: ${ogDesc[1]}`);
    
    return content.join("\n");
  } catch {
    return `${platform}: ${url}`;
  }
}

async function generatePersona(scrapedContent: string, creatorName: string): Promise<string> {
  const defaultPrompt = `You are ${creatorName || "a content creator"}. You are friendly and helpful. Respond to fans in your unique style and personality. Always stay in character as yourself.`;

  if (!OPENROUTER_API_KEY) {
    return defaultPrompt;
  }

  const systemPrompt = `You are an expert at creating AI persona prompts for content creators. Your job is to analyze scraped social media data and create a comprehensive system prompt that captures:

1. CREATOR IDENTITY: Their name, who they are, their background
2. CONTENT TOPICS: What content they create (gaming, tech, lifestyle, education, etc.)
3. TONE OF VOICE: How they speak (casual, professional, humorous, energetic, etc.)
4. PERSONALITY: Their personality traits, quirks, strengths
5. KNOWLEDGE AREAS: What topics they're knowledgeable about
6. SPEAKING STYLE: Common phrases, slang they use, speech patterns
7. VALUES: What they care about, their opinions, beliefs
8. AUDIENCE: Who their fans are, how they interact with them
9. BRAND: Their unique selling proposition, what makes them different

Create a detailed system prompt (at least 300 words) that will make an AI respond exactly like this creator would. The prompt should include:
- An introduction explaining who the AI is
- Detailed personality guidelines
- Speech patterns and mannerisms
- Topics they can and cannot discuss
- How to handle various types of questions
- Their values and beliefs
- Examples of how they'd respond to common questions

IMPORTANT: Make the persona authentic to the creator based ONLY on the data provided. If there's limited data, make reasonable assumptions based on their content type.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://creatorai.com",
        "X-Title": "CreatorAI",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this creator's social media data and create a detailed persona prompt:\n\n${scrapedContent}\n\nCreator's Name: ${creatorName || "Unknown"}\n\nGenerate a comprehensive persona prompt.`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || defaultPrompt;
  } catch (err) {
    console.error("OpenRouter error:", err);
    return defaultPrompt;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, socialUrls, displayName } = body;

    if (!creatorId || !socialUrls) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const scraped: string[] = [];
    scraped.push("=== SOCIAL MEDIA SCRAPING RESULTS ===\n");

    if (socialUrls.youtube) {
      scraped.push(await scrapeYouTube(socialUrls.youtube));
      scraped.push("");
    }
    if (socialUrls.instagram) {
      scraped.push(await scrapeGeneric(socialUrls.instagram, "Instagram"));
      scraped.push("");
    }
    if (socialUrls.tiktok) {
      scraped.push(await scrapeGeneric(socialUrls.tiktok, "TikTok"));
      scraped.push("");
    }
    if (socialUrls.twitter) {
      scraped.push(await scrapeGeneric(socialUrls.twitter, "Twitter/X"));
      scraped.push("");
    }
    if (socialUrls.linkedin) {
      scraped.push(await scrapeGeneric(socialUrls.linkedin, "LinkedIn"));
      scraped.push("");
    }
    if (socialUrls.facebook) {
      scraped.push(await scrapeGeneric(socialUrls.facebook, "Facebook"));
      scraped.push("");
    }
    if (socialUrls.twitch) {
      scraped.push(await scrapeGeneric(socialUrls.twitch, "Twitch"));
      scraped.push("");
    }
    if (socialUrls.reddit) {
      scraped.push(await scrapeGeneric(socialUrls.reddit, "Reddit"));
      scraped.push("");
    }

    const scrapedText = scraped.join("\n\n");
    const personaPrompt = await generatePersona(scrapedText, displayName);

    if (dbLib) {
      try {
        const db = dbLib;
        const existing = await db
          .select()
          .from(creators)
          .where(eq(creators.clerkUserId, creatorId))
          .limit(1);

        if (existing.length) {
          await db
            .update(creators)
            .set({ 
              personaPrompt,
              scanStatus: "done",
              socialUrls: JSON.stringify(socialUrls),
            })
            .where(eq(creators.id, existing[0].id));
        }
      } catch (dbErr) {
        console.error("DB save error:", dbErr);
      }
    }

    return NextResponse.json({ personaPrompt });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json(
      { message: "Scan failed", error: String(error) },
      { status: 500 }
    );
  }
}