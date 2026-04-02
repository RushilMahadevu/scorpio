import { model } from "./config";
import { splitIntoQuestions, validateAndNormalizeQuestions } from "./utils";

// Helper: Parse a single batch of questions using Gemini
async function parseSingleBatch(batchText: string, startNumber: number, model: any): Promise<{ questions: any[], usage: { inputTokens: number, outputTokens: number } }> {
  const prompt = `Parse these quiz questions into a JSON array. Return ONLY the JSON array, no markdown, no other text.

QUESTIONS:
${batchText}

Return a JSON array where each object has:
- "text": question text (string)
- "type": "multiple-choice", "true-false", "short-answer", or "text" (string)
- "options": array of option strings (empty array if not multiple choice)
- "correctAnswer": the correct answer (string)

IMPORTANT: 
- Return ONLY the JSON array starting with [ and ending with ]
- Do NOT include markdown code blocks
- Do NOT include any explanatory text
- Ensure the JSON is complete and valid

Example: [{"text":"What is 2+2?","type":"multiple-choice","options":["2","3","4","5"],"correctAnswer":"4"}]

JSON array:`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.1,
      responseMimeType: "application/json",
    }
  });
  const response = await result.response;
  let responseText = response.text().trim();
  
  // Extract only the array portion for robustness
  const startIdx = responseText.indexOf('[');
  const endIdx = responseText.lastIndexOf(']');
  
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Failed to extract JSON array from batch starting at ${startNumber}`);
  }
  
  let cleanJson = responseText.substring(startIdx, endIdx + 1).trim();
  
  try {
    const parsed = JSON.parse(cleanJson);
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed result is not an array');
    }
    return {
      questions: parsed,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (e) {
    throw new Error(`Failed to parse questions in batch starting at ${startNumber}. Error: ${e instanceof Error ? e.message : 'Invalid JSON format'}`);
  }
}

/**
 * Simple rule-based parser that doesn't use AI - faster and more reliable for standard formats
 */
export function parseQuestionsManually(text: string): any[] {
  const questions: any[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let currentQuestion: any = null;
  let currentOptions: string[] = [];
  let lastWasOptions = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip section headers
    if (/^(Multiple Choice|Short Answer|True\/?False|THERMODYNAMICS|Waves and Sound|Physics Quiz)/i.test(line)) {
      continue;
    }
    
    // Check for "Question N:" format
    const questionPrefixMatch = line.match(/^Question\s+(\d+):\s*(.+)$/i);
    // Check for "N." or "N)" format (must have substantial text)
    const questionNumberMatch = line.match(/^(\d+)[\.)]\s*(.{10,})$/);
    
    if (questionPrefixMatch || questionNumberMatch) {
      // Save previous question
      if (currentQuestion) {
        currentQuestion.options = currentOptions;
        questions.push(currentQuestion);
      }
      
      // Extract question text
      let questionText = questionPrefixMatch ? questionPrefixMatch[2] : questionNumberMatch![2];
      
      // Check if options are inline in the question text
      const inlineOptionsMatch = questionText.match(/^(.+?)\s+([A-D]\).*(?:[A-D]\).*)+)$/);
      
      if (inlineOptionsMatch) {
        // Question has inline options
        questionText = inlineOptionsMatch[1].trim();
        const optionsText = inlineOptionsMatch[2];
        
        // Parse inline options
        const optionParts = optionsText.split(/(?=[A-D]\))/);
        currentOptions = [];
        
        for (const part of optionParts) {
          const trimmed = part.trim();
          if (trimmed) {
            // Remove letter and extract option text (stop at next letter or "Answer:")
            const option = trimmed
              .replace(/^[A-D]\)\s*/, '')
              .replace(/\s+Answer:.*$/, '')
              .trim();
            if (option) {
              currentOptions.push(option);
            }
          }
        }
        
        currentQuestion = {
          text: questionText,
          type: 'multiple-choice',
          options: [],
          correctAnswer: '',
        };
        lastWasOptions = true;
      } else {
        // No inline options
        currentQuestion = {
          text: questionText,
          type: 'text',
          options: [],
          correctAnswer: '',
        };
        currentOptions = [];
        lastWasOptions = false;
      }
    }
    // Check for options with various formats: A), a), (A), (1), 1), - Option
    else if (currentQuestion && /^[\(\[]?[A-Da-d1-4][\)\.\]]\s+.+|^[-•]\s+.+/.test(line)) {
      // Extract the option text (remove the prefix)
      const option = line
        .replace(/^[\(\[]?[A-Da-d1-4][\)\.\]]\s*/, '')
        .replace(/^[-•]\s*/, '')
        .trim();
      
      if (option && !option.toLowerCase().startsWith('answer')) {
        currentOptions.push(option);
        currentQuestion.type = 'multiple-choice';
        lastWasOptions = true;
      }
    }
    // Check for "Options:" label
    else if (/^Options:\s*$/i.test(line)) {
      lastWasOptions = false; // Next lines will be options
      continue;
    }
    // Check for various answer formats
    else if (/^(Answer|Correct Answer):\s*/i.test(line)) {
      const answer = line.replace(/^(Answer|Correct Answer):\s*/i, '').trim();
      
      if (currentQuestion && answer) {
        // For multiple choice with letter answers
        if (currentQuestion.type === 'multiple-choice') {
          // Check if answer is a letter (A, B, C, D) or number (1, 2, 3, 4)
          const letterMatch = answer.match(/^([A-Da-d])$/i);
          const numberMatch = answer.match(/^([1-4])$/);
          
          if (letterMatch) {
            const letterIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
            if (letterIndex >= 0 && letterIndex < currentOptions.length) {
              currentQuestion.correctAnswer = currentOptions[letterIndex];
            }
          } else if (numberMatch) {
            const numberIndex = parseInt(numberMatch[1]) - 1;
            if (numberIndex >= 0 && numberIndex < currentOptions.length) {
              currentQuestion.correctAnswer = currentOptions[numberIndex];
            }
          } else {
            // Answer is the full text
            currentQuestion.correctAnswer = answer;
          }
        } else {
          // For short answer questions
          currentQuestion.correctAnswer = answer;
          if (currentOptions.length === 0) {
            currentQuestion.type = 'short-answer';
          }
        }
      }
      lastWasOptions = false;
    }
    // Check for True/False answers
    else if (currentQuestion && /^(True|False)$/i.test(line) && !lastWasOptions) {
      if (currentOptions.length === 0) {
        currentOptions.push('True', 'False');
        currentQuestion.type = 'true-false';
        lastWasOptions = true;
      }
    }
    // Check if line contains "Use" (formula hint)
    else if (currentQuestion && /^Use\s+/i.test(line)) {
      currentQuestion.text += ' ' + line;
    }
    // Continuation of question text
    else if (currentQuestion && !lastWasOptions && currentOptions.length === 0 && line.length > 3) {
      if (/[a-zA-Z?]/.test(line) && !line.match(/^[A-D]\)/)) {
        currentQuestion.text += ' ' + line;
      }
    }
  }
  
  // Save last question
  if (currentQuestion) {
    currentQuestion.options = currentOptions;
    questions.push(currentQuestion);
  }
  
  // Clean up and validate
  return questions
    .map(q => ({
      ...q,
      text: q.text.trim().replace(/\s+/g, ' '),
      correctAnswer: q.correctAnswer.trim(),
    }))
    .filter(q => q.text.length > 5);
}

export async function generateAssignmentQuestions(
  topic: string, 
  count: number, 
  difficulty: string, 
  questionType: string = "mixed",
  learningObjectives?: string
): Promise<{ questions: any[], usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    const prompt = `You are an expert curriculum designer.
    Generate ${count} professional and academic questions about "${topic}" at a ${difficulty} level.

    ${learningObjectives ? `CONTEXT/LEARNING OBJECTIVES:\n"${learningObjectives}"\n` : ""}

    Question type: ${questionType} (if mixed, generate a variety).

    INSTRUCTIONS:
    1. Core Principles: Focus on fundamental concepts and accurate representation.
    2. LaTeX Support: ALWAYS use LaTeX for math/physics formulas (e.g., $E=mc^2$).
    3. Rubric Synthesis: Provide a grading guide or correct answer for EVERY question.
    4. Quality: Ensure high academic standards for the ${difficulty} target.

    Return ONLY a valid JSON object. Do not include any comments or extra characters.
    Format:
    {
      "questions": [
        {
          "text": "Question text using LaTeX...",
          "type": "multiple-choice | true-false | short-answer | text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "Answer or scoring guide...",
          "points": 10
        }
      ]
    }
    `;
    
    // Explicitly set generation configuration for JSON response
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });
    const response = await result.response;
    let text = response.text()?.trim() || "";
    
    // Check if the response was truncated by the model
    const finReason = response.candidates?.[0]?.finishReason;
    // @ts-ignore
    const isTruncated = finReason === 'MAX_TOKENS' || text.endsWith('...');
    
    // Safety check for empty or blocked response
    if (!text || text.length < 2) {
      throw new Error("AI returned an empty response. Please try with a more specific topic.");
    }

    // Aggressive cleanup for JSON results
    // 1. Remove Markdown code blocks if present
    if (text.includes("```")) {
      text = text.replace(/```json\n?|```\n?|```$/g, "").trim();
    }
    
    // 2. Identify the likely JSON structure (could be an array or an object)
    const jsonStartIdx = text.search(/[\[\{]/);
    const jsonEndIdx = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
    
    if (jsonStartIdx === -1 || jsonEndIdx === -1) {
        console.error("AI did not return any JSON structure. Raw text:", text);
        const err = new Error("AI returned a non-JSON response. Please try adjusting the topic context.");
        (err as any).rawText = text;
        throw err;
    }

    const cleanJson = text.substring(jsonStartIdx, jsonEndIdx + 1).trim();
    
    let parsedData: any;
    try {
        // Remove comments
        const sanitizeJson = cleanJson
          .replace(/\/\/.*/g, '') 
          .replace(/\/\*[\s\S]*?\*\//g, '');
          
        parsedData = JSON.parse(sanitizeJson);
    } catch (parseError) {
        console.error("Error parsing AI JSON:", cleanJson);
        try {
            // Very aggressive recovery for truncated JSON
            let recovery = cleanJson
              .replace(/,\s*\]/g, ']') 
              .replace(/,\s*\}/g, '}') 
              .replace(/[\n\r]/g, ' '); 
            
            // If it's still failing and looks truncated, try to close it
            if (!recovery.endsWith('}') && !recovery.endsWith(']')) {
                // Heuristic: determine if we are inside a string or array
                let openBrackets = (recovery.match(/\[/g) || []).length;
                let closeBrackets = (recovery.match(/\]/g) || []).length;
                let openCurly = (recovery.match(/\{/g) || []).length;
                let closeCurly = (recovery.match(/\}/g) || []).length;
                
                // If we're inside a string (odd number of unescaped quotes)
                const quotes = (recovery.match(/(^|[^\\])\"/g) || []).length;
                if (quotes % 2 !== 0) {
                  // If ends with a partial escape, strip it
                  if (recovery.endsWith('\\')) recovery = recovery.slice(0, -1);
                  recovery += '\"';
                }

                // Balance the brackets and braces
                while (openCurly > closeCurly) {
                  recovery += '}';
                  closeCurly++;
                }
                while (openBrackets > closeBrackets) {
                  recovery += ']';
                  closeBrackets++;
                }
            }
            
            parsedData = JSON.parse(recovery);
        } catch (e) {
            // Check if truncate reason was tokens
            const isTruncated = (response as any).candidates?.[0]?.finishReason === 'MAX_TOKENS';
            
            const err = new Error(
              isTruncated 
                ? "The assignment was too long for the AI to finish. Try generating fewer questions or a less complex topic."
                : "AI generated an incomplete or invalid question format. This usually happens with very complex topics; try a more specific topic."
            );
            (err as any).rawText = text;
            throw err;
        }
    }

    return {
      questions: validateAndNormalizeQuestions(parsedData),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (error) {
    console.error("Error generating questions:", error);
    if (error instanceof Error) throw error;
    return { questions: [] };
  }
}

/**
 * Parses pasted text (from Google Forms, Word, etc.) and extracts questions
 * using AI to intelligently identify question text, types, and options
 */
export async function parseQuestionsFromText(text: string): Promise<{ questions: any[], usage?: { inputTokens: number, outputTokens: number } }> {
  try {
    // Split text into individual questions first
    const questionChunks = splitIntoQuestions(text);
    if (questionChunks.length === 0) {
      throw new Error("No questions found in the text. Please check the format.");
    }
    // Process in batches of 5 questions to avoid token limits
    const BATCH_SIZE = 5;
    const allQuestions: any[] = [];
    let totalPromptTokens = 0;
    let totalCandidateTokens = 0;

    for (let i = 0; i < questionChunks.length; i += BATCH_SIZE) {
      const batch = questionChunks.slice(i, i + BATCH_SIZE);
      const batchText = batch.join('\n\n');
      const { questions: batchQuestions, usage } = await parseSingleBatch(batchText, i + 1, model);
      
      if (usage) {
        totalPromptTokens += usage.inputTokens;
        totalCandidateTokens += usage.outputTokens;
      }
      
      allQuestions.push(...batchQuestions);
      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < questionChunks.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return {
      questions: validateAndNormalizeQuestions(allQuestions),
      usage: { inputTokens: totalPromptTokens, outputTokens: totalCandidateTokens }
    };
  } catch (error) {
    console.error("Error parsing questions from text:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while parsing questions.");
  }
}
