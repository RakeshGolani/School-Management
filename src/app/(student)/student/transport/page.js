'use server';

import { getStudentSessionAction } from '@/actions/student/authActions';
import { getStudentTransportAction } from '@/actions/student/transportActions';
import { redirect } from 'next/navigation';
import StudentTransportClient from './StudentTransportClient';

export default async function StudentTransportPage() {
  const session = await getStudentSessionAction();

  if (!session?.user) {
    redirect('/student/login');
  }

  const initialRes = await getStudentTransportAction();

  return (
    <StudentTransportClient 
      initialUser={session.user} 
      initialData={initialRes?.success ? initialRes.data : null} 
    />
  );
}
