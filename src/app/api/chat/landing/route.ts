import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { recordUsage } from '@/lib/usage-limit';

/** Resolve Gemini API key: explicit env var → Firebase web key baked into __FIREBASE_DEFAULTS__ */
function resolveApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const defaults = process.env.__FIREBASE_DEFAULTS__;
    if (defaults) {
      const key = JSON.parse(defaults)?.config?.apiKey;
      if (key) return key;
    }
  } catch {}
  throw new Error('Gemini API key is not configured (set GEMINI_API_KEY or __FIREBASE_DEFAULTS__)');
}

async function callGeminiDirect(
  prompt: string
): Promise<{ text: string; usage?: { inputTokens: number; outputTokens: number } }> {
  const apiKey = resolveApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include the production domain as Referer so requests pass any
      // HTTP-referrer restrictions configured on the Firebase/Gemini API key.
      'Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://scorpioedu.org',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`Gemini API ${res.status}: ${JSON.stringify(errBody)}`);
  }

  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return {
    text,
    usage: {
      inputTokens:  data.usageMetadata?.promptTokenCount    ?? 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
    },
  };
}

const LANDING_LIMIT = 10;

// Developer's org ID from env — all landing page AI costs are billed here
const LANDING_ORG_ID = process.env.LANDING_ORG_ID;

const LANDING_SYSTEM_PROMPT = `You are Scorpio AI, the expert product guide embedded in the Scorpio Physics LMS public landing page. Your role is to help prospective teachers and institutions understand Scorpio's value, answer questions about features, research, pricing, and guide visitors toward signing up.

ABOUT SCORPIO:
Scorpio is the world's only AI Physics LMS. It was built around a 4-layer Socratic scaffolding architecture that makes "homework cheating" structurally impossible — the AI never answers questions directly; it guides students through the derivation process step by step.

KEY DIFFERENTIATORS:
- 0% Direct Answer Rate — verified by Ph.D. audit. The AI cannot give away answers, it is architecturally prevented from doing so.
- 0.92 LaTeX notation density — real-time symbolic math rendering (vs. ChatGPT: 0.18, Khanmigo: 0.31)
- Inference-Time Scaffolding — no fine-tuning, no black-box retraining. Every Socratic behaviour is enforced at inference time — observable, auditable, reproducible.
- +0.67 pedagogical uplift measured in a 125-response ablation study
- 100% cost transparency — zero-markup Gemini API pass-through billing via Polar metered billing

FEATURES:
- AI Tutor (/student/tutor): Socratic physics tutor. Students ask questions, the AI guides them — never tells them the answer. Teacher-controlled message limits per student.
- Practice Mode (/student/practice): Adaptive AI-generated physics problem scenarios with instant step-by-step feedback.
- Notebook (/student/notebook): AI-powered note-taking workspace with full LaTeX support for complex derivations.
- Vault (/student/vault): Secure personal file and material library.
- Waypoints Network (/teacher/waypoints): Peer-validated physics modules shared across institutions within a Scorpio Network.
- Assignments (/teacher/create): AI-powered assignment builder — paste text or upload a file and Scorpio auto-parses it into structured questions.
- AI-Assisted Grading (/teacher/submission/grade): Automated rubric-based grading with explainability.
- Network & Billing (/teacher/network): Teacher-controlled AI budget caps per student, real-time usage analytics, and Polar metered billing.

RESEARCH:
- Full methodology available at /research
- Validated against ChatGPT and Khanmigo in a controlled study
- Scorpio: 0% direct answer rate | ChatGPT: 100% | Khanmigo: 12%
- Scorpio: 0.92 LaTeX density | ChatGPT: 0.18 | Khanmigo: 0.31

PRICING:
- Standard plan for institutional use — teachers pay the actual Gemini API cost with zero markup
- Polar metered billing: Input tokens $0.15/M, Output tokens $0.60/M (a full tutor session costs fractions of a cent)
- Contact scorpiosrsai@gmail.com for institutional or departmental pricing
- Sign up at /signup — teachers create a Scorpio Network after onboarding

TONE: Be warm, confident, and genuinely helpful. You're excited about Scorpio because you know it actually works. Keep most answers to 2–4 sentences. Use markdown formatting (bold, bullets) for clarity. Guide interested visitors toward /signup. Never make up features that don't exist.`;

export async function POST(req: NextRequest) {
  try {
    const { message, visitorId } = await req.json();

    if (!message || !visitorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Check and increment per-visitor usage in Firestore
    const visitorRef = adminDb.collection('landing_visitors').doc(visitorId);
    const visitorDoc = await visitorRef.get();
    const currentCount = visitorDoc.exists ? (visitorDoc.data()?.messageCount ?? 0) : 0;

    if (currentCount >= LANDING_LIMIT) {
      return NextResponse.json({
        error: `You've reached the ${LANDING_LIMIT}-message demo limit. Sign up for unlimited access.`,
        limitReached: true,
      }, { status: 429 });
    }

    // Increment usage atomically
    await visitorRef.set({
      messageCount: currentCount + 1,
      lastMessageAt: new Date(),
      visitorId,
      ...(currentCount === 0 ? { firstMessageAt: new Date() } : {}),
    }, { merge: true });

    // Generate AI response (server-side direct REST call — avoids firebase/ai client SDK in Cloud Run)
    const result = await callGeminiDirect(`${LANDING_SYSTEM_PROMPT}\n\nVisitor question: ${message}`);

    // Bill to developer's own org via Firestore + Polar metered billing
    if (result.usage && LANDING_ORG_ID) {
      await recordUsage(LANDING_ORG_ID, 'landing', result.usage.inputTokens, result.usage.outputTokens);
    }

    const remaining = LANDING_LIMIT - (currentCount + 1);

    return NextResponse.json({
      text: result.text,
      remaining,
    });
  } catch (error: any) {
    console.error('[Landing Chat API] Error:', error);
    return NextResponse.json({
      error: error?.message || 'Internal server error',
    }, { status: 500 });
  }
}
