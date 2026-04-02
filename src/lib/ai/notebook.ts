import { model } from "./config";

/**
 * Generates a response from the AI assistant for the Digital Notebook.
 */
export async function getNotebookAssistantResponse(
  messages: { role: "user" | "assistant", content: string }[],
  notebookContent: string
) {
  try {
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    const systemPrompt = `You are a helpful, EXTREMELY CONCISE study assistant. 
    Analyze the user's notes and questions. 
    Provide direct, short answers. Use bullet points for lists. 
    Keep responses brief (max 2-3 short paragraphs) unless a deep dive is requested.
    
    Current Notebook Content:
    """
    ${notebookContent}
    """
    
    Guidelines:
    1. Help the student summarize, organize, or expand their research notes.
    2. Suggest follow-up questions or related topics based on their writing.
    3. If they ask about homework or physics, use your expertise to guide them through the process rather than just providing answers.
    4. Keep your tone encouraging, academic, and professional.
    5. BE CONCISE. Avoid fluff and keep responses succinct.`;

    // We send the system prompt as part of the context since "system" role isn't universally supported in this SDK version
    const lastUserMessage = messages[messages.length - 1].content;
    const prompt = `${systemPrompt}\n\nStudent Query: ${lastUserMessage}`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error("Assistant chat error:", error);
    throw error;
  }
}
