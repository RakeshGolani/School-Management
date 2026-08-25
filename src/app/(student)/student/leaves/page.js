'use server';

import { getStudentSessionAction } from '@/actions/student/authActions';
import { getStudentLeavesAction } from '@/actions/student/leaveActions';
import { redirect } from 'next/navigation';
import StudentLeavesClient from './StudentLeavesClient';

export default async function StudentLeavesPage() {
  const session = await getStudentSessionAction();

  if (!session?.user) {
    redirect('/student/login');
  }

  const initialRes = await getStudentLeavesAction();

  return (
    <StudentLeavesClient 
      initialUser={session.user} 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
