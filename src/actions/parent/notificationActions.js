'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Fetch notifications for logged-in Parent
 */
export async function getParentNotificationsAction({ page = 1, limit = 20, type = 'ALL', is_read = '', search = '' } = {}) {
  try {
    const session = await getEncryptedCookie('parent_session');
    const parentId = session?.user?.id || session?.id;
    const schoolId = session?.user?.school?.id || session?.user?.children?.[0]?.school_id || session?.schoolId;

    if (!parentId) {
      return { success: false, message: 'Parent session not found. Please log in again.' };
    }

    const params = new URLSearchParams();
    params.append('parent_id', parentId);
    if (schoolId) params.append('school_id', schoolId);
    params.append('page', page);
    params.append('limit', limit);
    if (type && type !== 'ALL') params.append('type', type);
    if (is_read !== '') params.append('is_read', is_read);
    if (search) params.append('search', search);

    const headers = {
      'Content-Type': 'application/json',
      'x-parent-id': String(parentId),
      ...(schoolId ? { 'x-school-id': String(schoolId) } : {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/parent/notifications?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getParentNotificationsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch parent notifications' };
  }
}

/**
 * Get unread notification count for Parent
 */
export async function getParentUnreadCountAction() {
  try {
    const session = await getEncryptedCookie('parent_session');
    const parentId = session?.user?.id || session?.id;
    const schoolId = session?.user?.school?.id || session?.user?.children?.[0]?.school_id || session?.schoolId;

    if (!parentId) {
      return { success: false, data: { unread_count: 0 } };
    }

    const params = new URLSearchParams({ parent_id: parentId });
    if (schoolId) params.append('school_id', schoolId);

    const headers = {
      'Content-Type': 'application/json',
      'x-parent-id': String(parentId),
      ...(schoolId ? { 'x-school-id': String(schoolId) } : {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/parent/notifications/unread-count?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getParentUnreadCountAction:', error);
    return { success: false, data: { unread_count: 0 } };
  }
}

/**
 * Mark single parent notification as read
 */
export async function markParentNotificationReadAction(notificationId) {
  try {
    const session = await getEncryptedCookie('parent_session');
    const parentId = session?.user?.id;

    const headers = {
      'Content-Type': 'application/json',
      'x-parent-id': String(parentId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/parent/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markParentNotificationReadAction:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Mark all parent notifications as read
 */
export async function markAllParentNotificationsReadAction() {
  try {
    const session = await getEncryptedCookie('parent_session');
    const parentId = session?.user?.id;

    const headers = {
      'Content-Type': 'application/json',
      'x-parent-id': String(parentId),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/parent/notifications/read-all`, {
      method: 'PATCH',
      headers
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in markAllParentNotificationsReadAction:', error);
    return { success: false, message: error.message };
  }
}
