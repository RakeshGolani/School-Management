'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Fetch attendance roster, classes, and stats for the logged-in teacher
 */
export async function getTeacherAttendanceAction({ classId, date } = {}) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    if (!teacherId) {
      return { success: false, message: 'Teacher session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('teacher_id', teacherId);
    if (classId) params.append('class_id', classId);
    if (date) params.append('date', date);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/attendance?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch teacher attendance data',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getTeacherAttendanceAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching attendance'
    };
  }
}

/**
 * Save / bulk submit daily attendance roster from Teacher Desk
 */
export async function saveTeacherAttendanceAction({ classId, date, records } = {}) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    if (!teacherId) {
      return { success: false, message: 'Teacher session not found. Please log in again.' };
    }

    if (!Array.isArray(records) || records.length === 0) {
      return { success: false, message: 'Attendance records are required.' };
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const payload = {
      teacher_id: teacherId,
      class_id: classId,
      date: date || new Date().toISOString().split('T')[0],
      records
    };

    const res = await fetch(`${API_BASE}/teacher/attendance/save`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to save attendance'
      };
    }

    return {
      success: true,
      message: data.message || 'Attendance saved successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error in saveTeacherAttendanceAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while saving attendance'
    };
  }
}
