'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Fetch Student Leave Applications & Stats
 */
export async function getStudentLeavesAction() {
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

    const res = await fetch(`${API_BASE}/student/leaves?student_id=${studentId}`, {
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
    console.error('Error in getStudentLeavesAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while fetching leaves'
    };
  }
}

/**
 * Server Action: Apply for New Student Leave
 */
export async function applyStudentLeaveAction(formData) {
  try {
    const session = await getEncryptedCookie('student_session');
    const studentId = session?.user?.id;

    if (!studentId) {
      return { success: false, message: 'Student session not found. Please log in again.' };
    }

    const payload = {
      student_id: studentId,
      leave_type: formData.leave_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      emergency_contact: formData.emergency_contact
    };

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const res = await fetch(`${API_BASE}/student/leaves`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || 'Failed to submit leave application',
        data: null
      };
    }

    return {
      success: true,
      message: data.message || 'Leave application submitted successfully',
      data: data.data
    };
  } catch (error) {
    console.error('Error in applyStudentLeaveAction:', error);
    return {
      success: false,
      message: error.message || 'Network error while submitting leave'
    };
  }
}
