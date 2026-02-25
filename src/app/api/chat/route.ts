import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import chatbotConfig from '@/lib/chatbot-config.json';
import { getNavigationResponse } from '@/lib/gemini';
import { checkBudget, recordUsage } from '@/lib/usage-limit';

export async function POST(req: NextRequest) {
  try {
    const { message, userRole, userId } = await req.json();

    if (!message || !userRole || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // 1. Resolve OrganizationId from User ID
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const userData = userDoc.data();
    let organizationId = userData?.organizationId;

    // Fallback: If student doesn't have an organization, inherit from teacher
    if (!organizationId && userData?.role === "student" && userData?.teacherId) {
      const teacherDoc = await adminDb.collection("users").doc(userData.teacherId).get();
      if (teacherDoc.exists) {
        organizationId = teacherDoc.data()?.organizationId;
      }
    }

    console.log(`[NavAI] Message from ${userId} (${userRole}), Org: ${organizationId || 'NONE'}`);

    // 2. Check Budget for Organization
    const budgetCheck = await checkBudget(organizationId, "navigation");
    if (!budgetCheck.allowed) {
      return NextResponse.json({ error: budgetCheck.error }, { status: 403 });
    }

    // --- Rate Limiting (Legacy User-Level) ---
    const userUsageRef = adminDb.collection('usage').doc(userId);
    const userUsageDoc = await userUsageRef.get();
    const now = Date.now();
    const { windowMs, maxRequests } = chatbotConfig.rateLimit;

    let usage = { count: 0, windowStart: now };
    if (userUsageDoc.exists) {
      const data = userUsageDoc.data();
      if (data) {
        usage = { count: data.count, windowStart: data.windowStart };
      }
    }

    if (now - usage.windowStart > windowMs) {
      usage.count = 0;
      usage.windowStart = now;
    }

    if (usage.count >= maxRequests) {
      return NextResponse.json({ 
        error: `Rate limit exceeded. Max ${maxRequests} requests per hour.` 
      }, { status: 429 });
    }

    // Increment usage
    usage.count++;
    await userUsageRef.set(usage);

    // AI Response using centralized logic in gemini.ts ---
    const features = userRole === 'teacher' ? chatbotConfig.teacherFeatures : chatbotConfig.studentFeatures;
    const featuresContext = features.map(f => `- ${f.label} (${f.path}) - ${f.description}`).join('\n');
    
    const result = await getNavigationResponse(
      message,
      userRole,
      featuresContext,
      chatbotConfig.systemPrompt
    );

    // Record precise token-based usage
    if (result.usage) {
      await recordUsage(organizationId, "navigation", result.usage.inputTokens, result.usage.outputTokens);
    }

    return NextResponse.json({ 
      text: result.text,
      remainingRequests: maxRequests - usage.count
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
