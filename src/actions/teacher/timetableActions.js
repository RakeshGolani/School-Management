'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Fetch Teaching Schedule & Timetable Matrix for logged-in teacher
 */
export async function getTeacherTimetableAction({ academicYearId } = {}) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    if (!teacherId) {
      return { success: false, message: 'Teacher session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('teacher_id', teacherId);
    if (academicYearId) params.append('academic_year_id', academicYearId);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/timetable?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch timetable',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getTeacherTimetableAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching timetable'
    };
  }
}
