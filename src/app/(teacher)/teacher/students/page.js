'use server';

import { getTeacherSessionAction } from '@/actions/teacher/authActions';
import { getTeacherStudentsAction } from '@/actions/teacher/studentActions';
import { redirect } from 'next/navigation';
import TeacherStudentsClient from './TeacherStudentsClient';

export default async function TeacherStudentsPage() {
  const session = await getTeacherSessionAction();

  if (!session?.user) {
    redirect('/teacher/login');
  }

  const initialRes = await getTeacherStudentsAction();

  return (
    <TeacherStudentsClient 
      initialUser={session.user} 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
