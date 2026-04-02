/**
 * Scrubs Personal Identifiable Information (PII) from text before sending to LLM.
 * Targets: Emails, common phone numbers, addresses, and potential ID patterns.
 * This is a critical compliance step for FERPA/COPPA.
 * 
 * @param text The input string to scrub
 * @param studentNames Optional list of names to mask (e.g., student roster)
 */
export function scrubPII(text: string, studentNames: string[] = []): string {
  if (!text) return text;
  
  let scrubbed = text
    // Email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
    
    // Improved Phone numbers: requires some form of separator or parentheses to avoid matching 10-digit physics values
    // Matches: (123) 456-7890, 123-456-7890, 123.456.7890, +1 123 456 7890
    .replace(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g, "[PHONE]")
    
    // Generic ID patterns (e.g. SSN-like 9-digit patterns)
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[ID]")
    
    // Student ID Patterns (Customizable but targets common school formats)
    // Matches: ID: 1234567, Student #123456
    .replace(/\b(ID|Student\s?#?|ID\s?#?):?\s?\d{5,9}\b/gi, "[STUDENT_ID]")
    
    // Simple Address pattern (Street/Ave/Building etc.)
    .replace(/\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Ter|Terrace|Way)\.?\b/gi, "[ADDRESS]")
    
    // Date of birth pattern (matches near DOB keywords)
    .replace(/(?:DOB|Birth|Born)(?:\s+on)?\s*[:\-]?\s*(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b[A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4}\b)/gi, "[BIRTH_DATE]")
    .replace(/\b(19|20)\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g, "[DATE]") // Specific YYYY-MM-DD
    .replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-](19|20)\d{2}\b/g, "[DATE]") // Specific MM/DD/YYYY
    
    // Credit card numbers (Simple 13-16 digit check)
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[SENSITIVE]");

  // Mask student names if provided (case-insensitive)
  if (studentNames.length > 0) {
    // Collect all name parts to catch "First Last", "First", or "Last" independently
    const nameParts = new Set<string>();
    studentNames.forEach(fullName => {
      if (!fullName) return;
      nameParts.add(fullName);
      const split = fullName.split(/\s+/);
      if (split.length > 1) {
        split.forEach(part => {
          if (part.length > 2 && !['and', 'the', 'with'].includes(part.toLowerCase())) {
            nameParts.add(part);
          }
        });
      }
    });

    // Sort by length descending to catch full names before part names
    const sortedParts = Array.from(nameParts).sort((a, b) => b.length - a.length);

    sortedParts.forEach((name) => {
      if (name && name.length > 2) {
        // Create regex for the name with word boundaries
        const nameRegex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        scrubbed = scrubbed.replace(nameRegex, "[NAME]");
      }
    });
  }

  return scrubbed;
}

// Helper: Split text into question chunks (robust, skips section headers, requires min text length)
export function splitIntoQuestions(text: string): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';
  // @ts-ignore
  let inQuestion = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines
    if (!line) {
      if (currentChunk) {
        currentChunk += '\n';
      }
      continue;
    }
    // Check if this is a new question (number at start followed by period or paren, then text)
    // Must have at least 10 characters after the number to be a real question
    const isNewQuestion = /^\s*\d+[\.)]\s+.{10,}/.test(line);
    if (isNewQuestion) {
      // Save previous chunk
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = line;
      inQuestion = true;
    } else {
      // Add to current chunk
      if (currentChunk) {
        currentChunk += '\n' + line;
      } else {
        currentChunk = line;
      }
    }
  }
  // Save last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks.filter(c => c.length > 10);
}

// Helper: Repair incomplete JSON
export function repairIncompleteJson(json: string): string {
  const lastCompleteObject = json.lastIndexOf('}');
  if (lastCompleteObject !== -1) {
    json = json.substring(0, lastCompleteObject + 1);
  }
  if (!json.endsWith(']')) {
    json += ']';
  }
  json = json.replace(/,\s*\]/, ']');
  return json;
}

export function validateAndNormalizeQuestions(data: any): any[] {
  let questions: any[] = [];
  
  // 1. Resolve to an array
  if (Array.isArray(data)) {
    questions = data;
  } else if (data && typeof data === 'object') {
    // If it's an object with a 'questions' or 'items' key
    if (Array.isArray(data.questions)) {
      questions = data.questions;
    } else if (Array.isArray(data.items)) {
      questions = data.items;
    } else {
      // If it's a single question object, wrap it
      if (data.text || data.question) {
        questions = [data];
      } else {
        console.error("No array found in AI JSON response:", data);
        throw new Error("AI returned a JSON object but no list of questions was found.");
      }
    }
  }
  
  if (questions.length === 0) {
    throw new Error("AI returned an empty result or invalid structure.");
  }
  
  // 2. Validate and normalize questions
  const validatedQuestions = questions.map((q: any, index: number) => {
    // Attempt to salvage question even if text is in a different property
    const qText = q.text || q.question || q.problem || "";
    if (!qText || typeof qText !== 'string') {
      console.warn(`Question ${index + 1} has no text:`, q);
      return null;
    }
    
    const validTypes = ["multiple-choice", "true-false", "short-answer", "text"];
    const type = validTypes.includes(q.type) ? q.type : "text";
    
    return {
      text: qText.trim(),
      type,
      options: Array.isArray(q.options) ? q.options.filter(Boolean) : [],
      correctAnswer: q.correctAnswer || q.answer || "",
      points: Number(q.points) || 10,
    };
  }).filter((q): q is any => q !== null);
  
  if (validatedQuestions.length === 0) {
     throw new Error("No valid questions could be extracted from the AI response.");
  }
  
  console.log(`Successfully parsed ${validatedQuestions.length} questions`);
  return validatedQuestions;
}

export function classifyQuestion(question: string): 'declarative' | 'problem-solving' {
  const declarativeKeywords = [
    'what is', 'define', 'explain', 'describe', 
    'formula for', 'equation for', 'law of',
    'tell me about', 'how does', 'why does'
  ];
  
  const problemKeywords = [
    'calculate', 'find', 'solve', 'what\'s the answer',
    'determine', 'compute', 'how much', 'how fast',
    // Check for numbers in question
    /\d+\s*(kg|m|s|N|J)/
  ];
  
  const lowerQ = question.toLowerCase();
  
  if (declarativeKeywords.some(kw => lowerQ.includes(kw))) {
    return 'declarative';
  }
  
  if (problemKeywords.some(kw => 
    typeof kw === 'string' ? lowerQ.includes(kw) : kw.test(question)
  )) {
    return 'problem-solving';
  }
  
  // Default to declarative if ambiguous
  return 'declarative';
}
