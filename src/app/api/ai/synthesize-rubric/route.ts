import { NextRequest, NextResponse } from "next/server";
import { synthesizeRubric } from "@/lib/gemini";
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
    
    // Rubric synthesis doesn't currently return usage in gemini.ts, 
    // but we should probably add it or record a flat fee.
    // For now, let's just record a small flat usage or none if not available.
    
    return NextResponse.json({ rubric });
  } catch (error: any) {
    console.error("Rubric synthesis API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
