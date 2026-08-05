import { cookies } from 'next/headers';
import { encryptCookieKey, encryptCookieValue, decryptCookieValue } from './encryption';

/**
 * Sets an encrypted key and value cookie in Next.js Server Actions / Server Components.
 * @param {string} keyName - Plain cookie name
 * @param {any} data - Plain data payload
 * @param {object} options - Custom cookie options
 */
export async function setEncryptedCookie(keyName, data, options = {}) {
  const encKey = encryptCookieKey(keyName);
  const encValue = encryptCookieValue(data);
  const cookieStore = await cookies();

  cookieStore.set(encKey, encValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days default
    ...options
  });

  return { key: encKey, value: encValue };
}

/**
 * Retrieves and decrypts a cookie by its plain key name.
 * @param {string} keyName - Plain cookie name
 * @returns {Promise<any>} Decrypted data payload or null
 */
export async function getEncryptedCookie(keyName) {
  const encKey = encryptCookieKey(keyName);
  const cookieStore = await cookies();
  const item = cookieStore.get(encKey);

  if (!item || !item.value) {
    return null;
  }

  return decryptCookieValue(item.value);
}

/**
 * Deletes an encrypted cookie by its plain key name.
 * @param {string} keyName - Plain cookie name
 */
export async function deleteEncryptedCookie(keyName) {
  const encKey = encryptCookieKey(keyName);
  const cookieStore = await cookies();
  cookieStore.delete(encKey);
}
