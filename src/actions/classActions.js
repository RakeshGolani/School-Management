'use me';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

/**
 * Fetch list of all classes for current school
 */
export async function getClassesAction(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const response = await fetch(`${BACKEND_URL}/school/classes?${query.toString()}`, {
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
    const response = await fetch(`${BACKEND_URL}/school/classes`, {
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
    const response = await fetch(`${BACKEND_URL}/school/classes/${id}`, {
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
 * Delete class record
 */
export async function deleteClassAction(id) {
  try {
    const response = await fetch(`${BACKEND_URL}/school/classes/${id}`, {
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
