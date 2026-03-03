import { NextResponse } from "next/server";
import { getGenerativeModel } from "firebase/ai";
import { genAI } from "@/lib/firebase";

const model = getGenerativeModel(genAI, { 
  model: "gemini-2.0-flash", // Using standard stable flash
});

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
      AI: ${aiResponse.slice(0, 300)}...

      TITLE:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ title: title || "New Chat" });
  } catch (error: any) {
    console.error("Title generation error:", error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
