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

If suggesting navigation, wrap the path in parentheses like this: (/student/grades)`;

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
