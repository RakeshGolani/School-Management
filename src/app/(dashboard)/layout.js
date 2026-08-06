import { cookies } from 'next/headers';
import SchoolClientLayout from '@/components/layout/SchoolClientLayout';

/**
 * Server Component: Reads the sidebar collapsed state from cookie on the server
 * so that the correct initial state is passed to the client layout — 
 * preventing any layout flash (FOUC) on page refresh.
 */
export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get('school_sidebar_collapsed')?.value === 'true';

  return (
    <SchoolClientLayout initialCollapsed={initialCollapsed}>
      {children}
    </SchoolClientLayout>
  );
}
