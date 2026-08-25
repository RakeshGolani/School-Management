'use server';

import { getParentSessionAction } from '@/actions/parent/authActions';
import { getParentBusTrackingAction } from '@/actions/parent/transportActions';
import { redirect } from 'next/navigation';
import ParentBusTrackingClient from './ParentBusTrackingClient';

export default async function ParentBusTrackingPage() {
  const session = await getParentSessionAction();

  if (!session?.user) {
    redirect('/parent/login');
  }

  // Get first child id if present in session
  const initialChild = session.user?.children?.[0] || session.user?.child;
  const initialRes = await getParentBusTrackingAction(initialChild?.id);

  return (
    <ParentBusTrackingClient 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
