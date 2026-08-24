'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

/**
 * Fetch attendance logs by date, entity type, class, section
 */
export async function getAttendanceAction({ date, entity_type = 'STUDENT', class_name = '', section = '' } = {}) {
  try {
    const query = new URLSearchParams();
    if (date) query.append('date', date);
    if (entity_type) query.append('entity_type', entity_type);
    if (class_name && class_name !== 'all') query.append('class_name', class_name);
    if (section && section !== 'all') query.append('section', section);

    const response = await fetch(`${API_URL}/attendance?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
export async function saveBulkAttendanceAction({ date, entity_type = 'STUDENT', class_name = '', section = '', academic_year_id = null, records = [] }) {
  try {
    const response = await fetch(`${API_URL}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        entity_type,
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
    const query = new URLSearchParams();
    if (date) query.append('date', date);
    if (academic_year_id) query.append('academic_year_id', academic_year_id);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/attendance/summary${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAttendanceSummaryAction:', error);
    return { success: false, message: 'Network error fetching summary' };
  }
}
