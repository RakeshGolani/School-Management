'use server';

import { getEncryptedCookie } from '@/lib/cookieHelper';

/**
 * Helper to get current logged-in school ID from session cookie
 */
async function getSchoolIdFromSession() {
  try {
    const session = await getEncryptedCookie('school_session');
    return session?.user?.id || null;
  } catch (error) {
    console.warn('Could not read school_session cookie in feeActions:', error.message);
    return null;
  }
}

/**
 * Fetch all fee categories
 */
export async function getFeeCategoriesAction(params = {}) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = new URLSearchParams();
    if (schoolId) query.append('school_id', schoolId);
    if (params.academic_year_id) query.append('academic_year_id', params.academic_year_id);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/school/fees/categories?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch fee categories',
        data: []
      };
    }

    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.warn('Error in getFeeCategoriesAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message,
      data: []
    };
  }
}

/**
 * Create a new fee category
 * @param {object} categoryData - { name, amount, due_date, description }
 */
export async function createFeeCategoryAction(categoryData) {
  try {
    const schoolId = await getSchoolIdFromSession();
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/school/fees/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...categoryData, school_id: schoolId }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to create fee category',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Fee category created successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in createFeeCategoryAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Update an existing fee category
 * @param {number|string} id
 * @param {object} categoryData - { name, amount, due_date, description }
 */
export async function updateFeeCategoryAction(id, categoryData) {
  try {
    const schoolId = await getSchoolIdFromSession();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/school/fees/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...categoryData, school_id: schoolId }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update fee category',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Fee category updated successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in updateFeeCategoryAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Delete a fee category
 * @param {number|string} id
 */
export async function deleteFeeCategoryAction(id) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/school/fees/categories/${id}`, {
      method: 'DELETE',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to delete fee category'
      };
    }

    return {
      success: true,
      message: data.message || 'Fee category deleted successfully'
    };
  } catch (error) {
    console.warn('Error in deleteFeeCategoryAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Fetch all student fee allocations
 * @param {object} params - { class_id, status, search, page, limit }
 */
export async function getFeeAllocationsAction(params = {}) {
  try {
    const schoolId = await getSchoolIdFromSession();

    const query = new URLSearchParams();
    if (schoolId) query.append('school_id', schoolId);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.class_id && params.class_id !== 'all') query.append('class_id', params.class_id);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.academic_year_id) query.append('academic_year_id', params.academic_year_id);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/school/fees/allocations?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch fee allocations',
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
      };
    }

    return {
      success: true,
      data: data.data?.data || [],
      meta: data.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  } catch (error) {
    console.warn('Error in getFeeAllocationsAction:', error.message);
    return {
      success: false,
      message: 'Server connection error: ' + error.message,
      data: []
    };
  }
}

/**
 * Allocate a fee category to class or specific students
 * @param {object} allocationData - { fee_category_id, class_id, student_ids, amount, due_date }
 */
export async function allocateFeeAction(allocationData) {
  try {
    const schoolId = await getSchoolIdFromSession();

    const response = await fetch('http://localhost:5000/api/school/fees/allocations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...allocationData, school_id: schoolId }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to allocate fees',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Fees allocated successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in allocateFeeAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Void/Delete a fee allocation
 * @param {number|string} id
 */
export async function deleteFeeAllocationAction(id) {
  try {
    const response = await fetch(`http://localhost:5000/api/school/fees/allocations/${id}`, {
      method: 'DELETE',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to void fee allocation'
      };
    }

    return {
      success: true,
      message: data.message || 'Fee allocation voided successfully'
    };
  } catch (error) {
    console.warn('Error in deleteFeeAllocationAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Record a payment towards a student fee
 * @param {object} paymentData - { student_fee_id, amount_paid, payment_date, payment_mode, reference_number, remarks }
 */
export async function recordPaymentAction(paymentData) {
  try {
    const schoolId = await getSchoolIdFromSession();

    const response = await fetch('http://localhost:5000/api/school/fees/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...paymentData, school_id: schoolId }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to record payment',
        errors: data.errors
      };
    }

    return {
      success: true,
      message: data.message || 'Payment recorded successfully',
      data: data.data
    };
  } catch (error) {
    console.warn('Error in recordPaymentAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Fetch all payments ledger history
 * @param {object} params - { payment_mode, search, page, limit }
 */
export async function getPaymentTransactionsAction(params = {}) {
  try {
    const schoolId = await getSchoolIdFromSession();

    const query = new URLSearchParams();
    if (schoolId) query.append('school_id', schoolId);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.payment_mode && params.payment_mode !== 'all') query.append('payment_mode', params.payment_mode);
    if (params.academic_year_id) query.append('academic_year_id', params.academic_year_id);

    const response = await fetch(`http://localhost:5000/api/school/fees/payments?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch payments ledger',
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
      };
    }

    return {
      success: true,
      data: data.data?.data || [],
      meta: data.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  } catch (error) {
    console.warn('Error in getPaymentTransactionsAction:', error.message);
    return {
      success: false,
      message: 'Server connection error: ' + error.message,
      data: []
    };
  }
}

/**
 * Fetch fee metrics & statistics
 */
export async function getFeeStatsAction(params = {}) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = new URLSearchParams();
    if (schoolId) query.append('school_id', schoolId);
    if (params.academic_year_id) query.append('academic_year_id', params.academic_year_id);

    const response = await fetch(`http://localhost:5000/api/school/fees/stats?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch fee stats'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.warn('Error in getFeeStatsAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}

/**
 * Fetch a single fee payment transaction for printing receipt
 * @param {string|number} id
 */
export async function getFeeReceiptAction(id) {
  try {
    const schoolId = await getSchoolIdFromSession();
    const query = schoolId ? `?school_id=${schoolId}` : '';

    const response = await fetch(`http://localhost:5000/api/school/fees/payments/${id}${query}`, {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch payment receipt details'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.warn('Error in getFeeReceiptAction:', error.message);
    return {
      success: false,
      message: 'Server error: ' + error.message
    };
  }
}
