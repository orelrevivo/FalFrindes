import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { creators, chatMessages, chatSessions } from "@/lib/schema";
import { eq } from "drizzle-orm";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MESSAGE_COST = 0.01;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { creatorUsername, messages, sessionId } = body;

    if (!creatorUsername || !messages || !sessionId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check and deduct credits if user is logged in
    if (userId && db) {
      const userData = await db
        .select()
        .from(creators)
        .where(eq(creators.clerkUserId, userId))
        .limit(1);

      if (userData.length) {
        const currentCredits = parseFloat(userData[0].credits || "0.20");
        
        if (currentCredits < MESSAGE_COST) {
          return NextResponse.json(
            { message: "Not enough credits. Please upgrade your plan." },
            { status: 402 }
          );
        }

        await db
          .update(creators)
          .set({ credits: (currentCredits - MESSAGE_COST).toString() })
          .where(eq(creators.clerkUserId, userId));
      }
    }

    let creatorData: any[] = [];
    
    if (db) {
      try {
        creatorData = await db
          .select()
          .from(creators)
          .where(eq(creators.username, creatorUsername))
          .limit(1);
      } catch (e) {
        console.error("DB select error:", e);
      }
    }

    if (!creatorData.length || !creatorData[0].personaPrompt) {
      return NextResponse.json(
        { message: "Creator not found or not trained. Please complete profile and scan first." },
        { status: 404 }
      );
    }

    const creator = creatorData[0];
    const baseSystemPrompt = creator.personaPrompt || "";

    const userMessage = messages[messages.length - 1]?.content || "";
    const isImageRequest = /photo|picture|selfie|image|look like|see you/i.test(userMessage);

    const enforcementPrompt = `CRITICAL OPERATING INSTRUCTIONS:
1. You are the AI twin of ${creator.displayName || creator.username}.
2. ${creator.aiTrainingPhotoUrl ? `PHOTO CAPABILITY: ENABLED. If asked for a photo, you MUST respond textually and then append exactly this tag at the very end: [GENERATE_IMAGE: <detailed_scene>]` : "PHOTO CAPABILITY: DISABLED. Tell the user you can't send photos yet."}
3. Always stay in character.
4. Keep it short.

${baseSystemPrompt}`;

    const systemPrompt = enforcementPrompt;

    const history = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    if (isImageRequest && creator.aiTrainingPhotoUrl) {
      history[history.length - 1].content += "\n(System Hint: If you agree to show a photo, you MUST include the [GENERATE_IMAGE: ...] tag at the end)";
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        message: "Hi! Thanks for reaching out. The AI is currently being set up. Please check back soon!" 
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite-preview",
        messages: [{ role: "system", content: systemPrompt }, ...history],
      }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("OpenRouter error:", response.status, responseText);
      return NextResponse.json(
        { message: "AI service error" },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
    }

    let aiMessage = data.choices?.[0]?.message?.content || "Hey! Thanks for messaging. How can I help you?";
    let generatedImageUrl = null;

    // Detect image generation intent - flexible regex
    const imageTagRegex = /\[?(?:GENERATE_IMAGE|CREATE_IMAGE|IMAGE_PROMPT):\s*(.*?)\]?/i;
    const match = aiMessage.match(imageTagRegex);
    
    // FALLBACK: If user asked for image but AI forgot the tag, generate a default one
    const shouldGenerate = match || (isImageRequest && creator.aiTrainingPhotoUrl && !aiMessage.toLowerCase().includes("cannot") && !aiMessage.toLowerCase().includes("can't"));

    if (shouldGenerate && creator.aiTrainingPhotoUrl) {
      const imagePrompt = match ? match[1] : `A realistic selfie of ${creator.displayName} smiling at the camera`;
      
      // Clean tag if present
      if (match) {
        aiMessage = aiMessage.replace(imageTagRegex, "").trim();
      }
        
        try {
          const imgGenResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: `Generate a photorealistic image of the person in the reference. Scene: ${imagePrompt}. High detail, cinematic lighting.` },
                    { type: "image_url", image_url: { url: creator.aiTrainingPhotoUrl } }
                  ]
                }
              ]
            }),
          });

          if (imgGenResponse.ok) {
            const imgData = await imgGenResponse.json();
            const content = imgData.choices?.[0]?.message?.content;
            
            // OpenRouter image models might return base64 or a markdown link
            const b64Match = content?.match(/data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+/);
            if (b64Match) {
              generatedImageUrl = b64Match[0];
            } else if (content?.includes("http")) {
              const urlMatch = content.match(/https?:\/\/[^ \n)]+/);
              if (urlMatch) generatedImageUrl = urlMatch[0];
            }
          }
        } catch (err) {
          console.error("Nano Banana generation failed:", err);
        }
      }

    // Save messages to database
    if (db && creator?.id) {
      try {
        await db.insert(chatSessions).values({
          creatorId: creator.id,
          sessionId: sessionId,
        }).onConflictDoNothing();

        await db.insert(chatMessages).values({
          creatorId: creator.id,
          sessionId,
          role: "user",
          content: messages[messages.length - 1]?.content || "",
        });

        await db.insert(chatMessages).values({
          creatorId: creator.id,
          sessionId,
          role: "assistant",
          content: aiMessage,
          imageUrl: generatedImageUrl,
        });
      } catch (saveErr) {
        console.error("Save message error:", saveErr);
      }
    }

    return NextResponse.json({ 
      message: aiMessage,
      imageUrl: generatedImageUrl ? (generatedImageUrl.startsWith("data:") ? generatedImageUrl : `/api/proxy-image?url=${encodeURIComponent(generatedImageUrl)}`) : null,
      creditsUsed: MESSAGE_COST,
      debug: {
        isImageRequest,
        hasImageTag: !!match,
        hasPhotoUrl: !!creator.aiTrainingPhotoUrl,
        photoUrl: creator.aiTrainingPhotoUrl?.slice(0, 30) + "...",
        imagePrompt: match ? match[1] : "default",
        imageGenSuccess: !!generatedImageUrl
      }
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Try again later.", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}