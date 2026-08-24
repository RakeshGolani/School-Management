/**
 * Helper to dynamically inject primary brand theme colors into the document root.
 * Also persists the color in both localStorage AND a cookie so the server can
 * read it on next request and inject it before any JS runs (zero FOUC).
 */
export function applyDynamicTheme(primaryColor) {
  if (typeof window === 'undefined' || !primaryColor) return;

  const root = document.documentElement;

  // Persist in localStorage (client-side fallback)
  try {
    localStorage.setItem('theme_primary', primaryColor);
  } catch (e) {}

  // Persist in cookie so server layout can inject it synchronously (eliminates flash)
  try {
    document.cookie = `theme_primary_color=${encodeURIComponent(primaryColor)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {}

  // Apply immediately — NO requestAnimationFrame delay
  root.style.setProperty('--theme-primary-500', primaryColor);
  root.style.setProperty('--theme-primary-400', lightenHex(primaryColor, 15));
  root.style.setProperty('--theme-primary-300', lightenHex(primaryColor, 30));
  root.style.setProperty('--theme-primary-600', darkenHex(primaryColor, 10));
  root.style.setProperty('--theme-primary-700', darkenHex(primaryColor, 20));
  root.style.setProperty('--theme-primary-800', darkenHex(primaryColor, 30));
  root.style.setProperty('--theme-primary-900', darkenHex(primaryColor, 40));
  root.style.setProperty('--theme-primary-50',  hexToRgba(primaryColor, 0.08));
  root.style.setProperty('--theme-primary-100', hexToRgba(primaryColor, 0.15));
  root.style.setProperty('--theme-primary-200', hexToRgba(primaryColor, 0.25));
}

// ─── Color Utilities ──────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const defaultHex = '#4f46e5';
  const cleanHex = (hex && typeof hex === 'string' && hex.startsWith('#')) ? hex : defaultHex;
  const clean = cleanHex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }

function lightenHex(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const amt = (pct / 100) * 255;
  return rgbToHex(clamp(r + amt), clamp(g + amt), clamp(b + amt));
}

function darkenHex(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const amt = (pct / 100) * 255;
  return rgbToHex(clamp(r - amt), clamp(g - amt), clamp(b - amt));
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}
