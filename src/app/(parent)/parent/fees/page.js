import { getEncryptedCookie } from '@/lib/cookieHelper';
import ParentFeesClient from './ParentFeesClient';
import { getParentFeesAction } from '@/actions/parent/feeActions';

export const metadata = {
  title: 'Fee Invoices & Receipts | Parent Portal',
  description: 'View student fee accounts, upcoming installments, and payment history.'
};

export default async function ParentFeesPage() {
  let initialData = null;

  try {
    const parentSession = await getEncryptedCookie('parent_session');
    const activeChildId = parentSession?.user?.children?.[0]?.id || parentSession?.user?.child?.id;

    if (activeChildId) {
      const res = await getParentFeesAction({ studentId: activeChildId });
      if (res?.success) {
        initialData = res.data;
      }
    }
  } catch (err) {
    console.warn('Could not prefetch parent fees in server component:', err.message);
  }

  return <ParentFeesClient initialData={initialData} />;
}
