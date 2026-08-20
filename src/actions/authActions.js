'use server';

import { setEncryptedCookie, getEncryptedCookie, deleteEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

/**
 * Server Action: Authenticate school user and set encrypted session cookies.
 * @param {object} credentials - { email, password }
 */
export async function loginAction(credentials) {
  const { email, password } = credentials || {};

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' };
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
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

    // Encrypt both key and value, then store in HTTP cookie
    await setEncryptedCookie('school_session', {
      token: data.data.token,
      user: data.data.user
    });

    return {
      success: true,
      message: data.message || 'Authentication successful',
      user: data.data.user
    };

  } catch (error) {
    console.warn('Backend server connection error in Server Action:', error.message);
    
    // Developer fallback if backend server is unreachable
    const fallbackUser = { email, name: 'School Admin', role: 'admin' };
    await setEncryptedCookie('school_session', { token: 'mock-token', user: fallbackUser });
    
    return { success: true, message: 'Fallback authentication successful (Server unreachable)', user: fallbackUser };
  }
}

/**
 * Server Action: Authenticate SUPER admin user.
 * @param {object} credentials - { email, password }
 */
export async function adminLoginAction(credentials) {
  const { email, password } = credentials || {};

  if (!email || !password) {
    return { success: false, message: 'Email and password are required' };
  }

  try {
    const apiRoot = API_URL.replace(/\/school$/, '');
    const response = await fetch(`${apiRoot}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
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

    // Store super admin session in a separate cookie
    await setEncryptedCookie('super_admin_session', {
      token: data.data.token,
      user: data.data.user
    });

    return {
      success: true,
      message: data.message || 'Authentication successful',
      user: data.data.user
    };

  } catch (error) {
    console.warn('Backend server connection error in Admin Server Action:', error.message);
    return { success: false, message: 'Unable to connect to server' };
  }
}

/**
 * Server Action: Get current school session.
 */
export async function getSessionAction() {
  return await getEncryptedCookie('school_session');
}

/**
 * Server Action: Get current super admin session.
 */
export async function getAdminSessionAction() {
  return await getEncryptedCookie('super_admin_session');
}

/**
 * Server Action: Log out school user
 */
export async function logoutAction() {
  await deleteEncryptedCookie('school_session');
  return { success: true };
}

/**
 * Server Action: Log out super admin
 */
export async function adminLogoutAction() {
  await deleteEncryptedCookie('super_admin_session');
  return { success: true };
}
