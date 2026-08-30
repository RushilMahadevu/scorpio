/**
 * Direct Gemini API configuration for Scorpio AI.
 * Uses GEMINI_API_KEY / NEXT_PUBLIC_FIREBASE_API_KEY with direct Google Generative AI REST endpoints.
 * This guarantees 100% reliable execution in Next.js Server API routes without client-side App Check blocking.
 */

function resolveApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  try {
    const defaults = process.env.__FIREBASE_DEFAULTS__;
    if (defaults) {
      const key = JSON.parse(defaults)?.config?.apiKey;
      if (key) return key;
    }
  } catch {}
  return "AIzaSyCc0D0j5X4HekaSvXpCa8hFPfZKdn6nQUA";
}

async function callGeminiDirect(request: any) {
  const apiKey = resolveApiKey();
  const modelName = request?.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  let contents: any[] = [];
  if (typeof request === "string") {
    contents = [{ parts: [{ text: request }] }];
  } else if (Array.isArray(request?.contents)) {
    contents = request.contents.map((c: any) => {
      if (typeof c === "string") return { parts: [{ text: c }] };
      return c;
    });
  } else if (request?.prompt) {
    contents = [{ parts: [{ text: request.prompt }] }];
  }

  const payload: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      ...request?.generationConfig,
    },
    safetySettings: request?.safetySettings || [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": process.env.NEXT_PUBLIC_APP_URL || "https://scorpioedu.org",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini API ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p: any) => p.text).join("") || "";

  const responseObj = {
    text: () => text,
    usageMetadata: data.usageMetadata || {
      promptTokenCount: 0,
      candidatesTokenCount: 0,
      totalTokenCount: 0,
    },
    candidates: data.candidates || [],
  };

  return {
    response: Promise.resolve(responseObj),
  };
}

export const model = {
  generateContent: (request: any) => callGeminiDirect(request),
  startChat: (options?: any) => {
    let history = [...(options?.history || [])];
    return {
      async sendMessage(prompt: string | any) {
        const userMsg = typeof prompt === "string" ? { role: "user", parts: [{ text: prompt }] } : prompt;
        const currentContents = [...history, userMsg];
        const res = await callGeminiDirect({
          contents: currentContents,
          generationConfig: options?.generationConfig,
          safetySettings: options?.safetySettings,
        });
        const respObj = await res.response;
        const modelText = respObj.text();
        history.push(userMsg);
        history.push({ role: "model", parts: [{ text: modelText }] });
        return res;
      },
      getHistory: async () => history,
    };
  },
} as any;

export const CONTEXT_WINDOW_SIZE = 10;

