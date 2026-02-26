import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminFieldWithValue } from '@/lib/firebase-admin';
import { generateSandboxProblem } from '@/lib/gemini';
import { checkBudget, recordUsage } from '@/lib/usage-limit';

export async function POST(req: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const { topic, difficulty, studentId, courseId, progress } = await req.json();

    if (!topic || !difficulty || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 2. Resolve Organization/Teacher for budget
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
        return NextResponse.json({ error: "No organization found for budget tracking." }, { status: 403 });
    }

    // 2. Check Sandbox Budget
    const orgRef = adminDb.collection("organizations").doc(organizationId);
    const orgSnap = await orgRef.get();
    const orgData = orgSnap.data();

    // Verify sandbox limit
    const sandboxLimit = orgData?.sandboxLimit || 100;
    const sandboxUsage = orgData?.sandboxUsageCurrent || 0;

    if (sandboxUsage >= sandboxLimit) {
        return NextResponse.json({ error: "The monthly sandbox limit for your network has been reached." }, { status: 403 });
    }

    const budgetCheck = await checkBudget(organizationId, "sandbox");
    if (!budgetCheck.allowed) {
        return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // 3. Generate Problem
    const result = await generateSandboxProblem(topic, difficulty, progress);

    // 4. Record Usage and Increment Sandbox Count
    if (result.usage) {
        await recordUsage(organizationId, "sandbox", result.usage.inputTokens, result.usage.outputTokens);
    }

    // Increment Sandbox Usage Current
    await orgRef.update({
        sandboxUsageCurrent: adminFieldWithValue.increment(1)
    });

    if (courseId) {
        const courseRef = adminDb.collection("courses").doc(courseId);
        await courseRef.update({
            sandboxUsed: adminFieldWithValue.increment(1)
        });
    }

    return NextResponse.json(result.problem);

  } catch (error: any) {
    console.error('Sandbox API Error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to generate problem. Matrix calibration failed.' 
    }, { status: 500 });
  }
}
