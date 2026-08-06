'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

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

    const res = await fetch(`http://127.0.0.1:5000/api/school/subscription?schoolId=${schoolId}`, {
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

    const res = await fetch(`http://127.0.0.1:5000/api/school/subscription/checkout`, {
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
    const res = await fetch(`http://127.0.0.1:5000/api/school/subscription/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        status: 'success'
      })
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}
