import { billingContext } from '../billing-context';
import { adminDb } from '../firebase-admin';
import { reserveBudget, settleBudget, estimateMaximumCost } from '../../../functions/src/metering';
/**
 * Direct Gemini API configuration for Scorpio AI.
 * Uses a server-only key, bounded requests, and transactional budget reservations.
 */

function resolveApiKey(): string {
  if (!process.env.GEMINI_API_KEY) throw new Error("Set the server-only GEMINI_API_KEY");
  return process.env.GEMINI_API_KEY;
}

async function callGeminiDirect(request: any) {
  const apiKey = resolveApiKey();
  const modelName = "gemini-2.5-flash";
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
      ...request?.generationConfig,
      maxOutputTokens: Math.min(request?.generationConfig?.maxOutputTokens || 2048, 8192),
      thinkingConfig: { thinkingBudget: 0 },
    },
    safetySettings: request?.safetySettings || [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  const context = billingContext.getStore();
  if (!context?.organizationId) throw new Error('An authenticated network is required for AI');
  const payloadText = JSON.stringify(payload);
  const inputBytes = Buffer.byteLength(payloadText);
  if (inputBytes > 100000) throw new Error('Conversation is too long; start a new conversation');
  const reservation = await reserveBudget(adminDb, context.organizationId, context.type, context.userId,
    estimateMaximumCost(inputBytes, payload.generationConfig.maxOutputTokens));
  // On transport uncertainty the reservation remains held for reconciliation, preventing overspend.
  const res = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(60000),
    headers: {
      "Content-Type": "application/json",
      "Referer": process.env.NEXT_PUBLIC_APP_URL || "https://scorpioedu.org",
    },
    body: payloadText,
  });

  if (!res.ok) {
    await settleBudget(adminDb, reservation, 0, 0);
    throw new Error(`AI provider returned ${res.status}`);
  }

  const data = await res.json();
  if (!data.usageMetadata) throw new Error('Provider did not return usage; reservation retained for reconciliation');
  await settleBudget(adminDb, reservation, data.usageMetadata.promptTokenCount || 0,
    (data.usageMetadata.candidatesTokenCount || 0) + (data.usageMetadata.thoughtsTokenCount || 0));
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

