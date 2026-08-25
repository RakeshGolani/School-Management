import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'School Management System - Admin',
  description: 'Premium Dashboard for School Management',
};

/**
 * Root Server Layout
 * Reads school's primary color from cookie and injects it as inline CSS variables
 * on the <html> tag — BEFORE any JS runs — eliminating the green flash (FOUC).
 */
export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const rawColor = cookieStore.get('theme_primary_color')?.value;
  const color = rawColor ? decodeURIComponent(rawColor) : null;

  // Build a React style object with CSS custom properties so vars are set
  // synchronously from the very first HTML byte — ZERO green flash.
  const htmlStyle = color
    ? {
        '--theme-primary-500': color,
        '--theme-primary-400': color,
        '--theme-primary-300': color,
        '--theme-primary-600': color,
        '--theme-primary-700': color,
        '--theme-primary-800': color,
        '--theme-primary-900': color,
        '--theme-primary-50':  color + '1a',
        '--theme-primary-100': color + '26',
        '--theme-primary-200': color + '40',
      }
    : {};

  return (
    <html lang="en" suppressHydrationWarning style={htmlStyle}>
      <head />
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
