import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { getEncryptedCookie } from '@/lib/cookieHelper';
import { getThemeCssVars } from '@/lib/themeHelper';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Vidyadmin | Simplifying Education, Empowering Admins',
  description: 'Vidyadmin: The Smart Choice for School Administration. Streamline, Manage, Succeed.',
};

/**
 * Root Server Layout
 * Reads encrypted school_session from cookie and injects full brand CSS variables
 * on the <html> tag synchronously before sending bytes to the browser — ZERO color/name flash.
 */
export default async function RootLayout({ children }) {
  const [schoolSession, teacherSession, studentSession, parentSession, branding] = await Promise.all([
    getEncryptedCookie('school_session'),
    getEncryptedCookie('teacher_session'),
    getEncryptedCookie('student_session'),
    getEncryptedCookie('parent_session'),
    getEncryptedCookie('school_branding'),
  ]);

  const resolvedColor = studentSession?.user?.school?.primary_color ||
                        studentSession?.user?.school?.primaryColor ||
                        teacherSession?.user?.school?.primary_color ||
                        teacherSession?.user?.school?.primaryColor ||
                        parentSession?.user?.school?.primary_color ||
                        parentSession?.user?.school?.primaryColor ||
                        parentSession?.user?.children?.[0]?.school?.primary_color ||
                        parentSession?.user?.children?.[0]?.school?.primaryColor ||
                        schoolSession?.user?.primaryColor || 
                        schoolSession?.user?.primary_color || 
                        branding?.primaryColor ||
                        branding?.primary_color ||
                        '#0047AB';

  const htmlStyle = getThemeCssVars(resolvedColor);

  return (
    <html lang="en" suppressHydrationWarning style={htmlStyle}>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var p = localStorage.getItem('theme_primary');
                if (p && p.startsWith('#')) {
                  var hex = p.replace('#', '');
                  if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
                  var num = parseInt(hex, 16);
                  var r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
                  document.documentElement.style.setProperty('--theme-primary-500', p);
                  document.documentElement.style.setProperty('--theme-primary-50', 'rgba(' + r + ',' + g + ',' + b + ',0.08)');
                  document.documentElement.style.setProperty('--theme-primary-100', 'rgba(' + r + ',' + g + ',' + b + ',0.15)');
                  document.documentElement.style.setProperty('--theme-primary-200', 'rgba(' + r + ',' + g + ',' + b + ',0.25)');
                }
              } catch(e) {}
            `
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
