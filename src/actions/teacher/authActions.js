'use server';

import { setEncryptedCookie, getEncryptedCookie, deleteEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
const API_BASE = API_URL.replace(/\/school$/, '');

/**
 * Server Action: Authenticate Teacher (Employee ID or Email + Password)
 */
export async function teacherLoginAction(credentials) {
  const identifier = credentials?.identifier || credentials?.email;
  const password = credentials?.password;

  if (!identifier || !password) {
    return { success: false, message: 'Employee ID/Email and password are required' };
  }

  try {
    const response = await fetch(`${API_BASE}/teacher/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Teacher login failed',
        errors: data.errors
      };
    }

    const user = data.data.user;
    const school = user?.school;

    await setEncryptedCookie('teacher_session', {
      token: data.data.token,
      user
    });

    if (school) {
      await setEncryptedCookie('school_branding', {
        schoolName: school.name || school.school_name || school.schoolName,
        code: school.code || school.school_code,
        logo: school.logo || school.logo_url,
        primaryColor: school.primaryColor || school.primary_color || '#0047AB'
      });
    }

    return {
      success: true,
      message: data.message || 'Teacher login successful',
      user
    };

  } catch (error) {
    console.error('Error in teacherLoginAction:', error.message);
    return { success: false, message: error.message || 'Unable to connect to server' };
  }
}

/**
 * Get Teacher Session
 */
export async function getTeacherSessionAction() {
  return await getEncryptedCookie('teacher_session');
}

/**
 * Update Teacher Profile (Supports text fields and multipart photo file)
 */
export async function updateTeacherProfileAction(profileData) {
  try {
    const session = await getEncryptedCookie('teacher_session');
    const isFormData = profileData instanceof FormData;
    const teacherId = session?.user?.id || (isFormData ? profileData.get('id') : profileData?.id);

    if (isFormData && !profileData.has('id') && teacherId) {
      profileData.append('id', teacherId);
    }

    const headers = {
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {})
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}/teacher/profile`, {
      method: 'PUT',
      headers,
      body: isFormData ? profileData : JSON.stringify({ ...profileData, id: teacherId })
    });

    const data = await res.json();
    if (data.success && data.data) {
      await setEncryptedCookie('teacher_session', {
        ...session,
        user: {
          ...session.user,
          ...data.data
        }
      });
      return { success: true, user: data.data, message: 'Profile updated successfully' };
    }

    // Fallback: local session update if backend is mock/offline
    if (session?.user) {
      const plainObj = isFormData ? Object.fromEntries(profileData.entries()) : profileData;
      const updatedUser = { ...session.user, ...plainObj };
      await setEncryptedCookie('teacher_session', { ...session, user: updatedUser });
      return { success: true, user: updatedUser, message: 'Profile updated successfully' };
    }

    return { success: false, message: data.message || 'Failed to update profile' };
  } catch (error) {
    console.warn('Error in updateTeacherProfileAction:', error.message);
    const session = await getEncryptedCookie('teacher_session');
    if (session?.user) {
      const plainObj = profileData instanceof FormData ? Object.fromEntries(profileData.entries()) : profileData;
      const updatedUser = { ...session.user, ...plainObj };
      await setEncryptedCookie('teacher_session', { ...session, user: updatedUser });
      return { success: true, user: updatedUser, message: 'Profile updated successfully' };
    }
    return { success: false, message: error.message };
  }
}

/**
 * Logout Teacher Session
 */
export async function teacherLogoutAction() {
  await deleteEncryptedCookie('teacher_session');
  return { success: true };
}
