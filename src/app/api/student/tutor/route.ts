import { NextRequest, NextResponse } from "next/server";
import { explainPhysicsConcept, helpSolveProblem } from "@/lib/ai/tutor";
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

    // Fallback: students may not have organizationId directly — inherit from teacher
    if (!organizationId && userData?.teacherId) {
      const teacherDoc = await adminDb.collection("users").doc(userData.teacherId).get();
      organizationId = teacherDoc.data()?.organizationId;
    }

    if (!organizationId) {
      return NextResponse.json({ error: "You must be enrolled in an active Scorpio Network to use the AI Tutor." }, { status: 403 });
    }

    // 2.5 Resolve Student Names for PII Scrubbing
    let studentNames: string[] = [];
    try {
      // Get all students for the teacher to mask fellow student names in the conversation
      const teacherId = userData?.teacherId || userId;
      const studentsSnapshot = await adminDb.collection("users")
        .where("teacherId", "==", teacherId)
        .where("role", "==", "student")
        .get();
      
      studentNames = studentsSnapshot.docs.map(doc => doc.data().displayName || doc.data().name).filter(Boolean);
      
      // Also include current user just in case
      if (userData?.displayName && !studentNames.includes(userData.displayName)) {
        studentNames.push(userData.displayName);
      }
    } catch (e) {
      console.error("Error resolving student names for scrubbing:", e);
    }

    // 2. Check Budget for Organization AND Student specific limits
    const budgetCheck = await checkBudget(organizationId, "tutor", userId);
    if (!budgetCheck.allowed) {
      return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // 3. Perform AI Operation
    const result = mode === "concept" 
      ? await explainPhysicsConcept(message, chatHistory, "FULL", studentNames)
      : await helpSolveProblem(message, chatHistory, "STRICT_CONCISE", assignmentContext, studentNames);

    // 4. Record usage if possible
    if (result.usage) {
      await recordUsage(
        organizationId, 
        "tutor", 
        result.usage.inputTokens, 
        result.usage.outputTokens,
        userId
      );
    }

    return NextResponse.json({ response: result.text });
  } catch (error) {
    console.error("Student AI Tutor Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
