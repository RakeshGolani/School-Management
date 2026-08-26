'use server';

import { getParentSessionAction, getParentActiveChildAction } from '@/actions/parent/authActions';
import { getParentBusTrackingAction } from '@/actions/parent/transportActions';
import { redirect } from 'next/navigation';
import ParentBusTrackingClient from './ParentBusTrackingClient';

export default async function ParentBusTrackingPage() {
  const session = await getParentSessionAction();

  if (!session?.user) {
    redirect('/parent/login');
  }

  // Get active child saved in parent cookie or fallback to first
  const { activeChild } = await getParentActiveChildAction(session.user);
  const initialRes = await getParentBusTrackingAction(activeChild?.id);

  return (
    <ParentBusTrackingClient 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
