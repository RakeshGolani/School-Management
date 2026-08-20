'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

/**
 * Get School Dashboard Overview Metrics
 */
export async function getSchoolDashboardAction(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.academic_year_id) query.append('academic_year_id', params.academic_year_id);
    if (params.schoolId) query.append('schoolId', params.schoolId);

    const queryString = query.toString();
    const url = `${API_URL}/dashboard${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching school dashboard stats:', error);
    return {
      success: false,
      message: 'Failed to connect to backend server',
      error: error.message
    };
  }
}
