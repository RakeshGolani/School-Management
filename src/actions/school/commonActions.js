'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';

export async function updateStatusAction(module, id, status) {
  try {
    const response = await fetch(`${API_URL}/common/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, id, status })
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Status update failed' };
  }
}

export async function deleteEntityAction(module, id) {
  try {
    const response = await fetch(`${API_URL}/common/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, id })
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Delete operation failed' };
  }
}
