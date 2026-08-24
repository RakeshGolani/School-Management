import { redirect } from 'next/navigation';
import { getEncryptedCookie } from '@/lib/cookieHelper';
import StudentLayout from '@/components/layout/student/StudentLayout';
import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

/**
 * Server Component Layout for Student Portal
 * Validates student_session cookie. If missing/invalid, redirects to /student/login.
 */
export default async function Layout({ children }) {
  const session = await getEncryptedCookie('student_session');

  if (!session || !session.token) {
    redirect('/student/login');
  }

  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <StudentLayout user={session.user}>
        {children}
      </StudentLayout>
    </BackendStatusProvider>
  );
}
