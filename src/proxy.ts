import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const rawSession = request.cookies.get('__session')?.value;
  
  let sessionToken = null;
  let role = null;

  if (rawSession) {
    try {
      const parsed = JSON.parse(rawSession);
      sessionToken = parsed.token;
      role = parsed.role;
    } catch (e) {
      console.error("[Middleware] Failed to parse __session cookie as JSON");
    }
  }

  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Path: ${pathname}, Session: ${!!sessionToken}, Role: ${role}`);

  // Use sessionToken instead of legacy session
  const session = sessionToken;

  // 1. Auth routes handling when logged in
  if (session && (pathname === '/login' || pathname === '/signup')) {
    if (role === 'teacher') {
      console.log(`[Middleware] Redirecting logged in teacher to /teacher`);
      return NextResponse.redirect(new URL('/teacher', request.url));
    } else if (role === 'student') {
      console.log(`[Middleware] Redirecting logged in student to /student`);
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  // 2. Protected routes handling
  if (!session) {
    if (pathname.startsWith('/teacher') || pathname.startsWith('/student')) {
      console.log(`[Middleware] Unauthenticated access - redirecting to /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // If we have a session but NO role yet, don't kick back to login immediately.
    // This allows the client-side session to take over if the cookie is still propagating.
    if (!role) {
      console.log(`[Middleware] Session exists but Role is missing. Allowing access.`);
      return NextResponse.next();
    }

    // Strict RBAC
    if (pathname.startsWith('/teacher') && role !== 'teacher') {
      console.log(`[Middleware] Role mismatch - student restricted to /student`);
      return NextResponse.redirect(new URL('/student', request.url));
    }
    if (pathname.startsWith('/student') && role !== 'student' && role !== 'teacher') {
      console.log(`[Middleware] Unauthorized role access attempt - redirecting to /login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/teacher/:path*',
    '/student/:path*',
    '/login',
    '/signup',
    '/',
  ],
};
