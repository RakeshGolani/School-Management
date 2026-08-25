'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Fetch Student Attendance Telemetry & Logs
 */
export async function getStudentAttendanceAction({ month, year } = {}) {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;

    if (!studentId) {
      return { success: false, message: 'Student session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('student_id', studentId);
    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/attendance?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch student attendance',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getStudentAttendanceAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching attendance'
    };
  }
}
