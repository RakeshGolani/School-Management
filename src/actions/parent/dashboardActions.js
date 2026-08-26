'use server';

import { getParentSessionAction } from './authActions';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

/**
 * Fetch Ward Comprehensive Dashboard Metrics, Live Gate, Smart Bus, and Alerts
 */
export async function getParentDashboardAction(params = {}) {
  try {
    const session = await getParentSessionAction();
    if (!session || !session.user) {
      return { success: false, message: 'Parent session not found. Please log in.' };
    }

    const { studentId } = params;
    const activeStudentId = studentId || session.user?.children?.[0]?.id;

    if (!activeStudentId) {
      return { success: false, message: 'Student ID is required.' };
    }

    const queryParams = new URLSearchParams({
      student_id: String(activeStudentId)
    });

    const res = await fetch(`${API_BASE_URL}/api/parent/dashboard?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    return { success: false, message: error.message || 'Failed to connect to dashboard service.' };
  }
}
