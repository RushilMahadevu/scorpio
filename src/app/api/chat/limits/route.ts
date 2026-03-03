import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getNetworkLimitsHelp, NetworkLimitsContext } from '@/lib/gemini';
import { checkBudget, recordUsage } from '@/lib/usage-limit';

export async function POST(req: NextRequest) {
  try {
    const { message, chatHistory, userId } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // 1. Resolve user + org
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();
    const organizationId = userData?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'No network associated with this account' }, { status: 403 });
    }

    // 2. Budget check
    const budgetCheck = await checkBudget(organizationId, 'navigation');
    if (!budgetCheck.allowed) {
      return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // 3. Fetch org data for context
    const orgDoc = await adminDb.collection('organizations').doc(organizationId).get();
    if (!orgDoc.exists) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    const orgData = orgDoc.data()!;

    // 4. Count students for the network
    let studentCount = 0;
    try {
      const teacherSnap = await adminDb.collection('users')
        .where('organizationId', '==', organizationId)
        .where('role', '==', 'teacher')
        .get();
      const teacherIds = teacherSnap.docs.map(d => d.id);
      if (teacherIds.length > 0) {
        const studentsSnap = await adminDb.collection('users')
          .where('teacherId', 'in', teacherIds.slice(0, 10))
          .where('role', '==', 'student')
          .get();
        studentCount = studentsSnap.size;
      }
    } catch (e) {
      console.error('Student count error:', e);
    }

    // 5. Build context object
    const ctx: NetworkLimitsContext = {
      orgName: orgData.name || 'Your Network',
      planId: orgData.planId || 'free',
      aiBudgetLimit: orgData.aiBudgetLimit || 0,
      aiUsageCurrent: orgData.aiUsageCurrent || 0,
      practiceLimit: orgData.practiceLimit || 0,
      practiceUsageCurrent: orgData.practiceUsageCurrent || 0,
      practiceLimitPerStudent: orgData.practiceLimitPerStudent || 0,
      notebookLimitPerStudent: orgData.notebookLimitPerStudent || 0,
      aiNotebookLimitPerStudent: orgData.aiNotebookLimitPerStudent || 0,
      aiTutorLimitPerStudent: orgData.aiTutorLimitPerStudent || 0,
      studentCount,
    };

    // 6. Generate response
    const result = await getNetworkLimitsHelp(message, chatHistory || [], ctx);

    // 7. Record usage
    if (result.usage) {
      await recordUsage(organizationId, 'navigation', result.usage.inputTokens, result.usage.outputTokens);
    }

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error('Limits assistant error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
