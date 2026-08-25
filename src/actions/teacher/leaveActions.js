'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Fetch Student Leaves Queue for Class Teacher Review
 */
export async function getTeacherStudentLeavesAction() {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    if (!teacherId) {
      return { success: false, message: 'Teacher session not found. Please log in again.' };
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/leaves?teacher_id=${teacherId}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to fetch student leave requests',
        data: null
      };
    }

    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error in getTeacherStudentLeavesAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching leave requests'
    };
  }
}

/**
 * Server Action: Review Student Leave (Approve / Reject)
 */
export async function reviewStudentLeaveAction(leaveId, { status, teacher_remarks }) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const teacherId = session?.user?.id;

    if (!teacherId) {
      return { success: false, message: 'Teacher session not found. Please log in again.' };
    }

    const payload = {
      teacher_id: teacherId,
      status,
      teacher_remarks
    };

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/teacher/leaves/${leaveId}/review`, {
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
      message: data.message || 'Leave application reviewed successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error in reviewStudentLeaveAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while reviewing leave application'
    };
  }
}
