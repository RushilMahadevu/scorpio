import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { idToken, role } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    if (!adminAuth) {
      console.error('Firebase Admin Auth not initialized. Check environment variables.');
      return NextResponse.json({ error: 'Auth service unavailable' }, { status: 500 });
    }

    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Verify the ID token first to ensure it's valid and check connectivity
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 });
    }

    // Optional sync: Ensure token has the most up-to-date role and organizationId (Phase 1.2)
    const userId = decodedToken.uid;
    const userDocRef = adminDb!.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentClaims = {
        role: userData?.role || role || "student",
        organizationId: userData?.organizationId || null,
      };

      // Only re-set if token claims are missing or out of sync
      if (!decodedToken.role || decodedToken.organizationId !== currentClaims.organizationId) {
         await adminAuth.setCustomUserClaims(userId, currentClaims);
         console.log(`Synced custom claims for user ${userId}:`, currentClaims);
      }
    } else if (role) {
      // First time sign-up logic (if doc doesn't exist yet but role is provided)
      await adminAuth.setCustomUserClaims(userId, { role, organizationId: null });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    if (role) {
      cookieStore.set('user-role', role, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Auth Session Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.delete('user-role');
  return NextResponse.json({ status: 'success' });
}
