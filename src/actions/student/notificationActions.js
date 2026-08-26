'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Fetch notifications for logged-in Student
 */
export async function getStudentNotificationsAction({ page = 1, limit = 20, type = 'ALL', is_read = '', search = '' } = {}) {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;
    const schoolId = session?.user?.school?.id || session?.schoolId;

    if (!studentId) {
      return { success: false, message: 'Student session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('student_id', studentId);
    if (schoolId) params.append('school_id', schoolId);
    params.append('page', page);
    params.append('limit', limit);
    if (type && type !== 'ALL') params.append('type', type);
    if (is_read !== '') params.append('is_read', is_read);
    if (search) params.append('search', search);

    const headers = {
      'Content-Type': 'application/json',
      'x-student-id': String(studentId),
      ...(schoolId ? { 'x-school-id': String(schoolId) } : {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/notifications?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getStudentNotificationsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch student notifications' };
  }
}

/**
 * Get unread notification count for Student
 */
export async function getStudentUnreadCountAction() {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;
    const schoolId = session?.user?.school?.id || session?.schoolId;

    if (!studentId) {
      return { success: false, data: { unread_count: 0 } };
    }

    const params = new URLSearchParams({ student_id: studentId });
    if (schoolId) params.append('school_id', schoolId);

    const headers = {
      'Content-Type': 'application/json',
      'x-student-id': String(studentId),
      ...(schoolId ? { 'x-school-id': String(schoolId) } : {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/notifications/unread-count?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getStudentUnreadCountAction:', error);
    return { success: false, data: { unread_count: 0 } };
  }
}

/**
 * Mark single student notification as read
 */
export async function markStudentNotificationReadAction(notificationId) {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;

    const headers = {
      'Content-Type': 'application/json',
      'x-student-id': String(studentId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markStudentNotificationReadAction:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Mark all student notifications as read
 */
export async function markAllStudentNotificationsReadAction() {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;

    const headers = {
      'Content-Type': 'application/json',
      'x-student-id': String(studentId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/notifications/read-all`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markAllStudentNotificationsReadAction:', error);
    return { success: false, message: error.message };
  }
}
