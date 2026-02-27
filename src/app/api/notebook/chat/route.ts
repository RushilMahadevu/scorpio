import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminFieldWithValue } from '@/lib/firebase-admin';
import { checkBudget, recordUsage } from '@/lib/usage-limit';
import { getNotebookAssistantResponse } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const { messages, notebookContent, studentId } = await req.json();

    if (!messages || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Resolve Organization for budget
    const studentDoc = await adminDb.collection("users").doc(studentId).get();
    if (!studentDoc.exists) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }
    const studentData = studentDoc.data();
    let organizationId = studentData?.organizationId;

    if (!organizationId && studentData?.teacherId) {
        const teacherDoc = await adminDb.collection("users").doc(studentData.teacherId).get();
        if (teacherDoc.exists) {
            organizationId = teacherDoc.data()?.organizationId;
        }
    }

    if (!organizationId) {
        return NextResponse.json({ error: "No organization found. Please join a Scorpio Network." }, { status: 403 });
    }

    // 2. Check Notebook Budget
    const orgRef = adminDb.collection("organizations").doc(organizationId);
    const orgSnap = await orgRef.get();
    const orgData = orgSnap.data();

    const notebookLimit = orgData?.notebookLimit || 0;
    const notebookUsage = orgData?.notebookUsageCurrent || 0;

    if (notebookUsage >= notebookLimit) {
        return NextResponse.json({ error: "The monthly notebook AI limit for your network has been reached." }, { status: 403 });
    }

    const budgetCheck = await checkBudget(organizationId, "notebook");
    if (budgetCheck.allowed) {
        // 3. Generate AI Response using centralized gemini helper
        const result = await getNotebookAssistantResponse(messages, notebookContent);
        const responseText = result.content;

        // 4. Record Usage and Increment Notebook Count
        if (result.usage) {
            await recordUsage(
              organizationId, 
              "notebook", 
              result.usage.inputTokens, 
              result.usage.outputTokens
            );
        }

        await orgRef.update({
            notebookUsageCurrent: adminFieldWithValue.increment(1)
        });

        return NextResponse.json({ content: responseText });
    }

    return NextResponse.json({ error: budgetCheck.error }, { status: 403 });

  } catch (error: any) {
    console.error('Notebook Copilot API Error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Digital resonance failure. Copilot is offline.' 
    }, { status: 500 });
  }
}
