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
    const scrubbedMessage = scrubPII(concept, studentNames);
    const historyContext = chatHistory.length > 0 
      ? `=== PREVIOUS CONVERSATION HISTORY ===\n${formatChatHistory(chatHistory.map(m => ({ ...m, content: scrubPII(m.content, studentNames) })))}\n=====================================\n\n` 
      : "";
    
    const prompt = `${constraints}

${historyContext}Student's latest message: "${scrubbedMessage}"

Instructions for your response:
1. Context & Conversational Continuity:
   - Always interpret the student's message in the context of the previous conversation.
   - If the student sends an affirmation, agreement, or continuation (e.g. "yeah lets do it", "sure", "yes", "continue", "sounds good"), seamlessly advance the topic without meta-commenting on their phrasing or stating that their phrase is not a physics concept.
   - If you previously offered choices (e.g. "Would you like to explore examples or discuss Faraday's Law?"), and the student responds generally (e.g. "yeah lets do it"), immediately pick the most natural next step (e.g. introduce Faraday's Law with a clear, engaging physical example) and explain it.
   - If the student asks a specific physics question or names a new concept, provide a clear, concise explanation suitable for high school and AP physics students.
2. Pedagogical Style & Notation:
   - Explain physics concepts with intuitive physical intuition, clear step-by-step logic, and proper LaTeX notation ($...$ or $$...$$) for formulas and variables.
   - Keep responses concise and engaging.
   - End with a thought-provoking check for understanding or offer a natural next concept/example.`;
    
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
    const scrubbedMessage = scrubPII(problem, studentNames);
    const historyContext = chatHistory.length > 0 
      ? `=== PREVIOUS CONVERSATION HISTORY ===\n${formatChatHistory(chatHistory.map(m => ({ ...m, content: scrubPII(m.content, studentNames) })))}\n=====================================\n\n` 
      : "";
    
    const context = assignmentContext ? `=== STUDENT'S CURRENT ASSIGNMENT CONTEXT ===\n${scrubPII(assignmentContext, studentNames)}\n==========================================\n\n` : "";
    const prompt = `${constraints}

${context}${historyContext}Student's latest message: "${scrubbedMessage}"

Instructions for your response:
1. Socratic Guidance:
   - Guide the student through the physics problem step-by-step using the Socratic method. Never give away the final numerical answer directly.
   - If the student gave an answer or attempted a step, evaluate their reasoning with encouragement and guide them to the next step.
   - If they say "yes", "continue", "I'm ready", or ask what to do next, provide the next guiding question or hint.
2. Assignment Context:
   - You have full access to the "=== STUDENT'S CURRENT ASSIGNMENT CONTEXT ===" if provided above.
   - If the student asks about "Question 1" and the text for that question is in the context, refer directly to it.
   - NEVER say "I cannot see the assignment" or "I don't have access to the text" if the information IS provided in the context above.
3. Notation & Conciseness:
   - Format equations, symbols, and units in proper LaTeX ($...$ or $$...$$).
   - Keep your guidance concise and focused on the student's immediate blocker.`;
    
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
