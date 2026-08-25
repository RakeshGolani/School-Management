'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Fetch Student Transport & Smart Bus Telemetry
 */
export async function getStudentTransportAction() {
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

    const res = await fetch(`${API_BASE}/student/transport?student_id=${studentId}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch transport data',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getStudentTransportAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching transport details'
    };
  }
}
