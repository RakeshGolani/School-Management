'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

/**
 * Server Action: Fetch All Student Leaves for School Admin
 */
export async function getSchoolLeavesAction({ classId, status, search } = {}) {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || session?.id || 1;

    const params = new URLSearchParams();
    params.append('school_id', schoolId);
    if (classId && classId !== 'all') params.append('class_id', classId);
    if (status && status !== 'ALL') params.append('status', status);
    if (search) params.append('search', search);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_URL}/leaves?${params.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch student leaves',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getSchoolLeavesAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching school leaves'
    };
  }
}

/**
 * Server Action: School Admin Review Student Leave (Approve or Reject)
 */
export async function reviewSchoolLeaveAction(leaveId, { status, remarks }) {
  try {
    const session = await getEncryptedCookie('school_session');

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const payload = {
      status,
      remarks
    };

    const res = await fetch(`${API_URL}/leaves/${leaveId}/review`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to review leave application',
        data: null
      };
    }

    return {
      success: true,
      message: data.message || 'Leave reviewed successfully by Administration',
      data: data.data
    };
  } catch (error) {
    console.error('Error in reviewSchoolLeaveAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while reviewing leave'
    };
  }
}
