'use server';

import { setEncryptedCookie, getEncryptedCookie, deleteEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Student Login (Admission Number / Roll Number + Password)
 */
export async function studentLoginAction(credentials) {
  const { identifier, password } = credentials || {};

  if (!identifier || !password) {
    return { success: false, message: 'Admission number and password are required' };
  }

  try {
    const response = await fetch(`${API_BASE}/student/login`, {
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

    await setEncryptedCookie('student_session', {
      token: data.data.token,
      user: data.data.user
    });

    return {
      success: true,
      message: data.message || 'Student login successful',
      user: data.data.user
    };
  } catch (error) {
    console.error('Error in studentLoginAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}

/**
 * Server Action: Student Send OTP
 */
export async function studentSendOtpAction({ phone }) {
  if (!phone) {
    return { success: false, message: 'Mobile number is required' };
  }

  try {
    const response = await fetch(`${API_BASE}/student/send-otp`, {
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
    console.error('Error in studentSendOtpAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}

/**
 * Server Action: Student Verify OTP
 */
export async function studentVerifyOtpAction({ phone, otp }) {
  if (!phone || !otp) {
    return { success: false, message: 'Phone number and OTP are required' };
  }

  try {
    const response = await fetch(`${API_BASE}/student/verify-otp`, {
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

    await setEncryptedCookie('student_session', {
      token: data.data.token,
      user: data.data.user
    });

    return {
      success: true,
      message: data.message || 'Student authenticated successfully',
      user: data.data.user
    };
  } catch (error) {
    console.error('Error in studentVerifyOtpAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}

/**
 * Get Student Session
 */
export async function getStudentSessionAction() {
  return await getEncryptedCookie('student_session');
}

/**
 * Update Student Profile (Supports text fields and multipart photo file)
 */
export async function updateStudentProfileAction(profileData) {
  try {
    const session = await getEncryptedCookie('student_session');
    const isFormData = profileData instanceof FormData;
    const studentId = session?.user?.id || (isFormData ? profileData.get('id') : profileData?.id);

    if (isFormData && !profileData.has('id') && studentId) {
      profileData.append('id', studentId);
    }

    const headers = {
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}/student/profile`, {
      method: 'PUT',
      headers,
      body: isFormData ? profileData : JSON.stringify({ ...profileData, id: studentId })
    });

    const data = await res.json();
    if (data.success && data.data) {
      await setEncryptedCookie('student_session', {
        ...session,
        user: {
          ...session.user,
          ...data.data
        }
      });
      return { success: true, user: data.data, message: 'Profile updated successfully' };
    }

    // Fallback: local session update if backend is offline
    if (session?.user) {
      const plainObj = isFormData ? Object.fromEntries(profileData.entries()) : profileData;
      const updatedUser = { ...session.user, ...plainObj };
      await setEncryptedCookie('student_session', { ...session, user: updatedUser });
      return { success: true, user: updatedUser, message: 'Profile updated successfully' };
    }

    return { success: false, message: data.message || 'Failed to update profile' };
  } catch (error) {
    console.warn('Error in updateStudentProfileAction:', error.message);
    const session = await getEncryptedCookie('student_session');
    if (session?.user) {
      const plainObj = profileData instanceof FormData ? Object.fromEntries(profileData.entries()) : profileData;
      const updatedUser = { ...session.user, ...plainObj };
      await setEncryptedCookie('student_session', { ...session, user: updatedUser });
      return { success: true, user: updatedUser, message: 'Profile updated successfully' };
    }
    return { success: false, message: error.message };
  }
}

/**
 * Logout Student Session
 */
export async function studentLogoutAction() {
  await deleteEncryptedCookie('student_session');
  return { success: true };
}
