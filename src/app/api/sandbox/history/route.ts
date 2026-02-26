import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const { studentId, topic, difficulty, correct } = await req.json();

    if (!studentId || !topic || !difficulty) {
      return NextResponse.json({ error: 'Missing logic parameters' }, { status: 400 });
    }

    // Save to history with admin privileges
    await adminDb.collection("sandbox_history").add({
      studentId,
      topic,
      difficulty,
      correct,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("History logging error:", error);
    return NextResponse.json({ error: error?.message || 'Logging error' }, { status: 500 });
  }
}
