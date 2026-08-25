import { getSchoolLeavesAction } from '@/actions/school/leaveActions';
import SchoolLeavesClient from './SchoolLeavesClient';

export const metadata = {
  title: 'Student Leave Management | School Management'
};

export default async function SchoolLeavesPage() {
  const initialData = await getSchoolLeavesAction();

  return <SchoolLeavesClient initialData={initialData} />;
}
