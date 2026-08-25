'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Fetch Student's Class Timetable
 */
export async function getStudentTimetableAction({ academicYearId } = {}) {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;

    if (!studentId) {
      return { success: false, message: 'Student session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('student_id', studentId);
    if (academicYearId) params.append('academic_year_id', academicYearId);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/timetable?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch student timetable',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getStudentTimetableAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching student timetable'
    };
  }
}
