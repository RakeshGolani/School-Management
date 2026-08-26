'use server';

import { getParentSessionAction, getParentActiveChildAction } from '@/actions/parent/authActions';
import { getParentTimetableAction } from '@/actions/parent/timetableActions';
import { redirect } from 'next/navigation';
import ParentTimetableClient from './ParentTimetableClient';

export default async function ParentTimetablePage() {
  const session = await getParentSessionAction();

  if (!session?.user) {
    redirect('/parent/login');
  }

  const { activeChild } = await getParentActiveChildAction(session.user);

  const initialRes = await getParentTimetableAction({
    studentId: activeChild?.id
  });

  return (
    <ParentTimetableClient 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
