'use server';

import { getParentSessionAction } from '@/actions/parent/authActions';
import { getParentAttendanceAction } from '@/actions/parent/attendanceActions';
import { redirect } from 'next/navigation';
import ParentAttendanceClient from './ParentAttendanceClient';

export default async function ParentAttendancePage() {
  const session = await getParentSessionAction();

  if (!session?.user) {
    redirect('/parent/login');
  }

  const initialChild = session.user?.children?.[0] || session.user?.child;
  const initialRes = await getParentAttendanceAction({
    studentId: initialChild?.id
  });

  return (
    <ParentAttendanceClient 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
