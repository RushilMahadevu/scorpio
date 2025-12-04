import { getGenerativeModel } from "firebase/ai";
import { genAI } from "@/lib/firebase";

const model = getGenerativeModel(genAI, { model: "gemini-2.5-flash" });

export async function explainPhysicsConcept(concept: string): Promise<string> {
  try {
    const prompt = `Explain the physics concept: "${concept}" in simple terms suitable for a high school student. Keep it concise.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error explaining concept:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Sorry, I couldn't explain that concept right now.";
  }
}

export async function helpSolveProblem(problem: string): Promise<string> {
  try {
    const prompt = `Help me solve this physics problem step-by-step: "${problem}". Do not just give the answer, explain the steps clearly.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error solving problem:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Sorry, I couldn't help solve that problem right now.";
  }
}

export async function gradeResponse(question: string, answer: string): Promise<string> {
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

export async function generateAssignmentQuestions(topic: string, count: number, difficulty: string): Promise<any[]> {
  try {
    const prompt = `Generate ${count} physics questions about "${topic}" at a ${difficulty} difficulty level.
    Return ONLY a raw JSON array of objects. Do not include any other text.
    Each object must have:
    - "text": The question text.
    - "type": "multiple-choice"
    - "options": An array of 4 strings.
    - "correctAnswer": The correct answer string (must be one of the options).
    
    Example format:
    [{"text": "Q1", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown or extra text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}
