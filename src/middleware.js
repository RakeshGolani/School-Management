import { NextResponse } from 'next/server';

/**
 * Next.js Request Interceptor / Proxy
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const allCookies = request.cookies.getAll();
  const hasSessionCookie = allCookies.some(
    (c) => c.name.startsWith('enc_key_') || c.name === 'school_session'
  );

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboardRoute = 
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/students') ||
    pathname.startsWith('/teachers') ||
    pathname.startsWith('/classes') ||
    pathname.startsWith('/timetable') ||
    pathname.startsWith('/transport') ||
    pathname.startsWith('/fees') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/profile');

  // If user tries to access protected route without session cookie -> redirect to /login
  if (isDashboardRoute && !hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already authenticated and visits login/register -> redirect to /dashboard
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/teachers/:path*',
    '/classes/:path*',
    '/timetable/:path*',
    '/transport/:path*',
    '/fees/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/login',
    '/register'
  ]
};
