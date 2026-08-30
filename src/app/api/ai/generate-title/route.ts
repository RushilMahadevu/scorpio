import { NextResponse } from "next/server";

function resolveApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  throw new Error("Gemini API key is not configured");
}

export async function POST(req: Request) {
  try {
    const { userMessage, aiResponse, context } = await req.json();

    const prompt = `
      You are a specialized title generator for an AI ${context || "Tutor"}.
      Based on the following first interaction between a student and the AI, generate a concise, descriptive title for the chat session.
      
      RULES:
      - Max 4-5 words.
      - Do NOT use quotes around the title.
      - Focus on the specific physics concept or problem being discussed.
      - Be professional yet friendly.
      - Example: "Newton's Second Law Help", "Kinematics Problem Set", "Refraction Concept", "Calculus in Physics".

      USER: ${userMessage}
      AI: ${(aiResponse || "").slice(0, 300)}...

      TITLE:`;

    const apiKey = resolveApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 50 },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn("Title generation API returned error:", errBody);
      return NextResponse.json({ title: "New Chat" });
    }

    const data = await res.json();
    const rawTitle = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const title = rawTitle.trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ title: title || "New Chat" });
  } catch (error: any) {
    console.error("Title generation error:", error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
