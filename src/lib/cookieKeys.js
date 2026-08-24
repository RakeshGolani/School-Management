/**
 * Edge-compatible deterministic cookie key generator.
 * Works seamlessly in Edge Middleware, Server Components, and Client Components without Node.js crypto dependencies.
 */
const SECRET_SALT = process.env.SESSION_SECRET || 'school_mgmt_secret_key_32_bytes_long_12345';

export function encryptCookieKey(keyName = 'school_session') {
  let hash = 0x811c9dc5;
  const str = keyName + SECRET_SALT;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `enc_key_${hex}`;
}
