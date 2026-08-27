import { NextResponse } from 'next/server';
import { encryptCookieKey } from '@/lib/cookieKeys';

/**
 * Sub-Portals Configuration
 * Any path under prefix (e.g. /teacher/*, /student/*, /parent/*) will automatically be governed by that portal's session.
 */
const PORTALS = [
  {
    prefix: '/teacher',
    loginPath: '/teacher/login',
    dashboardPath: '/teacher/dashboard',
    sessionKey: 'teacher_session',
  },
  {
    prefix: '/student',
    loginPath: '/student/login',
    dashboardPath: '/student/dashboard',
    sessionKey: 'student_session',
  },
  {
    prefix: '/parent',
    loginPath: '/parent/login',
    dashboardPath: '/parent/dashboard',
    sessionKey: 'parent_session',
  },
];

/**
 * Public Routes (No authentication required)
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
];

// Helper: Strict path matching (handles exact path and sub-paths without string boundary conflicts)
const isMatch = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Dynamic Role-Based Next.js Middleware
 * Automatically protects any current and future School Admin modules without requiring manual route additions.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;

  // Session verification helper (supports both encrypted & plain cookies)
  const hasSession = (key) => {
    const encKey = encryptCookieKey(key);
    return Boolean(cookies.get(encKey)?.value || cookies.get(key)?.value);
  };

  // 1. Check Sub-Portals first (Teacher, Student, Parent, etc.)
  const activePortal = PORTALS.find(portal => isMatch(pathname, portal.prefix));

  if (activePortal) {
    const hasPortalSession = hasSession(activePortal.sessionKey);

    // If authenticated user visits the portal login page -> redirect to portal dashboard
    if (pathname === activePortal.loginPath) {
      if (hasPortalSession) {
        return NextResponse.redirect(new URL(activePortal.dashboardPath, request.url));
      }
      return NextResponse.next();
    }

    // Protected Portal Route: Redirect unauthenticated user to portal login
    if (!hasPortalSession) {
      const loginUrl = new URL(activePortal.loginPath, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. School Admin & Public Root Routes
  const hasSchoolSession = hasSession('school_session');

  // If School Admin is already logged in and visits /login or /forgot-password -> redirect to /dashboard
  if ((pathname === '/login' || pathname === '/forgot-password') && hasSchoolSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow public routes (e.g. Landing page '/')
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Dynamic School Admin Protected Routes:
  // Any other route (e.g. /students, /teachers, /classes, /transport, or ANY future module like /library, /hostel, /inventory)
  // is automatically treated as a protected School Admin route.
  if (!hasSchoolSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Universal Next.js Matcher
 * Automatically intercepts all dynamic pages, excluding static files, images, favicon, and API endpoints.
 * Never requires manual updates when adding new pages.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
};
