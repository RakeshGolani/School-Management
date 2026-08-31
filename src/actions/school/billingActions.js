'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

async function getSchoolIdFromSession() {
  try {
    const session = await getEncryptedCookie('school_session');
    return session?.user?.id || null;
  } catch (error) {
    console.warn('Could not read school_session cookie:', error.message);
    return null;
  }
}

export async function getSubscriptionDetailsAction() {
  try {
    const schoolId = await getSchoolIdFromSession();
    if (!schoolId) {
      return { success: false, message: 'Active school session not found' };
    }

    const res = await fetch(`${API_URL}/subscription?schoolId=${schoolId}`, {
      method: 'GET',
      headers: {
        'x-school-id': String(schoolId)
      },
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function checkoutSubscriptionAction(checkoutData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    if (!schoolId) {
      return { success: false, message: 'Active school session not found' };
    }

    const res = await fetch(`${API_URL}/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-school-id': String(schoolId)
      },
      body: JSON.stringify(checkoutData)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error initiating checkout:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function triggerMockPaymentAction(payload) {
  try {
    const schoolId = await getSchoolIdFromSession();

    const res = await fetch(`${API_URL}/subscription/webhook?schoolId=${schoolId || ''}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-school-id': String(schoolId || '')
      },
      body: JSON.stringify({
        status: 'success',
        ...payload
      })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

export async function downgradeSubscriptionAction(downgradeData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    if (!schoolId) {
      return { success: false, message: 'Active school session not found' };
    }

    const res = await fetch(`${API_URL}/subscription/downgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-school-id': String(schoolId)
      },
      body: JSON.stringify(downgradeData)
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error initiating downgrade:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}
