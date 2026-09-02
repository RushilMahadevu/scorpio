import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category = 'bug',
      priority = 'normal',
      pageUrl = '',
      userRole = 'student',
      userId = null,
      userEmail = null,
      userName = null,
      userAgent = '',
      screenshots = [],
    } = body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Please provide a description of the issue or feedback.' },
        { status: 400 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = category === 'bug' ? 'BUG' : category === 'feature' ? 'FEAT' : 'SUP';
    const ticketId = `SC-${prefix}-${Date.now().toString(36).toUpperCase().slice(-4)}${randomSuffix}`;

    const reportData = {
      ticketId,
      title: title?.trim() || `${category.toUpperCase()}: ${description.trim().slice(0, 50)}...`,
      description: description.trim(),
      category,
      priority,
      pageUrl,
      userRole,
      userId,
      userEmail,
      userName,
      screenshots: Array.isArray(screenshots) ? screenshots.slice(0, 3) : [],
      userAgent: userAgent || req.headers.get('user-agent') || 'Unknown',
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    if (adminDb) {
      try {
        await adminDb.collection('support_tickets').doc(ticketId).set(reportData);
      } catch (dbError) {
        console.error('[Support API] Error writing to Firestore:', dbError);
      }
    } else {
      console.log('[Support API] Admin DB not available, logged report:', reportData);
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Support ticket submitted successfully.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error while submitting report.';
    console.error('[Support API] Failed to submit report:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
