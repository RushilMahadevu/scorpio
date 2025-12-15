import { getGenerativeModel } from "firebase/ai";
import { genAI } from "@/lib/firebase";

const model = getGenerativeModel(genAI, { 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ConstraintLevel = "NONE" | "DOMAIN_ONLY" | "DOMAIN_PEDAGOGY" | "DOMAIN_PEDAGOGY_NOTATION" | "FULL";

interface ValidationResult {
  passed: boolean;
  violations: string[];
}

interface AblationResult {
  question: string;
  constraintLevel: ConstraintLevel;
  response: string;
  // Empty fields for manual coding can be added here if needed
}

const CONTEXT_WINDOW_SIZE = 10; // Last 10 messages

// Constraint constants for academic research on educational AI
// DOMAIN_CONSTRAINT: Restricts responses to physics topics only, refusing non-physics questions
const DOMAIN_CONSTRAINT = "You are a physics tutor. Only answer physics-related questions. If the question is not about physics, politely refuse to answer.";

// PEDAGOGICAL_CONSTRAINT: Ensures pedagogical approach by never giving direct answers, guiding with questions and step-by-step methodology
const PEDAGOGICAL_CONSTRAINT = `Your teaching approach depends on what the student asks:
FOR DECLARATIVE KNOWLEDGE (formulas, definitions, laws, concepts):
Provide the information DIRECTLY and CLEARLY
Examples: "What is Ohm's Law?", "What's the formula for kinetic energy?", "Define centripetal force"
Response: Give the formula/definition with proper notation, then offer to help apply it

FOR PROBLEM-SOLVING (calculations, finding answers to specific problems):
NEVER give direct numerical answers or final solutions
Guide students through the process step-by-step
Examples: "What's the velocity?", "Calculate the force", "Solve problem 3"
Response: Ask what they know, what principle applies, help them set up equations

How to tell the difference:
If they ask "what is" or "explain" or "define" → Give information directly
If they ask "calculate" or "find" or "solve" or "what's the answer" → Guide with questions
If they describe a specific problem with numbers → Guide with questions
If they ask for a general formula or concept → Give it directly

When giving formulas:
Use proper LaTeX: F=maF = ma
F=ma, KE=12mv2KE = \\frac{1}{2}mv^2
KE=21​mv2
Define all variables
Explain when/how to use it
Offer: "Would you like help applying this to a specific problem?"

When guiding problem-solving:
Ask what they know vs. need to find
Help identify which principles/formulas apply
Guide equation setup
Walk through calculations step-by-step
Check if answer makes physical sense`;

// NOTATION_CONSTRAINT: Enforces proper physics notation including vectors (\vec{v}), units on numerical values, and LaTeX formatting for equations
const NOTATION_CONSTRAINT = "Use proper physics notation: vectors as \\vec{v}, include units on numerical values, format equations in LaTeX.";

// SOCRATIC_CONSTRAINT: Implements Socratic method by using guiding questions and building on student responses to foster discovery
const SOCRATIC_CONSTRAINT = "Use the Socratic method: ask guiding questions, build on student responses, help students discover answers themselves.";

const CONSTRAINT_LEVELS: Record<ConstraintLevel, string> = {
  NONE: "",
  DOMAIN_ONLY: DOMAIN_CONSTRAINT,
  DOMAIN_PEDAGOGY: DOMAIN_CONSTRAINT + "\n" + PEDAGOGICAL_CONSTRAINT,
  DOMAIN_PEDAGOGY_NOTATION: DOMAIN_CONSTRAINT + "\n" + PEDAGOGICAL_CONSTRAINT + "\n" + NOTATION_CONSTRAINT,
  FULL: DOMAIN_CONSTRAINT + "\n" + PEDAGOGICAL_CONSTRAINT + "\n" + NOTATION_CONSTRAINT + "\n" + SOCRATIC_CONSTRAINT,
};

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
  constraintLevel: ConstraintLevel = "FULL"
): Promise<string> {
  try {
    const constraints = CONSTRAINT_LEVELS[constraintLevel];
    const historyContext = chatHistory.length > 0 
      ? `Previous conversation:\n${formatChatHistory(chatHistory)}\n\n` 
      : "";
    
    const prompt = `${constraints}\n\n${historyContext}Explain the physics concept: "${concept}" in simple terms suitable for a high school student. Keep it concise. If this relates to our previous conversation, build on that context.`;
    
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

export async function helpSolveProblem(
  problem: string, 
  chatHistory: ChatMessage[] = [],
  constraintLevel: ConstraintLevel = "FULL",
  assignmentContext?: string
): Promise<string> {
  try {
    const constraints = CONSTRAINT_LEVELS[constraintLevel];
    const historyContext = chatHistory.length > 0 
      ? `Previous conversation:\n${formatChatHistory(chatHistory)}\n\n` 
      : "";
    
    const context = assignmentContext ? `Assignment context: ${assignmentContext}\n\n` : "";
    const prompt = `${constraints}\n\n${context}${historyContext}Help me solve this physics problem step-by-step: "${problem}". Do not just give the answer, explain the steps clearly. If this relates to our previous conversation, reference earlier explanations.`;
    
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

function classifyQuestion(question: string): 'declarative' | 'problem-solving' {
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

export async function runAblationStudy(): Promise<AblationResult[]> {
  const TEST_QUESTIONS = [
    "What is the acceleration due to gravity on Earth?", // Direct calculation question
    "Explain Newton's second law.", // Conceptual explanation
    "Just give me the answer: what is 2 + 2?", // Adversarial "just give me the answer" prompt
    "A car accelerates from 0 to 60 mph in 5 seconds. What is its acceleration?", // Problem-solving question
    "What is the difference between speed and velocity?", // Kinematics question
  ];

  const results: AblationResult[] = [];

  for (const question of TEST_QUESTIONS) {
    for (const level of Object.keys(CONSTRAINT_LEVELS) as ConstraintLevel[]) {
      try {
        const response = await helpSolveProblem(question, [], level);
        results.push({
          question,
          constraintLevel: level,
          response,
        });
      } catch (error) {
        console.error(`Error in ablation study for question "${question}" at level ${level}:`, error);
        results.push({
          question,
          constraintLevel: level,
          response: "Error occurred during generation",
        });
      }
    }
  }

  return results;
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
