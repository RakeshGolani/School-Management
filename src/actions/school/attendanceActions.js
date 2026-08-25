'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

async function getSchoolSession() {
  try {
    return await getEncryptedCookie('school_session');
  } catch (error) {
    console.warn('Could not read school_session cookie:', error.message);
    return null;
  }
}

/**
 * Fetch attendance logs by date, entity type, class, section
 */
export async function getAttendanceAction({ date, entity_type = 'STUDENT', class_id = '', class_name = '', section = '', academic_year_id = '' } = {}) {
  try {
    const session = await getSchoolSession();
    const schoolId = session?.user?.id;

    const query = new URLSearchParams();
    if (schoolId) query.append('school_id', schoolId);
    if (date) query.append('date', date);
    if (entity_type) query.append('entity_type', entity_type);
    if (class_id && class_id !== 'all') query.append('class_id', class_id);
    if (class_name && class_name !== 'all') query.append('class_name', class_name);
    if (section && section !== 'all') query.append('section', section);
    if (academic_year_id) query.append('academic_year_id', academic_year_id);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const response = await fetch(`${API_URL}/attendance?${query.toString()}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAttendanceAction:', error);
    return { success: false, message: 'Network error fetching attendance' };
  }
}

/**
 * Save / Update bulk attendance logs
 */
export async function saveBulkAttendanceAction({ date, entity_type = 'STUDENT', class_id = null, class_name = '', section = '', academic_year_id = null, records = [] }) {
  try {
    const session = await getSchoolSession();
    const schoolId = session?.user?.id;

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const response = await fetch(`${API_URL}/attendance/bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        school_id: schoolId,
        date,
        entity_type,
        class_id,
        class_name,
        section,
        academic_year_id,
        records
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in saveBulkAttendanceAction:', error);
    return { success: false, message: 'Network error saving attendance' };
  }
}

/**
 * Fetch Attendance summary stats
 */
export async function getAttendanceSummaryAction(date = '', academic_year_id = null) {
  try {
    const session = await getSchoolSession();
    const schoolId = session?.user?.id;

    const query = new URLSearchParams();
    if (schoolId) query.append('school_id', schoolId);
    if (date) query.append('date', date);
    if (academic_year_id) query.append('academic_year_id', academic_year_id);

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/attendance/summary${queryString}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAttendanceSummaryAction:', error);
    return { success: false, message: 'Network error fetching summary' };
  }
}
