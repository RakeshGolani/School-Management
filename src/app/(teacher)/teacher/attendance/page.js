'use server';

import TeacherAttendanceClient from './TeacherAttendanceClient';
import { getTeacherSessionAction } from '@/actions/teacher/authActions';
import { getTeacherAttendanceAction } from '@/actions/teacher/attendanceActions';
import { redirect } from 'next/navigation';

export default async function TeacherAttendancePage() {
  const session = await getTeacherSessionAction();

  if (!session?.user) {
    redirect('/teacher/login');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const initialData = await getTeacherAttendanceAction({ date: todayStr });

  return (
    <TeacherAttendanceClient 
      initialUser={session.user} 
      initialAttendance={initialData?.success ? initialData.data : null} 
      initialDate={todayStr}
    />
  );
}
