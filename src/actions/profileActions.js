'use server';

import { setEncryptedCookie, getEncryptedCookie } from '@/lib/cookieHelper';

/**
 * Server Action: Update School Profile & Logo
 * @param {object} profileData - { school_name, email, phone, address, logo, schoolId }
 */
export async function updateProfileAction(profileData) {
  try {
    let body;
    let headers = {};

    if (profileData instanceof FormData) {
      body = profileData;
      // Do NOT set Content-Type header when sending FormData; browser fetch sets multipart boundary automatically
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(profileData);
    }

    const response = await fetch('http://localhost:5000/api/school/profile/update', {
      method: 'POST',
      headers,
      body,
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update profile',
        errors: data.errors
      };
    }

    // Read current encrypted session & update payload
    const currentSession = await getEncryptedCookie('school_session');
    
    let logoUrl = data.data.logo;
    if (logoUrl && logoUrl.startsWith('/uploads/')) {
      logoUrl = `http://localhost:5000${logoUrl}`;
    }

    const updatedUser = {
      ...currentSession?.user,
      schoolName: data.data.schoolName,
      email: data.data.email,
      phone: data.data.phone,
      address: data.data.address,
      logo: logoUrl
    };

    await setEncryptedCookie('school_session', {
      token: currentSession?.token || 'active_token',
      user: updatedUser
    });

    return {
      success: true,
      message: data.message || 'School profile updated successfully',
      user: updatedUser
    };
  } catch (error) {
    console.warn('Backend server connection error in updateProfileAction:', error.message);
    
    // Offline / Developer fallback
    const currentSession = await getEncryptedCookie('school_session');
    const updatedUser = {
      ...currentSession?.user,
      schoolName: profileData.school_name || currentSession?.user?.schoolName,
      email: profileData.email || currentSession?.user?.email,
      phone: profileData.phone || currentSession?.user?.phone,
      address: profileData.address || currentSession?.user?.address,
      logo: profileData.logo || currentSession?.user?.logo
    };

    await setEncryptedCookie('school_session', {
      token: currentSession?.token || 'active_token',
      user: updatedUser
    });

    return {
      success: true,
      message: '[OFFLINE DEMO] Profile updated locally & session encrypted.',
      user: updatedUser
    };
  }
}

/**
 * Server Action: Change School Password
 * @param {object} passwordData - { current_password, new_password, confirm_password }
 */
export async function changePasswordAction(passwordData) {
  try {
    const session = await getEncryptedCookie('school_session');
    const schoolId = session?.user?.id || 1;

    const response = await fetch('http://localhost:5000/api/school/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...passwordData, schoolId }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to change password',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Password updated successfully!'
    };
  } catch (error) {
    console.warn('Error in changePasswordAction:', error.message);
    return {
      success: false,
      message: 'Server error while changing password: ' + error.message
    };
  }
}
