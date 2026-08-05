/**
 * Helper to dynamically inject primary brand theme colors into the document root.
 */
export function applyDynamicTheme(primaryColor) {
  if (typeof window === 'undefined' || !primaryColor) return;

  requestAnimationFrame(() => {
    const root = document.documentElement;

    try {
      localStorage.setItem('theme_primary', primaryColor);
    } catch (e) {}

    root.style.setProperty('--theme-primary-500', primaryColor);
    root.style.setProperty('--theme-primary-400', primaryColor);
    root.style.setProperty('--theme-primary-600', primaryColor);
    root.style.setProperty('--theme-primary-900', primaryColor);
    root.style.setProperty('--theme-primary-50', primaryColor + '1a');
  });
}

// Auto-restore saved primary theme from localStorage on client load
if (typeof window !== 'undefined') {
  try {
    const savedPrimary = localStorage.getItem('theme_primary');
    if (savedPrimary) {
      applyDynamicTheme(savedPrimary);
    }
  } catch (e) {}
}
