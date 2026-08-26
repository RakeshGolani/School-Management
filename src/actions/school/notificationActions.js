'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

/**
 * Fetch notifications for School Admin
 */
export async function getSchoolNotificationsAction({ page = 1, limit = 20, type = 'ALL', is_read = '', search = '' } = {}) {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || session?.id || 1;

    const params = new URLSearchParams();
    params.append('school_id', schoolId);
    params.append('page', page);
    params.append('limit', limit);
    if (type && type !== 'ALL') params.append('type', type);
    if (is_read !== '') params.append('is_read', is_read);
    if (search) params.append('search', search);

    const headers = {
      'Content-Type': 'application/json',
      'x-school-id': String(schoolId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_URL}/notifications?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getSchoolNotificationsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch notifications' };
  }
}

/**
 * Get unread notification count for School
 */
export async function getSchoolUnreadCountAction() {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || session?.id || 1;

    const headers = {
      'Content-Type': 'application/json',
      'x-school-id': String(schoolId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_URL}/notifications/unread-count`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getSchoolUnreadCountAction:', error);
    return { success: false, data: { unread_count: 0 } };
  }
}

/**
 * Mark single notification as read
 */
export async function markSchoolNotificationReadAction(notificationId) {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || session?.id || 1;

    const headers = {
      'Content-Type': 'application/json',
      'x-school-id': String(schoolId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markSchoolNotificationReadAction:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Mark all school notifications as read
 */
export async function markAllSchoolNotificationsReadAction() {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || session?.id || 1;

    const headers = {
      'Content-Type': 'application/json',
      'x-school-id': String(schoolId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markAllSchoolNotificationsReadAction:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Broadcast announcement to selected target roles / classes
 */
export async function broadcastAnnouncementAction({ title, message, target_roles, target_class_id, priority, action_url }) {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || session?.id || 1;

    const headers = {
      'Content-Type': 'application/json',
      'x-school-id': String(schoolId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_URL}/notifications/broadcast`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        school_id: schoolId,
        title,
        message,
        target_roles,
        target_class_id: target_class_id || null,
        priority: priority || 'NORMAL',
        action_url: action_url || null
      })
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in broadcastAnnouncementAction:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Delete notification
 */
export async function deleteSchoolNotificationAction(notificationId) {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || session?.id || 1;

    const headers = {
      'Content-Type': 'application/json',
      'x-school-id': String(schoolId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in deleteSchoolNotificationAction:', error);
    return { success: false, message: error.message };
  }
}
