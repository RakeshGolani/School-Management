import { redirect } from 'next/navigation';
import { getEncryptedCookie } from '@/lib/cookieHelper';
import ParentLayout from '@/components/layout/parent/ParentLayout';
import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

/**
 * Server Component Layout for Parent Portal
 * Validates parent_session cookie. If missing/invalid, redirects to /parent/login.
 */
export default async function Layout({ children }) {
  const session = await getEncryptedCookie('parent_session');

  if (!session || !session.token) {
    redirect('/parent/login');
  }

  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <ParentLayout user={session.user}>
        {children}
      </ParentLayout>
    </BackendStatusProvider>
  );
}
