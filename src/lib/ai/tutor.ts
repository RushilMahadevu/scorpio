import { model, CONTEXT_WINDOW_SIZE } from "./config";
import { scrubPII } from "./utils";
import { CONSTRAINT_LEVELS, ConstraintLevel } from "./constants";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function formatChatHistory(messages: ChatMessage[]): string {
  // Take last N messages for context
  const recentMessages = messages.slice(-CONTEXT_WINDOW_SIZE);
  
  return recentMessages
    .map(msg => `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}`)
    .join("\n\n");
}

export async function explainPhysicsConcept(
  concept: string, 
  chatHistory: ChatMessage[] = [],
  constraintLevel: ConstraintLevel = "FULL",
  studentNames: string[] = []
): Promise<{ text: string, usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    const constraints = CONSTRAINT_LEVELS[constraintLevel];
    const historyContext = chatHistory.length > 0 
      ? `Previous conversation:\n${formatChatHistory(chatHistory.map(m => ({ ...m, content: scrubPII(m.content, studentNames) })))}\n\n` 
      : "";
    
    const prompt = `${constraints}\n\n${historyContext}Explain the physics concept: "${scrubPII(concept, studentNames)}" in simple terms suitable for a high school student. Keep it concise. If this relates to our previous conversation, build on that context.`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    });
    const response = await result.response;
    return {
      text: response.text(),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error("Error explaining concept:", error);
    if (error instanceof Error) {
      return { text: `Error: ${error.message}` };
    }
    return { text: "Sorry, I couldn't explain that concept right now." };
  }
}

export async function helpSolveProblem(
  problem: string, 
  chatHistory: ChatMessage[] = [],
  constraintLevel: ConstraintLevel = "FULL",
  assignmentContext?: string,
  studentNames: string[] = []
): Promise<{ text: string, usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    const constraints = CONSTRAINT_LEVELS[constraintLevel];
    const historyContext = chatHistory.length > 0 
      ? `Previous conversation:\n${formatChatHistory(chatHistory.map(m => ({ ...m, content: scrubPII(m.content, studentNames) })))}\n\n` 
      : "";
    
    const context = assignmentContext ? `=== STUDENT'S CURRENT ASSIGNMENT CONTEXT ===\n${scrubPII(assignmentContext, studentNames)}\n==========================================\n\n` : "";
    const prompt = `${constraints}\n\n${context}${historyContext}The student is asking: "${scrubPII(problem, studentNames)}". 
    
    IMPORTANT: You have full access to the "=== STUDENT'S CURRENT ASSIGNMENT CONTEXT ===" above. 
    - If the student asks about "Question 1" and the text for that question is empty in the context, check the assignment title and description.
    - If you genuinely cannot find information about a specific question in the provided context, ask the student to clarify or paste the question text.
    - If asked about concepts or formulas, refer to the context first before explaining.
    - NEVER say "I cannot see the assignment" or "I don't have access to the text" if the information IS provided in the context above.
    
    Help the student think through the problem step-by-step using the Socratic method. Do not just give the answer.`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    });
    const response = await result.response;
    return {
      text: response.text(),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error("Error solving problem:", error);
    if (error instanceof Error) {
      return { text: `Error: ${error.message}` };
    }
    return { text: "Sorry, I couldn't help solve that problem right now." };
  }
}
