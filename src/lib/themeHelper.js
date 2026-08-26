const DEFAULT_PRIMARY = '#0047AB';

/**
 * Returns an object of CSS variables computed from the given primary color.
 * Can be used server-side in layout.js style prop or client-side.
 */
export function getThemeCssVars(primaryColor = DEFAULT_PRIMARY) {
  const safeColor = (primaryColor && typeof primaryColor === 'string' && primaryColor.startsWith('#'))
    ? primaryColor
    : DEFAULT_PRIMARY;

  return {
    '--theme-primary-500': safeColor,
    '--theme-primary-400': lightenHex(safeColor, 15),
    '--theme-primary-300': lightenHex(safeColor, 30),
    '--theme-primary-600': darkenHex(safeColor, 10),
    '--theme-primary-700': darkenHex(safeColor, 20),
    '--theme-primary-800': darkenHex(safeColor, 30),
    '--theme-primary-900': darkenHex(safeColor, 40),
    '--theme-primary-50': hexToRgba(safeColor, 0.08),
    '--theme-primary-100': hexToRgba(safeColor, 0.15),
    '--theme-primary-200': hexToRgba(safeColor, 0.25),
    '--theme-secondary-500': '#FF8C00',
    '--theme-accent-500': '#32CD32',
  };
}

/**
 * Helper to dynamically inject primary brand theme colors into the document root.
 * Also persists the color in both localStorage AND a cookie so the server can
 * read it on next request and inject it before any JS runs (zero FOUC).
 */
export function applyDynamicTheme(primaryColor) {
  if (typeof window === 'undefined') return;
  const safeColor = primaryColor || DEFAULT_PRIMARY;
  const root = document.documentElement;

  // Persist in localStorage (client-side fast cache)
  try {
    localStorage.setItem('theme_primary', safeColor);
  } catch (e) {}

  const vars = getThemeCssVars(safeColor);
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

// ─── Color Utilities ──────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const defaultHex = DEFAULT_PRIMARY;
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
