'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Fetch notifications for logged-in Teacher
 */
export async function getTeacherNotificationsAction({ page = 1, limit = 20, type = 'ALL', is_read = '', search = '' } = {}) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;
    const schoolId = session?.user?.school?.id || session?.schoolId;

    if (!teacherId) {
      return { success: false, message: 'Teacher session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('teacher_id', teacherId);
    if (schoolId) params.append('school_id', schoolId);
    params.append('page', page);
    params.append('limit', limit);
    if (type && type !== 'ALL') params.append('type', type);
    if (is_read !== '') params.append('is_read', is_read);
    if (search) params.append('search', search);

    const headers = {
      'Content-Type': 'application/json',
      'x-teacher-id': String(teacherId),
      ...(schoolId ? { 'x-school-id': String(schoolId) } : {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/notifications?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getTeacherNotificationsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch teacher notifications' };
  }
}

/**
 * Get unread notification count for Teacher
 */
export async function getTeacherUnreadCountAction() {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;
    const schoolId = session?.user?.school?.id || session?.schoolId;

    if (!teacherId) {
      return { success: false, data: { unread_count: 0 } };
    }

    const params = new URLSearchParams({ teacher_id: teacherId });
    if (schoolId) params.append('school_id', schoolId);

    const headers = {
      'Content-Type': 'application/json',
      'x-teacher-id': String(teacherId),
      ...(schoolId ? { 'x-school-id': String(schoolId) } : {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/notifications/unread-count?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getTeacherUnreadCountAction:', error);
    return { success: false, data: { unread_count: 0 } };
  }
}

/**
 * Mark single teacher notification as read
 */
export async function markTeacherNotificationReadAction(notificationId) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    const headers = {
      'Content-Type': 'application/json',
      'x-teacher-id': String(teacherId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markTeacherNotificationReadAction:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Mark all teacher notifications as read
 */
export async function markAllTeacherNotificationsReadAction() {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    const headers = {
      'Content-Type': 'application/json',
      'x-teacher-id': String(teacherId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/notifications/read-all`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markAllTeacherNotificationsReadAction:', error);
    return { success: false, message: error.message };
  }
}
