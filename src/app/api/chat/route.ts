import { NextRequest, NextResponse } from 'next/server';
import { getGenerativeModel } from "firebase/ai";
import { genAI } from "@/lib/firebase";
import { adminDb } from '@/lib/firebase-admin';
import chatbotConfig from '@/lib/chatbot-config.json';

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

    // --- AI Response using same logic as gemini.ts ---
    const model = getGenerativeModel(genAI, { 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
    
    const features = userRole === 'teacher' ? chatbotConfig.teacherFeatures : chatbotConfig.studentFeatures;
    const featuresContext = features.map(f => `- ${f.label} (${f.path}) - ${f.description}`).join('\n');
    
    const fullPrompt = `${chatbotConfig.systemPrompt}\n\n${userRole.toUpperCase()} FEATURES:\n${featuresContext}\n\nUser role: ${userRole}\nUser question: ${message}\n\nIf suggesting navigation, wrap the path in parentheses like this: (/student/grades)`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      text,
      remainingRequests: maxRequests - usage.count
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
