'use server';

import { getStudentSessionAction } from '@/actions/student/authActions';
import { getStudentTimetableAction } from '@/actions/student/timetableActions';
import { redirect } from 'next/navigation';
import StudentTimetableClient from './StudentTimetableClient';

export default async function StudentTimetablePage() {
  const session = await getStudentSessionAction();

  if (!session?.user) {
    redirect('/student/login');
  }

  const initialRes = await getStudentTimetableAction();

  return (
    <StudentTimetableClient 
      initialUser={session.user} 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
