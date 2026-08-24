'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

/**
 * Fetch list of all classes for current school
 */
export async function getClassesAction(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const response = await fetch(`${API_URL}/classes?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getClassesAction:', error);
    return { success: false, message: 'Network error fetching classes' };
  }
}

/**
 * Create new class & section
 */
export async function createClassAction(classData) {
  try {
    const response = await fetch(`${API_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in createClassAction:', error);
    return { success: false, message: 'Network error creating class' };
  }
}

/**
 * Update class details / assigned teacher
 */
export async function updateClassAction(id, classData) {
  try {
    const response = await fetch(`${API_URL}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in updateClassAction:', error);
    return { success: false, message: 'Network error updating class' };
  }
}

/**
 * Get single class details with teacher & enrolled students
 */
export async function getClassDetailsAction(id) {
  try {
    const response = await fetch(`${API_URL}/classes/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getClassDetailsAction:', error);
    return { success: false, message: 'Network error fetching class details' };
  }
}

/**
 * Assign a student to class
 */
export async function assignStudentToClassAction(classId, studentId) {
  try {
    const response = await fetch(`${API_URL}/classes/${classId}/assign-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in assignStudentToClassAction:', error);
    return { success: false, message: 'Network error assigning student' };
  }
}

/**
 * Unassign student from class
 */
export async function unassignStudentFromClassAction(classId, studentId) {
  try {
    const response = await fetch(`${API_URL}/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in unassignStudentFromClassAction:', error);
    return { success: false, message: 'Network error unassigning student' };
  }
}

/**
 * Delete class record
 */
export async function deleteClassAction(id) {
  try {
    const response = await fetch(`${API_URL}/classes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in deleteClassAction:', error);
    return { success: false, message: 'Network error deleting class' };
  }
}
