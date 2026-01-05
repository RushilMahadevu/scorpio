import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import chatbotConfig from '@/lib/chatbot-config.json';
import { getNavigationResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { message, userRole, userId } = await req.json();

    if (!message || !userRole || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // --- Rate Limiting ---
    const userRef = adminDb.collection('usage').doc(userId);
    const userDoc = await userRef.get();
    const now = Date.now();
    const { windowMs, maxRequests } = chatbotConfig.rateLimit;

    let usage = { count: 0, windowStart: now };
    if (userDoc.exists) {
      const data = userDoc.data();
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
    await userRef.set(usage);

    // --- AI Response using centralized logic in gemini.ts ---
    const features = userRole === 'teacher' ? chatbotConfig.teacherFeatures : chatbotConfig.studentFeatures;
    const featuresContext = features.map(f => `- ${f.label} (${f.path}) - ${f.description}`).join('\n');
    
    const text = await getNavigationResponse(
      message,
      userRole,
      featuresContext,
      chatbotConfig.systemPrompt
    );

    return NextResponse.json({ 
      text,
      remainingRequests: maxRequests - usage.count
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
