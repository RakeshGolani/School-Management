'use server';

import { getParentSessionAction, getParentActiveChildAction } from '@/actions/parent/authActions';
import { getParentDashboardAction } from '@/actions/parent/dashboardActions';
import { redirect } from 'next/navigation';
import ParentDashboardClient from './ParentDashboardClient';

export default async function ParentDashboardPage() {
  const session = await getParentSessionAction();

  if (!session?.user) {
    redirect('/parent/login');
  }

  const { activeChild } = await getParentActiveChildAction(session.user);

  const initialRes = await getParentDashboardAction({
    studentId: activeChild?.id
  });

  return (
    <ParentDashboardClient 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
