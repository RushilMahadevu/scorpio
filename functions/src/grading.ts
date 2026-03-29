import * as admin from "firebase-admin";
import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import { GoogleGenAI } from "@google/genai";
import { Polar } from "@polar-sh/sdk";

// Initialize Polar
const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN || "",
    server: (process.env.POLAR_ENV === "sandbox" || process.env.NEXT_PUBLIC_POLAR_ENV === "sandbox") ? "sandbox" : "production",
});

// Initialize the modern Google Gen AI SDK configured for Vertex AI
const client = new GoogleGenAI({
    vertexai: true,
    project: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
    location: "us-central1"
});

/**
 * SCRUB PII - Ported from src/lib/gemini.ts
 */
function scrubPII(text: string, studentNames: string[] = []): string {
  if (!text) return text;
  
  let scrubbed = text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
    .replace(/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g, "[PHONE]")
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[ID]")
    .replace(/\b(ID|Student\s?#?|ID\s?#?):?\s?\d{5,9}\b/gi, "[STUDENT_ID]")
    .replace(/\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Ter|Terrace|Way)\.?\b/gi, "[ADDRESS]")
    .replace(/(?:DOB|Birth|Born)(?:\s+on)?\s*[:\-]?\s*(\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b[A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4}\b)/gi, "[BIRTH_DATE]")
    .replace(/\b(19|20)\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g, "[DATE]")
    .replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-](19|20)\d{2}\b/g, "[DATE]")
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[SENSITIVE]");

  if (studentNames.length > 0) {
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

    const sortedParts = Array.from(nameParts).sort((a, b) => b.length - a.length);

    sortedParts.forEach((name) => {
      if (name && name.length > 2) {
        const nameRegex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        scrubbed = scrubbed.replace(nameRegex, "[NAME]");
      }
    });
  }

  return scrubbed;
}

/**
 * GRADE RESPONSE - Re-implemented using modern @google/genai SDK
 */
async function gradeResponseAI(
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
    
    // Modern @google/genai syntax
    const result = await client.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 1024,
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });
    
    // Modern @google/genai response parsing
    const text = result.text || "";
    
    if (!text) {
        throw new Error("Empty response from @google/genai");
    }

    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
        throw new Error("Invalid response format: No JSON object found in AI output.");
    }
    
    const data = JSON.parse(text.substring(startIdx, endIdx + 1));
    
    if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format from @google/genai");
    }

    let score = 0;
    if (typeof data.score === 'number') {
        score = Math.min(10, Math.max(0, data.score));
    } else if (typeof data.score === 'string') {
        if (data.score.includes('/')) {
            const parts = data.score.split('/');
            score = (parseFloat(parts[0]) / (parseFloat(parts[1]) || 10)) * 10;
        } else {
            score = parseFloat(data.score) || 0;
        }
    }

    return {
        score,
        feedback: data.student_feedback || data.feedback || "Submission received and pending final review.",
        reasoning: data.technical_reasoning || data.reasoning || "",
        usage: {
            inputTokens: result.usageMetadata?.promptTokenCount || 0,
            outputTokens: result.usageMetadata?.candidatesTokenCount || 0
        }
    };
  } catch (error: any) {
    console.error("Error in gradeResponseAI (Modern GenAI):", error);
    return { 
        score: 0, 
        feedback: "Your submission has been received. A teacher will review it shortly." 
    };
  }
}

/**
 * USAGE LOGGING
 */
async function recordUsage(
    db: admin.firestore.Firestore,
    organizationId: string,
    type: string,
    inputTokens: number,
    outputTokens: number,
    userId?: string
) {
    const RATES = { input: 0.000015, output: 0.000060 };
    const costCents = (inputTokens * RATES.input) + (outputTokens * RATES.output);
    
    const orgRef = db.collection("organizations").doc(organizationId);
    const usageLogRef = db.collection("usage_analytics").doc();
    let polarCustomerId: string | null = null;

    try {
        await db.runTransaction(async (transaction) => {
            const orgDoc = await transaction.get(orgRef);
            if (!orgDoc.exists) return;

            const data = orgDoc.data();
            polarCustomerId = data?.polarCustomerId || null;
            const currentUsage = data?.aiUsageCurrent || 0;

            transaction.set(orgRef, {
                aiUsageCurrent: currentUsage + costCents,
                lastAiUsageAt: admin.firestore.FieldValue.serverTimestamp(),
                aiUsageTotalCents: (data?.aiUsageTotalCents || 0) + costCents
            }, { merge: true });

            transaction.set(usageLogRef, {
                organizationId,
                userId: userId || null,
                type,
                inputTokens,
                outputTokens,
                costCents,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        if (polarCustomerId && process.env.POLAR_ACCESS_TOKEN) {
            try {
                await polar.events.ingest({
                    events: [{
                        customerId: polarCustomerId,
                        name: "ai_usage",
                        timestamp: new Date(),
                        metadata: {
                            event_name: "ai_usage",
                            input_tokens: inputTokens,
                            output_tokens: outputTokens,
                            vendor: "google",
                            model: "gemini-2.0-flash",
                            costUSD: parseFloat((costCents / 100).toFixed(8)),
                            type: String(type),
                            organizationId: String(organizationId),
                        }
                    }]
                });
                console.log("[Polar] Ingested ai_usage event for", polarCustomerId);
            } catch (polarErr) {
                console.error("[Polar] Failed to ingest usage event:", polarErr);
            }
        }
    } catch (err) {
        console.error("[recordUsage] Transaction error:", err);
    }
}

/**
 * MAIN GRADING PROCESSOR
 */
async function processGrading(submissionId: string, submissionData: any) {
    const db = admin.firestore();
    const assignmentId = submissionData.assignmentId;
    const studentId = submissionData.studentId;

    const studentDoc = await db.collection("users").doc(studentId).get();
    const studentData = studentDoc.data();
    let organizationId = studentData?.organizationId;

    if (!organizationId && studentData?.role === "student" && studentData?.teacherId) {
        const teacherDoc = await db.collection("users").doc(studentData.teacherId).get();
        organizationId = teacherDoc.data()?.organizationId;
    }

    if (!organizationId) {
        console.error("No organization found for grading budget.");
        return;
    }

    let studentNames: string[] = [];
    try {
        const teacherId = studentData?.teacherId;
        if (teacherId) {
            const studentsSnapshot = await db.collection("users")
                .where("teacherId", "==", teacherId)
                .where("role", "==", "student")
                .get();
            studentNames = studentsSnapshot.docs.map(doc => doc.data().displayName || doc.data().name).filter(Boolean);
        }
        const currentName = studentData?.displayName || studentData?.name;
        if (currentName && !studentNames.includes(currentName)) studentNames.push(currentName);
    } catch (e) { console.error("Error resolving student names:", e); }

    const assignmentSnap = await db.collection('assignments').doc(assignmentId).get();
    if (!assignmentSnap.exists) return;
    const assignmentData = assignmentSnap.data();
    const questions = assignmentData?.questions || [];
    const answers = submissionData?.answers || []; 
    const globalRubric = assignmentData?.rubric || "";

    let totalScore = 0;
    let maxScore = 0;
    for (const q of questions) maxScore += (q.points || 10);

    const gradedAnswers = [];
    let totalPromptTokens = 0;
    let totalCandidateTokens = 0;

    for (const ans of answers) {
        const question = questions.find((q: any) => q.id === ans.questionId);
        if (!question) {
            gradedAnswers.push(ans);
            continue;
        }

        const points = question.points || 10;
        let score = 0;
        let feedback = "";
        let reasoning = "";

        if ((question.type === "text" || question.type === "short-answer") && ans.answer) {
            const combinedRubric = [question.correctAnswer, globalRubric].filter(Boolean).join("\n\nGlobal Assignment Rubric:\n");
            const result = await gradeResponseAI(question.text, ans.answer, combinedRubric, studentNames);
            feedback = result.feedback;
            reasoning = result.reasoning || "";
            if (result.usage) {
                totalPromptTokens += result.usage.inputTokens;
                totalCandidateTokens += result.usage.outputTokens;
            }
            score = (result.score / 10) * points;
        } else if (question.correctAnswer && (question.type === "multiple-choice" || question.type === "true-false")) {
            const isCorrect = ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
            score = isCorrect ? points : 0;
            feedback = isCorrect ? "Correct!" : `Incorrect. The correct answer was: ${question.correctAnswer}`;
        }

        totalScore += score;
        gradedAnswers.push({ ...ans, feedback, reasoning, score, maxPoints: points });
    }

    if (totalPromptTokens > 0 || totalCandidateTokens > 0) {
        await recordUsage(db, organizationId, "grading", totalPromptTokens, totalCandidateTokens, studentId);
    }

    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    await db.collection('submissions').doc(submissionId).update({
        score: finalScore,
        totalPoints: maxScore,
        earnedPoints: totalScore,
        answers: gradedAnswers,
        graded: true,
        status: 'graded',
        gradedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Successfully graded submission ${submissionId} (Modern GenAI)`);
}

/**
 * FIRESTORE TRIGGERS
 */
export const onSubmissionCreated = onDocumentCreated("submissions/{submissionId}", async (event) => {
    const submissionData = event.data?.data();
    if (submissionData && submissionData.status === 'submitted' && !submissionData.graded) {
        await processGrading(event.params.submissionId, submissionData);
    }
});

export const onSubmissionUpdated = onDocumentUpdated("submissions/{submissionId}", async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (afterData && afterData.status === 'submitted' && beforeData?.status !== 'submitted' && !afterData.graded) {
        await processGrading(event.params.submissionId, afterData);
    }
});
