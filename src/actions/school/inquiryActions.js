'use server';

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

/**
 * Server Action: Submit Demonstration Request / Inquiry from Public Landing Page
 */
export async function submitInquiryAction(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/common/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Failed to submit demonstration inquiry'
      };
    }

    return {
      success: true,
      message: data.message || 'Demonstration request submitted successfully!',
      data: data.data
    };
  } catch (error) {
    console.error('submitInquiryAction Error:', error);
    return {
      success: false,
      message: 'Unable to connect to server. Please check your connection.'
    };
  }
}
