import { NextRequest, NextResponse } from "next/server";
import { synthesizeRubric } from "@/lib/ai/grading";
import { adminDb } from "@/lib/firebase-admin";
import { checkBudget, recordUsage } from "@/lib/usage-limit";

export async function POST(req: NextRequest) {
  try {
    const { questionText, topic, userId } = await req.json();

    if (!questionText || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    if (!organizationId) {
      return NextResponse.json({ error: "No organization found for user" }, { status: 403 });
    }

    // 2. Check Budget for Organization
    const budgetCheck = await checkBudget(organizationId, "generation");
    if (!budgetCheck.allowed) {
      return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    const rubric = await synthesizeRubric(questionText, topic || "General Scientific Query");

    if (rubric.usage) {
      try {
        await recordUsage(organizationId, "generation", rubric.usage.inputTokens, rubric.usage.outputTokens);
      } catch (usageError) {
        console.error("Failed to record usage:", usageError);
      }
    }

    return NextResponse.json({ rubric: rubric.text });
  } catch (error: any) {
    console.error("Rubric synthesis API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
