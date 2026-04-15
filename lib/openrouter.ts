const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatWithAI(
  systemPrompt: string,
  messages: Message[],
  model: string = "google/gemini-flash-lite-preview"
): Promise<Response> {
  const fullMessages: Message[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://creatorai.com",
      "X-Title": "CreatorAI",
    },
    body: JSON.stringify({
      model,
      messages: fullMessages,
      stream: true,
    }),
  });

  return response;
}

export async function generatePersonaPrompt(
  scrapedContent: string
): Promise<string> {
  const systemPrompt = `You are a persona trainer. Based on the following content from a content creator's social media, extract: their main topics, their tone of voice, common phrases they use, their personality traits, and their knowledge areas. Output a detailed system prompt that would make an AI respond exactly like this creator.`;

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://creatorai.com",
      "X-Title": "CreatorAI",
    },
    body: JSON.stringify({
      model: "google/gemini-flash-lite-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the scraped content from the creator's social media:\n\n${scrapedContent}\n\nPlease generate a detailed persona prompt.`,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}