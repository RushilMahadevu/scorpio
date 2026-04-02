import { getGenerativeModel } from "firebase/ai";
import { genAI } from "@/lib/firebase";

export const model = getGenerativeModel(genAI, { 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  ]
});

export const CONTEXT_WINDOW_SIZE = 10;
