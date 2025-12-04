import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function explainPhysicsConcept(concept: string): Promise<string> {
  if (!apiKey) return "Gemini API key is missing. Please configure GEMINI_API_KEY in .env.local";
  try {
    const prompt = `Explain the physics concept: "${concept}" in simple terms suitable for a high school student.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error explaining concept:", error);
    return "Sorry, I couldn't explain that concept right now.";
  }
}

export async function helpSolveProblem(problem: string): Promise<string> {
  if (!apiKey) return "Gemini API key is missing. Please configure GEMINI_API_KEY in .env.local";
  try {
    const prompt = `Help me solve this physics problem step-by-step: "${problem}". Do not just give the answer, explain the steps.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error solving problem:", error);
    return "Sorry, I couldn't help solve that problem right now.";
  }
}

export async function gradeResponse(question: string, answer: string): Promise<string> {
  if (!apiKey) return "Gemini API key is missing. Cannot grade.";
  try {
    const prompt = `Grade the following student answer for the physics question: "${question}".
    Student Answer: "${answer}"
    Provide a score out of 10 and brief feedback. Format: "Score: X/10. Feedback: ..."`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error grading response:", error);
    return "Error grading response.";
  }
}
