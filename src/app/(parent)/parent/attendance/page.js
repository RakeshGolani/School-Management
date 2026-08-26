'use server';

import { getParentSessionAction, getParentActiveChildAction } from '@/actions/parent/authActions';
import { getParentAttendanceAction } from '@/actions/parent/attendanceActions';
import { redirect } from 'next/navigation';
import ParentAttendanceClient from './ParentAttendanceClient';

export default async function ParentAttendancePage() {
  const session = await getParentSessionAction();

  if (!session?.user) {
    redirect('/parent/login');
  }

  const { activeChild } = await getParentActiveChildAction(session.user);
  const initialRes = await getParentAttendanceAction({
    studentId: activeChild?.id
  });

  return (
    <ParentAttendanceClient 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
