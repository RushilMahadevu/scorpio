import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { idToken, role, organizationId: bodyOrgId } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    if (!adminAuth || !adminDb) {
      console.error('Firebase Admin not initialized. Check environment variables.');
      return NextResponse.json({ error: 'Auth service unavailable' }, { status: 500 });
    }

    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Verify the ID token first to ensure it's valid and check connectivity
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (verifyError: any) {
      console.error('[SessionAPI] Token verification failed:', verifyError);
      // Log more details in dev/prod to see what's happening
      console.error('[SessionAPI] Error Code:', verifyError.code);
      console.error('[SessionAPI] Error Message:', verifyError.message);
      
      return NextResponse.json({ 
        error: 'Invalid ID token',
        debug: process.env.NODE_ENV === 'development' ? verifyError.message : undefined 
      }, { status: 401 });
    }

    // Optional sync: Ensure token has the most up-to-date role and organizationId (Phase 1.2)
    const userId = decodedToken.uid;
    const userDocRef = adminDb!.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const resolvedOrgId = bodyOrgId || userData?.organizationId || null;

      // If an organizationId was passed in (e.g. from invite-code signup) and is not yet on
      // the user doc, persist it now so all AI-feature routes can find it.
      if (bodyOrgId && !userData?.organizationId) {
        await userDocRef.update({ organizationId: bodyOrgId });
        console.log(`Wrote organizationId ${bodyOrgId} to user doc for ${userId}`);
      }

      const currentClaims = {
        role: userData?.role || role || "student",
        organizationId: resolvedOrgId,
      };

      // Only re-set if token claims are missing or out of sync
      if (!decodedToken.role || decodedToken.organizationId !== currentClaims.organizationId) {
         await adminAuth.setCustomUserClaims(userId, currentClaims);
         console.log(`Synced custom claims for user ${userId}:`, currentClaims);
      }
    } else if (role) {
      // First time sign-up logic (if doc doesn't exist yet but role is provided)
      await adminAuth.setCustomUserClaims(userId, { role, organizationId: bodyOrgId || null });
    }

    console.log(`[SessionRoute] Creating session for ${userId} with role ${role}`);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    
    // Detailed options to ensure custom domain compatibility
    const cookieOptions: any = {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    };

    try {
      // FIREBASE HOSTING LIMITATION FIX:
      // Firebase Hosting strips ALL cookies from requests/responses EXCEPT a cookie named exactly "__session".
      // Since we need both the session token and the user's role, we must pack them into this single cookie.
      const packedSession = JSON.stringify({
        token: sessionCookie,
        role: role || null
      });

      console.log(`[SessionRoute] Setting __session cookie. Role: ${role}, Prod: ${isProd}`);
      cookieStore.set('__session', packedSession, cookieOptions);
      
      console.log(`[SessionRoute] __session cookie successfully queued for ${userId}`);
    } catch (cookieError) {
      console.error(`[SessionRoute] Fatal cookie error for user ${userId}:`, cookieError);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Auth Session Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('__session');
  // Also clean up legacy cookies just in case
  cookieStore.delete('session');
  cookieStore.delete('user-role');
  return NextResponse.json({ status: 'success' });
}
