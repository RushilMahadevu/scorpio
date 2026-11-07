import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    const { idToken } = await req.json();
    const token = await adminAuth.verifyIdToken(idToken, true);
    const profile = (await adminDb.collection('users').doc(token.uid).get()).data();
    if (!profile || !['teacher', 'student'].includes(profile.role)) return NextResponse.json({ error: 'Complete registration first' }, { status: 403 });
    // Roles and enrollment come exclusively from the server-managed profile.
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const session = await adminAuth.createSessionCookie(idToken, { expiresIn });
    (await cookies()).set('__session', session, {
      maxAge: expiresIn / 1000, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    });
    return NextResponse.json({ status: 'success', role: profile.role });
  } catch {
    return NextResponse.json({ error: 'Invalid session credentials' }, { status: 401 });
  }
}
export async function DELETE() {
  (await cookies()).delete('__session');
  return NextResponse.json({ status: 'success' });
}
