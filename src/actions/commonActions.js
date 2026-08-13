'use server';

export async function updateStatusAction(module, id, status) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/common/status`, {
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/common/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, id })
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Delete operation failed' };
  }
}
