'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

async function fetchWithAuth(url, options = {}) {
  try {
    const session = await getEncryptedCookie('school_session');
    const token = session?.token || '';

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    return { success: false, message: 'Internal Server Error' };
  }
}

// ===================== BUS ROUTES =====================

export async function getRoutesAction() {
  return await fetchWithAuth(`${API_BASE_URL}/transport/routes`);
}

export async function createRouteAction(payload) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/routes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateRouteAction(id, payload) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/routes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteRouteAction(id) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/routes/${id}`, {
    method: 'DELETE'
  });
}

// ===================== BUS STOPS =====================

export async function getStopsAction() {
  return await fetchWithAuth(`${API_BASE_URL}/transport/stops`);
}

export async function createStopAction(payload) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/stops`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateStopAction(id, payload) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/stops/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteStopAction(id) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/stops/${id}`, {
    method: 'DELETE'
  });
}

// ===================== BUSES =====================

export async function getBusesAction() {
  return await fetchWithAuth(`${API_BASE_URL}/transport/buses`);
}

export async function createBusAction(payload) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/buses`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateBusAction(id, payload) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/buses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteBusAction(id) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/buses/${id}`, {
    method: 'DELETE'
  });
}

// ===================== STUDENT ASSIGNMENTS =====================

export async function getAssignedStudentsAction() {
  return await fetchWithAuth(`${API_BASE_URL}/transport/students`);
}

export async function updateStudentTransportAction(id, payload) {
  return await fetchWithAuth(`${API_BASE_URL}/transport/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

// ===================== LIVE TRACKING =====================

export async function getLiveLocationsAction() {
  return await fetchWithAuth(`${API_BASE_URL}/transport/buses/live`);
}
