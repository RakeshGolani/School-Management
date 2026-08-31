'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

async function getSchoolIdFromSession() {
  try {
    const session = await getEncryptedCookie('school_session');
    return session?.user?.id || null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch all academic years for current school
 */
export async function getAcademicYearsAction(params = {}) {
  try {
    const schoolId = params.schoolId || await getSchoolIdFromSession();
    const query = new URLSearchParams();
    if (schoolId) query.append('schoolId', schoolId);

    const response = await fetch(`${API_URL}/academic-years?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(schoolId ? { 'x-school-id': String(schoolId) } : {})
      },
      cache: 'no-store'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAcademicYearsAction:', error);
    return { success: false, message: 'Failed to fetch academic years', data: [] };
  }
}

/**
 * Fetch currently active academic year
 */
export async function getActiveAcademicYearAction() {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = new URLSearchParams();
    if (schoolId) query.append('schoolId', schoolId);

    const response = await fetch(`${API_URL}/academic-years/active?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(schoolId ? { 'x-school-id': String(schoolId) } : {})
      },
      cache: 'no-store'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getActiveAcademicYearAction:', error);
    return { success: false, message: 'Failed to fetch active academic year', data: null };
  }
}

/**
 * Create a new academic year
 */
export async function createAcademicYearAction(yearData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const response = await fetch(`${API_URL}/academic-years`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(schoolId ? { 'x-school-id': String(schoolId) } : {})
      },
      body: JSON.stringify({ ...yearData, school_id: schoolId, schoolId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in createAcademicYearAction:', error);
    return { success: false, message: 'Failed to create academic year' };
  }
}

/**
 * Update an existing academic year
 */
export async function updateAcademicYearAction(id, yearData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const response = await fetch(`${API_URL}/academic-years/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(schoolId ? { 'x-school-id': String(schoolId) } : {})
      },
      body: JSON.stringify({ ...yearData, school_id: schoolId, schoolId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in updateAcademicYearAction:', error);
    return { success: false, message: 'Failed to update academic year' };
  }
}

/**
 * Set an academic year as active
 */
export async function setActiveAcademicYearAction(id) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const response = await fetch(`${API_URL}/academic-years/${id}/active`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(schoolId ? { 'x-school-id': String(schoolId) } : {})
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in setActiveAcademicYearAction:', error);
    return { success: false, message: 'Failed to set active academic year' };
  }
}

/**
 * Delete an academic year
 */
export async function deleteAcademicYearAction(id) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const response = await fetch(`${API_URL}/academic-years/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(schoolId ? { 'x-school-id': String(schoolId) } : {})
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in deleteAcademicYearAction:', error);
    return { success: false, message: 'Failed to delete academic year' };
  }
}
