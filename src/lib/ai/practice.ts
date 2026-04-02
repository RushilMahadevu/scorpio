import { model } from "./config";

export async function generatePracticeProblem(
  topic: string,
  difficulty: string,
  progress: number = 0
): Promise<{ problem: any, usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    const varietySeed = Math.random().toString(36).substring(7);
    const prompt = `Generate a high-quality physics problem for the topic: ${topic} at ${difficulty} level.
    Current Unit Progress: ${progress + 1}. Variety Key: ${varietySeed}. 
    
    IMPORTANT: Provide variety. If Unit Progress > 1, create a scenario that is distinct from common introductory examples in this topic. 

    Return ONLY a JSON object with:
    {
      "problem": "detailed physics scenario description. Surround EVERY mathematical variable, unit, and formula with $...$ (e.g. $m=5.0\\\\text{ kg}$, $v=0$).",
      "latex": "The core formula needed (e.g. \\\\\\\\Delta x = v_0t + \\\\\\\\frac{1}{2}at^2).",
      "correctAnswer": "numerical value only (as a string)",
      "unit": "unit abbreviation",
      "explanation": "comprehensive step-by-step logic. Surround ALL math symbols, formulas, and variables with $...$ or $$...$$. Use clear LaTeX.",
      "hints": ["hint 1", "hint 2", "hint 3"]
    }
    Requirements:
    - Numerical accuracy is paramount.
    - Provide variety in values and scenario context.
    - DO NOT use unescaped backslashes in the JSON output. All TeX commands must be double-escaped: \\\\\\\\frac, \\\\\\\\Delta, etc.
    - Always use $...$ for variables in text (do not write PE, write $P.E.$).
    - Return ONLY the JSON object.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.8,
        responseMimeType: "application/json",
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    });

    const response = await result.response;
    let text = response.text().trim();

    if (!text) {
      // Check if it was blocked by safety
      const safetyRatings = response.promptFeedback?.safetyRatings;
      if (safetyRatings?.some(r => r.blocked)) {
        throw new Error("AI output blocked for safety reasons. Please adjust your research topic.");
      }
      throw new Error("AI returned an empty data stream.");
    }

    // Isolation logic for robustness
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      console.error("Malformed AI Response (No JSON brackets):", text);
      throw new Error(`The physics engine failed to structure a valid response (Length: ${text.length}).`);
    }

    const cleanJson = text.substring(startIdx, endIdx + 1).trim();
    
    try {
      // First attempt: raw parse should work with JSON mode
      const rawParsed = JSON.parse(cleanJson);
      return {
        problem: rawParsed,
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount || 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount || 0
        }
      };
    } catch (e1) {
      // Robust backup: sanitize common AI JSON formatting errors
      const sanitized = cleanJson
        .replace(/\\n/g, '__NL__')
        .replace(/\\(?!["\\\/bfnrtu])/g, '\\\\') // Double escape backslashes if not valid JSON escape sequences
        .replace(/__NL__/g, '\\n')
        .replace(/,\s*([\}\]])/g, '$1') // Remove trailing commas
        .replace(/[\n\r]/g, ' ') // Flatten newlines
        .trim();

      try {
        const parsed = JSON.parse(sanitized);
        return {
          problem: parsed,
          usage: {
            inputTokens: response.usageMetadata?.promptTokenCount || 0,
            outputTokens: response.usageMetadata?.candidatesTokenCount || 0
          }
        };
      } catch (e2) {
        console.error("Critical JSON Parse Failure:", sanitized);
        throw new Error("The physics engine returned an unstable result. Retrying...");
      }
    }
  } catch (error: any) {
    console.error("generatePracticeProblem error:", error);
    throw error;
  }
}
