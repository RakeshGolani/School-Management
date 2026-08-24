import { redirect } from 'next/navigation';
import { getEncryptedCookie } from '@/lib/cookieHelper';
import TeacherLayout from '@/components/layout/teacher/TeacherLayout';
import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

/**
 * Server Component Layout for Teacher Portal
 * Validates teacher_session cookie. If missing/invalid, redirects to /teacher/login.
 */
export default async function Layout({ children }) {
  const session = await getEncryptedCookie('teacher_session');

  if (!session || !session.token) {
    redirect('/teacher/login');
  }

  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <TeacherLayout user={session.user}>
        {children}
      </TeacherLayout>
    </BackendStatusProvider>
  );
}
