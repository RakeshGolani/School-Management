'use server';

import { getTeacherSessionAction } from '@/actions/teacher/authActions';
import { getTeacherTimetableAction } from '@/actions/teacher/timetableActions';
import { redirect } from 'next/navigation';
import TeacherTimetableClient from './TeacherTimetableClient';

export default async function TeacherTimetablePage() {
  const session = await getTeacherSessionAction();

  if (!session?.user) {
    redirect('/teacher/login');
  }

  const timetableRes = await getTeacherTimetableAction();

  return (
    <TeacherTimetableClient 
      initialUser={session.user} 
      initialData={timetableRes?.success ? timetableRes.data : null} 
    />
  );
}
