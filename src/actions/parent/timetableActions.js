'use server';

import { getParentSessionAction } from './authActions';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

/**
 * Fetch Ward Weekly Timetable & Period Allocation
 */
export async function getParentTimetableAction(params = {}) {
  try {
    const session = await getParentSessionAction();
    if (!session || !session.user) {
      return { success: false, message: 'Parent session not found. Please log in.' };
    }

    const { studentId, academicYearId } = params;
    const activeStudentId = studentId || session.user?.children?.[0]?.id;

    if (!activeStudentId) {
      return { success: false, message: 'Student ID is required.' };
    }

    const queryParams = new URLSearchParams({
      student_id: String(activeStudentId),
      ...(academicYearId ? { academic_year_id: String(academicYearId) } : {})
    });

    const res = await fetch(`${API_BASE_URL}/api/parent/timetable?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching parent timetable:', error);
    return { success: false, message: error.message || 'Failed to connect to timetable service.' };
  }
}
