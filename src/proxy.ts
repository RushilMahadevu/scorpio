import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const role = request.cookies.get('user-role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Public routes handling when logged in
  if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    if (role === 'teacher') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    } else if (role === 'student') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  // 2. Protected routes handling
  if (!session) {
    if (pathname.startsWith('/teacher') || pathname.startsWith('/student')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // Strict RBAC
    if (pathname.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    if (pathname.startsWith('/student') && role !== 'student' && role !== 'teacher') {
      // Allow teachers to view student routes if needed, but students can't view teacher routes
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
