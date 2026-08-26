import { cookies } from 'next/headers';
import ParentFeesClient from './ParentFeesClient';
import { getParentFeesAction } from '@/actions/parent/feeActions';

export const metadata = {
  title: 'Fee Invoices & Receipts | Parent Portal',
  description: 'View student fee accounts, upcoming installments, and payment history.'
};

export default async function ParentFeesPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('parent_session')?.value;
  let initialData = null;

  try {
    if (sessionCookie) {
      const decodedSession = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
      const activeChildId = decodedSession?.children?.[0]?.id;

      if (activeChildId) {
        const res = await getParentFeesAction({ studentId: activeChildId });
        if (res?.success) {
          initialData = res.data;
        }
      }
    }
  } catch (err) {
    console.warn('Could not prefetch parent fees in server component:', err.message);
  }

  return <ParentFeesClient initialData={initialData} />;
}
