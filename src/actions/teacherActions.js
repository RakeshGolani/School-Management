'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

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
 * Fetch list of teachers with filters
 * @param {object} params - { search, subject, status, schoolId, page, limit }
 */
export async function getTeachersAction(params = {}) {
  try {
    const schoolId = params.schoolId || await getSchoolIdFromSession();

    const query = new URLSearchParams();
    if (schoolId) query.append('schoolId', schoolId);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.subject && params.subject !== 'all') query.append('subject', params.subject);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.academic_year_id) query.append('academic_year_id', params.academic_year_id);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/teachers?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch teachers',
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
      };
    }

    return {
      success: true,
      data: data.data || [],
      meta: data.meta || { total: (data.data || []).length, page: 1, limit: 10, totalPages: 1 }
    };
  } catch (error) {
    console.warn('Error in getTeachersAction:', error.message);
    return {
      success: false,
      message: 'Server connection error: ' + error.message,
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  }
}

/**
 * Create new teacher profile
 * @param {FormData|object} teacherData
 */
export async function createTeacherAction(teacherData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    let body;
    let headers = {};

    if (teacherData instanceof FormData) {
      body = teacherData;
      if (schoolId && !body.has('school_id')) {
        body.append('school_id', schoolId);
      }
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ ...teacherData, school_id: schoolId });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/teachers`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to create teacher record',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Teacher record created successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in createTeacherAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Update existing teacher profile
 * @param {number|string} id
 * @param {FormData|object} teacherData
 */
export async function updateTeacherAction(id, teacherData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    let body;
    let headers = {};

    if (teacherData instanceof FormData) {
      body = teacherData;
      if (schoolId && !body.has('school_id')) {
        body.append('school_id', schoolId);
      }
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ ...teacherData, school_id: schoolId });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/teachers/${id}`, {
      method: 'PUT',
      headers,
      body,
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update teacher profile',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Teacher profile updated successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in updateTeacherAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Delete teacher record
 * @param {number|string} id
 */
export async function deleteTeacherAction(id) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = schoolId ? `?schoolId=${schoolId}` : '';

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/teachers/${id}${query}`, {
      method: 'DELETE',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to delete teacher record'
      };
    }

    return {
      success: true,
      message: data.message || 'Teacher record deleted successfully'
    };
  } catch (error) {
    console.warn('Error in deleteTeacherAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}
