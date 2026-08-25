'use server';

import { setEncryptedCookie, getEncryptedCookie, deleteEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Parent Send OTP (Mobile Number)
 */
export async function parentSendOtpAction({ phone }) {
  if (!phone) {
    return { success: false, message: 'Mobile number is required' };
  }

  try {
    const response = await fetch(`${API_BASE}/parent/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to send OTP'
      };
    }

    return {
      success: true,
      message: data.message || 'OTP sent successfully',
      dev_otp: data.data?.dev_otp
    };
  } catch (error) {
    console.error('Error in parentSendOtpAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}

/**
 * Server Action: Parent Verify OTP & Login
 */
export async function parentVerifyOtpAction({ phone, otp }) {
  if (!phone || !otp) {
    return { success: false, message: 'Phone number and OTP are required' };
  }

  try {
    const response = await fetch(`${API_BASE}/parent/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Invalid or expired OTP'
      };
    }

    await setEncryptedCookie('parent_session', {
      token: data.data.token,
      user: data.data.user
    });

    return {
      success: true,
      message: data.message || 'Parent authenticated successfully',
      user: data.data.user
    };
  } catch (error) {
    console.error('Error in parentVerifyOtpAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}

/**
 * Server Action: Parent Password Login
 */
export async function parentLoginAction(credentials) {
  const { identifier, password } = credentials || {};

  if (!identifier || !password) {
    return { success: false, message: 'Email/Phone and password are required' };
  }

  try {
    const response = await fetch(`${API_BASE}/parent/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Authentication failed',
        errors: data.errors
      };
    }

    await setEncryptedCookie('parent_session', {
      token: data.data.token,
      user: data.data.user
    });

    return {
      success: true,
      message: data.message || 'Parent login successful',
      user: data.data.user
    };
  } catch (error) {
    console.error('Error in parentLoginAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}

import { cookies } from 'next/headers';

/**
 * Get Parent Session
 */
export async function getParentSessionAction() {
  return await getEncryptedCookie('parent_session');
}

/**
 * Get Active Ward for Parent (reads active child from cookies with zero-flicker SSR)
 */
export async function getParentActiveChildAction(sessionUser) {
  try {
    const user = sessionUser || (await getEncryptedCookie('parent_session'))?.user;
    if (!user) return { activeChild: null, childIndex: 0 };

    const childrenList = user.children || [];
    if (childrenList.length === 0) {
      return { activeChild: user.child || null, childIndex: 0 };
    }

    const cookieStore = await cookies();
    const savedChildId = cookieStore.get('parent_active_child_id')?.value;
    const savedChildIdx = cookieStore.get('parent_active_child_idx')?.value;

    if (savedChildId) {
      const idx = childrenList.findIndex(c => String(c.id) === String(savedChildId));
      if (idx >= 0) {
        return { activeChild: childrenList[idx], childIndex: idx };
      }
    }

    if (savedChildIdx !== undefined && savedChildIdx !== null) {
      const parsed = parseInt(savedChildIdx, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < childrenList.length) {
        return { activeChild: childrenList[parsed], childIndex: parsed };
      }
    }

    return { activeChild: childrenList[0], childIndex: 0 };
  } catch (e) {
    return { activeChild: null, childIndex: 0 };
  }
}

/**
 * Logout Parent Session
 */
export async function parentLogoutAction() {
  await deleteEncryptedCookie('parent_session');
  return { success: true };
}
