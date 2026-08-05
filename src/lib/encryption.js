import crypto from 'crypto';

// Secret key for AES encryption (32 bytes)
const SECRET_KEY = process.env.SESSION_SECRET || 'school_mgmt_secret_key_32_bytes_long_12345';
const ALGORITHM = 'aes-256-cbc';

// Derive key buffer (32 bytes)
const KEY_BUFFER = crypto.createHash('sha256').update(SECRET_KEY).digest();

/**
 * Encrypts a Cookie Key (Name) into an encrypted/hashed string suitable for HTTP cookie headers.
 * @param {string} keyName - Plain cookie name (e.g. 'school_session')
 * @returns {string} Encrypted cookie name (e.g. 'enc_key_a8f3b12c90e54d1a')
 */
export function encryptCookieKey(keyName = 'school_session') {
  const hash = crypto.createHash('sha256')
    .update(keyName + SECRET_KEY)
    .digest('hex')
    .substring(0, 16);
  return `enc_key_${hash}`;
}

/**
 * Encrypts any data payload/token into an AES-256-CBC ciphertext string.
 * @param {any} data - Plain string or object to encrypt
 * @returns {string} Ciphertext formatted as 'IV_HEX:ENCRYPTED_HEX'
 */
export function encryptCookieValue(data) {
  if (!data) return '';
  const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-CBC ciphertext string back to plain string or object.
 * @param {string} cipherText - Formatted as 'IV_HEX:ENCRYPTED_HEX'
 * @returns {any} Decrypted object or string, or null if decryption fails
 */
export function decryptCookieValue(cipherText) {
  if (!cipherText || !cipherText.includes(':')) return null;

  try {
    const [ivHex, encryptedHex] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('Failed to decrypt cookie value:', error.message);
    return null;
  }
}
