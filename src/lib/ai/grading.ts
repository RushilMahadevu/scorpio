import { model } from "./config";
import { scrubPII, classifyQuestion } from "./utils";

export async function gradeResponse(
  question: string, 
  answer: string, 
  rubric?: string,
  studentNames: string[] = []
): Promise<{ 
  score: number, 
  feedback: string, 
  reasoning?: string,
  usage?: { inputTokens: number, outputTokens: number } 
}> {
  try {
    // Basic verification of inputs
    if (!question || !answer) {
      return { score: 0, feedback: "Missing question or answer text for grading." };
    }

    const prompt = `You are an expert Physics professor and evaluator. 
    Your goal is to grade student responses with scientific rigor.

    QUESTION:
    "${scrubPII(question, studentNames)}"

    ${rubric ? `GRADING RUBRIC / CORRECT REFERENCE:\n"${scrubPII(rubric, studentNames)}"` : ''}

    STUDENT SUBMISSION:
    "${scrubPII(answer, studentNames)}"
    
    INSTRUCTIONS:
    1. UNIT SENSITIVITY: In physics, numbers without units are meaningless. If the numerical value is correct but units are missing or incorrect (e.g., Joules instead of Watts), penalize the score by 10-20%.
    2. VECTOR QUANTITIES: For vectors (Force, Velocity, Acceleration, Momentum), ensure the direction is identified if the question requires it.
    3. SIGNIFICANT FIGURES: Check if the precision of the answer is reasonable given the inputs.
    4. ERROR CARRIED FORWARD: If a student uses an incorrect answer from a previous part correctly in the current part, award full credit for the current part's logic.
    5. CALCULATION ERRORS: If the student shows correct logical derivation but makes a minor math error, award 50-70% partial credit.
    6. Provide a score from 0.0 to 10.0 (decimals allowed).
    7. Generate "technical_reasoning": Explain precisely why the score was given, citing units, vectors, or logic.
    8. Generate "student_feedback": Provide instructional feedback that helps correct physics misconceptions.
    9. Identify "misconceptions": List specific physics misunderstandings (e.g., "confusing mass with weight").

    Return ONLY a JSON object:
    {
      "score": number,
      "technical_reasoning": string,
      "student_feedback": string,
      "misconceptions": string[]
    }`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });
    const response = await result.response;
    
    let text = "";
    try {
        text = response.text();
    } catch (textError) {
        console.error("Failed to get text from AI response:", textError);
        // Check if it's a safety block
        if (response.candidates && response.candidates[0]?.finishReason === 'SAFETY') {
            return { score: 0, feedback: "Response blocked by safety filters. Please review manually." };
        }
        throw textError;
    }
    
    if (!text) {
        throw new Error("AI returned empty response");
    }

    // Robust JSON extraction: Find the first '{' and last '}'
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      console.error("No JSON found in AI response. Raw text:", text);
      throw new Error("Invalid format from AI grader");
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1).trim();
    
    try {
        const data = JSON.parse(jsonStr);
        
        // Ensure score is a number and capped
        let score = 0;
        if (typeof data.score === 'number') {
            score = Math.min(10, Math.max(0, data.score));
        } else if (typeof data.score === 'string') {
            // Handle cases like "8/10"
            if (data.score.includes('/')) {
                const parts = data.score.split('/');
                const num = parseFloat(parts[0]);
                const den = parseFloat(parts[1]) || 10;
                score = (num / den) * 10;
            } else {
                score = parseFloat(data.score) || 0;
            }
            score = Math.min(10, Math.max(0, score));
        }

        return {
            score,
            feedback: data.student_feedback || data.feedback || "No feedback provided.",
            reasoning: data.technical_reasoning || data.reasoning || "",
            usage: {
                inputTokens: response.usageMetadata?.promptTokenCount || 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount || 0
            }
        };
    } catch (parseError) {
        console.error("Error parsing AI response. Raw text:", text);
        return { 
            score: 0, 
            feedback: "Evaluation format error. The grader output was not valid JSON.", 
            usage: {
                inputTokens: response.usageMetadata?.promptTokenCount || 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount || 0
            }
        };
    }

  } catch (error: any) {
    console.error("Error in gradeResponse:", error);
    return { 
        score: 0, 
        feedback: `Grading engine error: ${error?.message || "Unknown error"}. Please check manually.`,
        reasoning: `Error details: ${JSON.stringify(error)}`
    };
  }
}

export async function synthesizeRubric(questionText: string, topic: string): Promise<{ text: string, usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    const prompt = `
      You are an academic curriculum assistant.
      Your task is to create a detailed Scoring Guide for a question about "${topic}".

      QUESTION: "${questionText}"

      Please provide:
      1. Essential Concepts: What must the student demonstrate understanding of?
      2. Scoring Breakdown: What specific elements earn points?
      3. Common Mistakes: What should be penalized?
      4. Model Answer: An ideal response.

      Use clear Markdown. Be professional and constructive.
    `;

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
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      }
    };
  } catch (error) {
    console.error("Error synthesizing rubric:", error);
    return { text: "Failed to synthesize rubric. Please provide manual guidelines." };
  }
}

export interface ValidationResult {
  passed: boolean;
  violations: string[];
}

export function validateResponse(response: string, question?: string): ValidationResult {
  const violations: string[] = [];
  const questionType = question ? classifyQuestion(question) : 'declarative'; // Default if no question provided

  // Only check for direct answers in problem-solving contexts
  if (questionType === 'problem-solving') {
    // Check for direct numerical answers without guidance
    const hasNumbers = /\d+\.?\d*/.test(response);
    const hasGuidance = /step|explain|why|how|think|consider/i.test(response);
    if (hasNumbers && !hasGuidance) {
      violations.push("Direct numerical answer without guidance");
    }
  }

  // Check for missing units on numerical values (always apply)
  const numbersWithoutUnits = response.match(/\d+\.?\d*(?!\s*[a-zA-Z²³°%])/g);
  if (numbersWithoutUnits && numbersWithoutUnits.length > 0) {
    violations.push("Missing units on numerical values");
  }

  // Check for missing vector notation when discussing vectors (always apply)
  if (response.toLowerCase().includes("vector") && !response.includes("\\vec{")) {
    violations.push("Missing vector notation when discussing vectors");
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
