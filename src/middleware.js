import { NextResponse } from 'next/server';
import { encryptCookieKey } from '@/lib/cookieKeys';

/**
 * Next.js Request Interceptor / Proxy
 * Enforces role-based session isolation and auto-redirects authenticated users to their respective dashboards.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;

  const schoolSessionKey = encryptCookieKey('school_session');
  const teacherSessionKey = encryptCookieKey('teacher_session');
  const parentSessionKey = encryptCookieKey('parent_session');
  const studentSessionKey = encryptCookieKey('student_session');

  const hasSchoolSession = Boolean(cookies.get(schoolSessionKey)?.value || cookies.get('school_session')?.value);
  const hasTeacherSession = Boolean(cookies.get(teacherSessionKey)?.value || cookies.get('teacher_session')?.value);
  const hasParentSession = Boolean(cookies.get(parentSessionKey)?.value || cookies.get('parent_session')?.value);
  const hasStudentSession = Boolean(cookies.get(studentSessionKey)?.value || cookies.get('student_session')?.value);

  // 1. School Admin Auth Redirect: If logged in as School Admin and visits /login -> redirect to /dashboard
  if (pathname === '/login' && hasSchoolSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Teacher Auth Redirect: If logged in as Teacher and visits /teacher/login -> redirect to /teacher/dashboard
  if (pathname === '/teacher/login' && hasTeacherSession) {
    return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
  }

  // 3. Parent Auth Redirect: If logged in as Parent and visits /parent/login -> redirect to /parent/dashboard
  if (pathname === '/parent/login' && hasParentSession) {
    return NextResponse.redirect(new URL('/parent/dashboard', request.url));
  }

  // 4. Student Auth Redirect: If logged in as Student and visits /student/login -> redirect to /student/dashboard
  if (pathname === '/student/login' && hasStudentSession) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // 5. School Admin Protected Routes: If unauthenticated -> redirect to /login
  const isSchoolDashboardRoute = 
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
    pathname.startsWith('/profile') ||
    pathname.startsWith('/academic-years');

  if (isSchoolDashboardRoute && !hasSchoolSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Teacher Protected Routes: If unauthenticated -> redirect to /teacher/login
  if (pathname.startsWith('/teacher') && pathname !== '/teacher/login' && !hasTeacherSession) {
    const loginUrl = new URL('/teacher/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 7. Parent Protected Routes: If unauthenticated -> redirect to /parent/login
  if (pathname.startsWith('/parent') && pathname !== '/parent/login' && !hasParentSession) {
    const loginUrl = new URL('/parent/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 8. Student Protected Routes: If unauthenticated -> redirect to /student/login
  if (pathname.startsWith('/student') && pathname !== '/student/login' && !hasStudentSession) {
    const loginUrl = new URL('/student/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
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
    '/academic-years/:path*',
    '/teacher/:path*',
    '/parent/:path*',
    '/student/:path*',
    '/login'
  ]
};
