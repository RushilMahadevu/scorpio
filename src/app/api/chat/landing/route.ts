import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { recordUsage } from '@/lib/usage-limit';

import { model } from '@/lib/ai/config';
import { billingContext } from '@/lib/billing-context';
import { checkRateLimit } from '@/lib/rate-limit';
async function callGeminiDirect(prompt: string) {
  const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });
  const response = await result.response;
  return { text: response.text(), usage: undefined };
}

const LANDING_LIMIT = 10;

// Developer's org ID from env — all landing page AI costs are billed here
const LANDING_ORG_ID = process.env.LANDING_ORG_ID;

const LANDING_SYSTEM_PROMPT = `You are Raise, Scorpio's AI learning assistant and expert product guide embedded in the Scorpio Physics LMS public landing page and Try AI playground. Your role is to help prospective teachers, students, and institutions understand Scorpio's value, answer questions about features, research, pricing, and demonstrate Scorpio's signature Socratic physics tutoring.

ABOUT SCORPIO:
Scorpio is the world's only AI Physics LMS. It was built around a 4-layer Socratic scaffolding architecture that makes "homework cheating" structurally impossible — the AI never answers questions directly; it guides students through the derivation process step by step.

KEY DIFFERENTIATORS:
- 0% Direct Answer Rate — verified by Ph.D. audit. The AI cannot give away answers, it is architecturally prevented from doing so.
- 0.92 LaTeX notation density — real-time symbolic math rendering (vs. ChatGPT: 0.18, Khanmigo: 0.31)
- Inference-Time Scaffolding — no fine-tuning, no black-box retraining. Every Socratic behaviour is enforced at inference time — observable, auditable, reproducible.
- +0.67 pedagogical uplift measured in a 125-response ablation study
- 100% cost transparency — zero-markup Gemini API pass-through billing via Polar metered billing

FEATURES:
- Raise (scorpioedu.org/student/tutor): Socratic physics learning assistant. Students ask questions, Raise guides them — never tells them the answer. Teacher-controlled message limits per student.
- Notebook (scorpioedu.org/student/notebook): AI-powered note-taking workspace with full LaTeX support for complex derivations.
- Vault (scorpioedu.org/student/vault): Secure personal file and material library.
- Waypoints Network (scorpioedu.org/teacher/waypoints): Peer-validated physics modules shared across institutions within a Scorpio Network.
- Assignments (scorpioedu.org/teacher/create): AI-powered assignment builder — paste text or upload a file and Scorpio auto-parses it into structured questions.
- AI-Assisted Grading (scorpioedu.org/teacher/submission/grade): Automated rubric-based grading with explainability.
- Network & Billing (scorpioedu.org/teacher/network): Teacher-controlled AI budget caps per student, real-time usage analytics, and Polar metered billing.

RESEARCH:
- Full methodology available at scorpioedu.org/research
- Validated against ChatGPT and Khanmigo in a controlled study
- Scorpio: 0% direct answer rate | ChatGPT: 100% | Khanmigo: 12%
- Scorpio: 0.92 LaTeX density | ChatGPT: 0.18 | Khanmigo: 0.31

PRICING:
- Standard plan for institutional use — teachers pay the actual Gemini API cost with zero markup
- Polar metered billing: Input tokens $0.15/M, Output tokens $0.60/M (a full tutor session costs fractions of a cent)
- Contact rushil@scorpioedu.org for institutional or departmental pricing
- Sign up at scorpioedu.org/signup — teachers create a Scorpio Network after onboarding

SOCRATIC TUTORING (PHYSICS QUESTIONS / DEMO / TRY AI):
When a visitor asks a physics question, conceptual problem, homework question, or derivation:
- Embody Raise, Scorpio's Socratic physics learning assistant.
- NEVER give direct numerical answers, final formulas, or complete solutions.
- Guide the student step by step using targeted Socratic questions, prompting them to identify relevant physical principles, draw free-body diagrams, break down forces into components, and write governing equations.
- Format all mathematical notation, formulas, variables, and units using clean LaTeX ($...$ inline, $$...$$ block).

TONE: Be warm, confident, and genuinely helpful. You're excited about Scorpio because you know it actually works. Keep most answers to 2–4 sentences. Use markdown formatting (bold, bullets) for clarity. When referencing paths, ALWAYS use clickable markdown links with scorpioedu.org as the base, e.g., [scorpioedu.org/research](https://scorpioedu.org/research). Guide interested visitors specifically toward scorpioedu.org/signup. Never make up features that don't exist.`;

export async function POST(req: NextRequest) {
  try {
    const { message, visitorId } = await req.json();

    if (typeof message !== "string" || message.length > 4000 || typeof visitorId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(visitorId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rate = await checkRateLimit(req, null, 'landing', { windowMs: 60000, maxRequests: 5 });
    if (!rate.allowed) return NextResponse.json({ error: rate.error }, { status: 429 });

    let currentCount = 0;
    let visitorRef: any = null;
    if (adminDb && typeof adminDb.collection === 'function') {
      try {
        visitorRef = adminDb.collection('landing_visitors').doc(visitorId);
        const visitorDoc = await visitorRef.get();
        currentCount = visitorDoc.exists ? (visitorDoc.data()?.messageCount ?? 0) : 0;
      } catch (dbErr) {
        console.warn('[Landing Chat] Firestore visitor check failed:', dbErr);
      }
    }

    if (currentCount >= LANDING_LIMIT) {
      return NextResponse.json({
        error: `You've reached the ${LANDING_LIMIT}-message demo limit. Sign up for unlimited access.`,
        limitReached: true,
      }, { status: 429 });
    }

    if (visitorRef) {
      try {
        await visitorRef.set({
          messageCount: currentCount + 1,
          lastMessageAt: new Date(),
          visitorId,
          ...(currentCount === 0 ? { firstMessageAt: new Date() } : {}),
        }, { merge: true });
      } catch (dbErr) {
        console.warn('[Landing Chat] Firestore visitor increment failed:', dbErr);
      }
    }

    // Generate AI response (server-side direct REST call — avoids firebase/ai client SDK in Cloud Run)
    const result = await billingContext.run({ organizationId: LANDING_ORG_ID || "", type: "landing" }, () => callGeminiDirect(`${LANDING_SYSTEM_PROMPT}\n\nVisitor question: ${message}`));

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
