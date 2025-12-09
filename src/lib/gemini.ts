import { getGenerativeModel } from "firebase/ai";
import { genAI } from "@/lib/firebase";

const model = getGenerativeModel(genAI, { model: "gemini-2.5-flash" });

export async function explainPhysicsConcept(concept: string): Promise<string> {
  try {
    const prompt = `Explain the physics concept: "${concept}" in simple terms suitable for a high school student. Keep it concise.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Explain concept response:", response);
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

export async function generateAssignmentQuestions(topic: string, count: number, difficulty: string, questionType: string = "mixed"): Promise<any[]> {
  try {
    const prompt = `Generate ${count} physics questions about "${topic}" at a ${difficulty} difficulty level.
    The question type should be: ${questionType}.
    If "mixed", generate a variety of types (multiple-choice, true-false, short-answer, text).
    
    Return ONLY a raw JSON array of objects. Do not include any other text.
    Each object must have:
    - "text": The question text.
    - "type": One of "multiple-choice", "true-false", "short-answer", "text".
    - "options": An array of strings (required for multiple-choice, optional for others).
    - "correctAnswer": The correct answer string (or sample answer for "text").
    
    For "true-false", options should be ["True", "False"].
    For "short-answer" and "text", options can be empty.
    
    Example format:
    [
      {"text": "Q1", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A"},
      {"text": "Q2", "type": "true-false", "options": ["True", "False"], "correctAnswer": "True"},
      {"text": "Q3", "type": "short-answer", "options": [], "correctAnswer": "The answer"},
      {"text": "Q4", "type": "text", "options": [], "correctAnswer": "Detailed explanation..."}
    ]`;
    
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
