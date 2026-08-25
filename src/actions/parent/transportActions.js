'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Get Live Bus Tracking Telemetry for Parent's Ward
 */
export async function getParentBusTrackingAction(studentId) {
  try {
    const url = studentId 
      ? `${API_BASE}/parent/bus-tracking?student_id=${studentId}`
      : `${API_BASE}/parent/bus-tracking`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch bus tracking details'
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('Error in getParentBusTrackingAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}
