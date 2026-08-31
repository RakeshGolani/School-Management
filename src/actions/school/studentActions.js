'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

/**
 * Helper to get current logged-in school ID from session cookie
 */
async function getSchoolIdFromSession() {
  try {
    const session = await getEncryptedCookie('school_session');
    return session?.user?.id || null;
  } catch (error) {
    console.warn('Could not read school_session cookie:', error.message);
    return null;
  }
}

/**
 * Fetch list of students with filters
 * @param {object} params - { search, grade, is_bus, status, schoolId }
 */
export async function getStudentsAction(params = {}) {
  try {
    const schoolId = params.schoolId || await getSchoolIdFromSession();

    const query = new URLSearchParams();
    if (schoolId) query.append('schoolId', schoolId);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.grade && params.grade !== 'all') query.append('grade', params.grade);
    if (params.is_bus && params.is_bus !== 'all') query.append('is_bus', params.is_bus);
    if (params.status) query.append('status', params.status);
    if (params.academic_year_id) query.append('academic_year_id', params.academic_year_id);

    const response = await fetch(`${API_URL}/students?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch students',
        data: [],
        meta: { total: 0, page: 1, limit: 5, totalPages: 1 }
      };
    }

    return {
      success: true,
      data: data.data || [],
      meta: data.meta || { total: (data.data || []).length, page: 1, limit: 5, totalPages: 1 }
    };
  } catch (error) {
    console.warn('Error in getStudentsAction:', error.message);
    return {
      success: false,
      message: 'Server connection error: ' + error.message,
      data: []
    };
  }
}

/**
 * Create new student admission
 * @param {FormData|object} studentData
 */
export async function createStudentAction(studentData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    let body;
    let headers = {};

    if (studentData instanceof FormData) {
      body = studentData;
      if (schoolId && !body.has('school_id')) {
        body.append('school_id', schoolId);
      }
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ ...studentData, school_id: schoolId });
    }

    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to create student admission',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Student admission created successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in createStudentAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Update existing student profile
 * @param {number|string} id
 * @param {FormData|object} studentData
 */
export async function updateStudentAction(id, studentData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    let body;
    let headers = {};

    if (studentData instanceof FormData) {
      body = studentData;
      if (schoolId && !body.has('school_id')) {
        body.append('school_id', schoolId);
      }
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ ...studentData, school_id: schoolId });
    }

    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'PUT',
      headers,
      body,
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update student profile',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Student profile updated successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in updateStudentAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Delete student record
 * @param {number|string} id
 */
export async function deleteStudentAction(id) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = schoolId ? `?schoolId=${schoolId}` : '';

    const response = await fetch(`${API_URL}/students/${id}${query}`, {
      method: 'DELETE',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to delete student record'
      };
    }

    return {
      success: true,
      message: data.message || 'Student record deleted successfully'
    };
  } catch (error) {
    console.warn('Error in deleteStudentAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Get students enrolled in a specific academic session.
 * @param {number|string} academic_year_id
 */
export async function getStudentSessionsAction(academic_year_id) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = new URLSearchParams();
    if (schoolId) query.append('school_id', schoolId);
    if (academic_year_id) query.append('academic_year_id', academic_year_id);

    const response = await fetch(`${API_URL}/student-sessions?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Failed to fetch session students', data: [] };
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.warn('Error in getStudentSessionsAction:', error.message);
    return { success: false, message: 'Server error: ' + error.message, data: [] };
  }
}

/**
 * Promote students from one academic year to the next.
 * @param {object} payload - { from_academic_year_id, to_academic_year_id, students[] }
 */
export async function promoteStudentsAction(payload) {
  try {
    const schoolId = await getSchoolIdFromSession();

    const response = await fetch(`${API_URL}/student-sessions/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, school_id: schoolId }),
      cache: 'no-store'
    });

    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Promotion failed' };
    return { success: true, message: data.message, data: data.data };
  } catch (error) {
    console.warn('Error in promoteStudentsAction:', error.message);
    return { success: false, message: 'Server error: ' + error.message };
  }
}

/**
 * Fetch a single student profile by ID / UUID
 */
export async function getStudentByIdAction(id) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = schoolId ? `?schoolId=${schoolId}` : '';

    const response = await fetch(`${API_URL}/students/${id}${query}`, {
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
    console.warn('Error in getStudentByIdAction:', error.message);
    return {
      success: false,
      message: 'Failed to fetch student details'
    };
  }
}

