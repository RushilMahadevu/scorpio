import { getGenerativeModel } from "firebase/ai";
import { getGenAIInstance } from "@/lib/firebase";

export function createGenerativeModel() {
  const ai = getGenAIInstance();
  return getGenerativeModel(ai, { 
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
}

export const model = new Proxy({} as ReturnType<typeof getGenerativeModel>, {
  get(target, prop, receiver) {
    const activeModel = createGenerativeModel();
    const val = Reflect.get(activeModel, prop, receiver);
    if (typeof val === "function") {
      return val.bind(activeModel);
    }
    return val;
  }
});

export const CONTEXT_WINDOW_SIZE = 10;
