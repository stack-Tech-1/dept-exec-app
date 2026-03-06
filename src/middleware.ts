import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/tasks',
  '/minutes',
  '/admin',
  '/goals',
  '/meetings',
  '/reports',
  '/users',
  '/profile',
  '/notifications',
  '/members',
  '/announcements',
];
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('dept_exec_token')?.value;
  const userCookie = request.cookies.get('dept_exec_user')?.value;
  
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      // Invalid user data
    }
  }

  const { pathname } = request.nextUrl;

  // ✅ FIX 1: Check if this is /register with an invite token
  const hasInviteToken = request.nextUrl.searchParams.has('token');
  
  // ✅ FIX 2: If it's /register with an invite token, ALWAYS allow access
  if (pathname === '/register' && hasInviteToken) {
    // Clear any auth cookies for this request (optional but recommended)
    const response = NextResponse.next();
    response.cookies.delete('dept_exec_token');
    response.cookies.delete('dept_exec_user');
    return response;
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Redirect to login if no token and trying to access protected route
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect if trying to access admin route without admin role
  if (isAdminRoute && user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Allow access to login page only if not authenticated
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ FIX 3: Remove or update this rule - it's causing the problem!
  // Only redirect from /register if NO invite token
  if (pathname === '/register' && token && !hasInviteToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tasks/:path*',
    '/minutes/:path*',
    '/admin/:path*',
    '/goals/:path*',
    '/meetings/:path*',
    '/reports/:path*',
    '/users/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/members/:path*',
    '/announcements/:path*',
    '/login',
    '/register',
  ],
};