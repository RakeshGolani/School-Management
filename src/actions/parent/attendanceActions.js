'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Get Ward Attendance History & Stats for Parent Portal
 */
export async function getParentAttendanceAction({ studentId, month, year } = {}) {
  try {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${API_BASE}/parent/attendance${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch ward attendance'
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Error in getParentAttendanceAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}
