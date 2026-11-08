import { model } from "./config";

export async function getNavigationResponse(
  message: string,
  userRole: 'student' | 'teacher',
  featuresContext: string,
  systemPrompt: string
): Promise<{ text: string, usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    const fullPrompt = `${systemPrompt}

${userRole.toUpperCase()} FEATURES:
${featuresContext}

User role: ${userRole}
User question: ${message}

Formatting & Markdown Instructions:
- Format your response using clean Markdown with bolding, lists, and links where appropriate.
- When referencing or suggesting navigation to platform pages, use standard Markdown links using the paths above (e.g. [Assignments](/student/assignments) or [Grades](/student/grades)) or wrap the path in parentheses like (/student/grades).
- Keep responses concise, warm, helpful, and direct.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1,
      }
    });
    const response = await result.response;
    
    return {
      text: response.text(),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      }
    };
  } catch (error) {
    console.error("Error getting navigation response:", error);
    return { 
      text: "I'm sorry, I'm having trouble processing your request right now." 
    };
  }
}

export async function getLandingChatbotResponse(
  message: string,
  systemPrompt: string
): Promise<{ text: string, usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nVisitor question: ${message}` }] }],
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
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      }
    };
  } catch (error) {
    console.error("Error getting landing chatbot response:", error);
    return { text: "I'm having trouble processing your request right now. Please try again." };
  }
}
