import { NextRequest, NextResponse } from "next/server";
import { explainPhysicsConcept, helpSolveProblem } from "@/lib/gemini";
import { adminDb } from "@/lib/firebase-admin";
import { checkBudget, recordUsage } from "@/lib/usage-limit";

export async function POST(req: NextRequest) {
  try {
    const { message, userId, role, mode, chatHistory, assignmentContext } = await req.json();

    if (!message || !userId || role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    // 1. Resolve OrganizationId from User ID
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const userData = userDoc.data();
    let organizationId = userData?.organizationId;

    // Fallback: If student doesn't have an org, check their teacher's org
    if (!organizationId && userData?.role === "student" && userData?.teacherId) {
      const teacherDoc = await adminDb.collection("users").doc(userData.teacherId).get();
      if (teacherDoc.exists) {
        organizationId = teacherDoc.data()?.organizationId;
      }
    }

    if (!organizationId) {
      return NextResponse.json({ error: "No organization found for user" }, { status: 403 });
    }

    // 2. Check Budget for Organization
    const budgetCheck = await checkBudget(organizationId, "tutor");
    if (!budgetCheck.allowed) {
      return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // 3. Perform AI Operation
    const result = mode === "concept" 
      ? await explainPhysicsConcept(message, chatHistory)
      : await helpSolveProblem(message, chatHistory, "STRICT_CONCISE", assignmentContext);

    // 4. Record usage if possible
    if (result.usage) {
      await recordUsage(
        organizationId, 
        "tutor", 
        result.usage.inputTokens, 
        result.usage.outputTokens
      );
    }

    return NextResponse.json({ response: result.text });
  } catch (error) {
    console.error("Student AI Tutor Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
