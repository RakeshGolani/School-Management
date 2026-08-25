'use server';

import { getStudentSessionAction } from '@/actions/student/authActions';
import { getStudentAttendanceAction } from '@/actions/student/attendanceActions';
import { redirect } from 'next/navigation';
import StudentAttendanceClient from './StudentAttendanceClient';

export default async function StudentAttendancePage() {
  const session = await getStudentSessionAction();

  if (!session?.user) {
    redirect('/student/login');
  }

  const initialRes = await getStudentAttendanceAction();

  return (
    <StudentAttendanceClient 
      initialUser={session.user} 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
