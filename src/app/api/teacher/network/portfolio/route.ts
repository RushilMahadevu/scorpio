import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminFieldWithValue } from "@/lib/firebase-admin";
import { generateStudentPortfolio } from "@/lib/ai/network";
import { checkBudget, recordUsage } from "@/lib/usage-limit";



export async function POST(req: NextRequest) {
  try {
    const { teacherId, studentId, organizationId } = await req.json();

    if (!teacherId || !studentId || !organizationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    // 1. Verify Teacher and Organization
    const teacherDoc = await adminDb.collection("users").doc(teacherId).get();
    if (!teacherDoc.exists || teacherDoc.data()?.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized: Invalid teacher profile" }, { status: 403 });
    }

    if (teacherDoc.data()?.organizationId !== organizationId) {
      return NextResponse.json({ error: "Unauthorized: Teacher not in network" }, { status: 403 });
    }

    // 1.1 Check Budget
    const budgetCheck = await checkBudget(organizationId, "portfolio");
    if (!budgetCheck.allowed) {
      return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }


    // 2. Fetch Student Name and Verification
    const studentDoc = await adminDb.collection("users").doc(studentId).get();
    if (!studentDoc.exists || studentDoc.data()?.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const studentData = studentDoc.data()!;
    const studentName = studentData.displayName || studentData.name || "Unknown Student";

    // Build chat history from past sessions
    // Realistically, we fetch the last X sessions (e.g. max 5 recent sessions to save tokens)
    const sessionsSnapshot = await adminDb.collection("tutor_sessions")
      .where("studentId", "==", studentId)
      .orderBy("updatedAt", "desc")
      .limit(5)
      .get();

    let allChatHistory: { role: "user" | "assistant"; content: string }[] = [];
    
    // We want chronological order inside the prompt, so reverse the sessions to have oldest of the recent 5 first
    const sessions = sessionsSnapshot.docs.reverse();
    
    for (const sessionDoc of sessions) {
      const messages = sessionDoc.data().messages || [];
      const formattedMessages = messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));
      allChatHistory = allChatHistory.concat(formattedMessages);
    }

    // 3. Generate Portfolio via Gemini
    // Limit total messages to top ~50 most recent from those 5 sessions if it's too large, but 5 sessions is usually okay.
    if (allChatHistory.length > 50) {
      allChatHistory = allChatHistory.slice(-50); // Keep only last 50 messages to save context limit
    }

    const result = await generateStudentPortfolio(studentName, allChatHistory);
    const portfolio = result.portfolio;
    const usage = result.usage;

    // 3.1 Record Usage
    if (usage) {
      await recordUsage(
        organizationId,
        "portfolio",
        usage.inputTokens,
        usage.outputTokens,
        teacherId // Recorded against the teacher who initiated the generation
      );
    }

    const portfolioData = {
      studentId,
      organizationId,
      teacherId,
      lastUpdated: adminFieldWithValue.serverTimestamp(),
      strengths: portfolio.strengths,
      weaknesses: portfolio.weaknesses,
      masteryLevel: portfolio.masteryLevel,
      aiSummary: portfolio.aiSummary
    };

    // 4. Save to Firestore portfolios collection
    await adminDb.collection("portfolios").doc(studentId).set(portfolioData, { merge: true });

    return NextResponse.json({ 
      success: true, 
      portfolio: {
        ...portfolioData,
        lastUpdated: new Date() // Send client-friendly date format
      } 
    });
  } catch (error: any) {
    console.error("Student Portfolio Generation Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
