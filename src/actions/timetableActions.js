'use me';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export async function getPeriodSlotsAction(academicYearId) {
  try {
    const url = academicYearId 
      ? `${BACKEND_URL}/school/period-slots?academic_year_id=${academicYearId}`
      : `${BACKEND_URL}/school/period-slots`;

    const res = await fetch(url, { cache: 'no-store' });
    return await res.json();
  } catch (err) {
    console.error('Error fetching period slots:', err);
    return { success: false, message: 'Network error fetching period slots' };
  }
}

export async function savePeriodSlotAction(slotData) {
  try {
    const res = await fetch(`${BACKEND_URL}/school/period-slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotData)
    });
    return await res.json();
  } catch (err) {
    console.error('Error saving period slot:', err);
    return { success: false, message: 'Network error saving period slot' };
  }
}

export async function deletePeriodSlotAction(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/school/period-slots/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error('Error deleting period slot:', err);
    return { success: false, message: 'Network error deleting period slot' };
  }
}

export async function allocateSlotAction(allocationData) {
  try {
    const res = await fetch(`${BACKEND_URL}/school/timetable/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allocationData)
    });
    return await res.json();
  } catch (err) {
    console.error('Error allocating slot:', err);
    return { success: false, message: 'Network error allocating slot' };
  }
}

export async function deleteAllocationAction(id) {
  try {
    const res = await fetch(`${BACKEND_URL}/school/timetable/allocate/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error('Error deleting allocation:', err);
    return { success: false, message: 'Network error deleting allocation' };
  }
}

export async function getClassTimetableAction(classId, academicYearId) {
  try {
    const url = academicYearId
      ? `${BACKEND_URL}/school/timetable/class/${classId}?academic_year_id=${academicYearId}`
      : `${BACKEND_URL}/school/timetable/class/${classId}`;

    const res = await fetch(url, { cache: 'no-store' });
    return await res.json();
  } catch (err) {
    console.error('Error fetching class timetable:', err);
    return { success: false, message: 'Network error fetching class timetable' };
  }
}

export async function getTeacherTimetableAction(teacherId, academicYearId) {
  try {
    const url = academicYearId
      ? `${BACKEND_URL}/school/timetable/teacher/${teacherId}?academic_year_id=${academicYearId}`
      : `${BACKEND_URL}/school/timetable/teacher/${teacherId}`;

    const res = await fetch(url, { cache: 'no-store' });
    return await res.json();
  } catch (err) {
    console.error('Error fetching teacher timetable:', err);
    return { success: false, message: 'Network error fetching teacher timetable' };
  }
}

export async function assignProxyAction(proxyData) {
  try {
    const res = await fetch(`${BACKEND_URL}/school/timetable/proxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proxyData)
    });
    return await res.json();
  } catch (err) {
    console.error('Error assigning proxy:', err);
    return { success: false, message: 'Network error assigning proxy' };
  }
}
