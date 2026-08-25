'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Fetch Assigned Class Students for logged-in teacher
 */
export async function getTeacherStudentsAction({ classId, search } = {}) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    if (!teacherId) {
      return { success: false, message: 'Teacher session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('teacher_id', teacherId);
    if (classId) params.append('class_id', classId);
    if (search) params.append('search', search);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/students?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch students',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getTeacherStudentsAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching students'
    };
  }
}
