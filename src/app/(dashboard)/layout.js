import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getEncryptedCookie, deleteEncryptedCookie } from '@/lib/cookieHelper';
import { encryptCookieKey } from '@/lib/cookieKeys';
import SchoolClientLayout from '@/components/layout/SchoolClientLayout';

/**
 * Server Component: Validates school_session on the server.
 * If session is expired, invalid, or missing, immediately logs out and redirects to /login.
 */
export default async function DashboardLayout({ children }) {
  const session = await getEncryptedCookie('school_session');

  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const encKey = encryptCookieKey('school_sidebar_collapsed');
  const initialCollapsed = (cookieStore.get(encKey)?.value || cookieStore.get('school_sidebar_collapsed')?.value) === 'true';

  return (
    <SchoolClientLayout initialCollapsed={initialCollapsed}>
      {children}
    </SchoolClientLayout>
  );
}
