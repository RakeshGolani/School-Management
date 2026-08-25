'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Fetch dynamic Student Dashboard data (Current period, Next period, Today's schedule, Attendance & Bus)
 */
export async function getStudentDashboardAction() {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;

    if (!studentId) {
      return { success: false, message: 'Student session not found. Please log in again.' };
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/dashboard?student_id=${studentId}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch student dashboard data',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getStudentDashboardAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching student dashboard data'
    };
  }
}
