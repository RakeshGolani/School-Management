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

/**
 * Get Parent Session
 */
export async function getParentSessionAction() {
  return await getEncryptedCookie('parent_session');
}

/**
 * Logout Parent Session
 */
export async function parentLogoutAction() {
  await deleteEncryptedCookie('parent_session');
  return { success: true };
}
