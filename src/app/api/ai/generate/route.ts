import { NextRequest, NextResponse } from "next/server";
import { generateAssignmentQuestions } from "@/lib/gemini";
import { adminDb } from "@/lib/firebase-admin";
import { checkBudget, recordUsage } from "@/lib/usage-limit";

export async function POST(req: NextRequest) {
  try {
    const { topic, count, difficulty, questionType, userId } = await req.json();

    if (!topic || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    // 1. Resolve OrganizationId from User ID (Teacher-only feature usually)
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const userData = userDoc.data();
    let organizationId = userData?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: "No organization found for user" }, { status: 403 });
    }

    // 2. Check Budget for Organization
    const budgetCheck = await checkBudget(organizationId, "generation");
    if (!budgetCheck.allowed) {
      return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // 3. Perform AI Generation
    const result = await generateAssignmentQuestions(topic, count, difficulty, questionType);

    // 4. Record usage
    if (result.usage) {
      await recordUsage(
        organizationId, 
        "generation", 
        result.usage.inputTokens || 0, 
        result.usage.outputTokens || 0
      );
    }

    return NextResponse.json({ questions: result.questions });
  } catch (error) {
    console.error("AI Generation API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
