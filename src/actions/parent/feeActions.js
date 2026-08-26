'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Get Ward Fee Allocations, Invoices & Summary for Parent Portal
 */
export async function getParentFeesAction({ studentId, academicYearId } = {}) {
  try {
    const params = new URLSearchParams();
    if (studentId) params.append('student_id', studentId);
    if (academicYearId) params.append('academic_year_id', academicYearId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${API_BASE}/parent/fees${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch ward fees'
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Error in getParentFeesAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}
