'use server';

import { getTeacherSessionAction } from '@/actions/teacher/authActions';
import { getTeacherStudentLeavesAction } from '@/actions/teacher/leaveActions';
import { redirect } from 'next/navigation';
import TeacherLeavesClient from './TeacherLeavesClient';

export default async function TeacherLeavesPage() {
  const session = await getTeacherSessionAction();

  if (!session?.user) {
    redirect('/teacher/login');
  }

  const initialRes = await getTeacherStudentLeavesAction();

  return (
    <TeacherLeavesClient 
      initialUser={session.user} 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
