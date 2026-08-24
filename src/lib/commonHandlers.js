import Notiflix from 'notiflix';
import { updateStatusAction, deleteEntityAction } from '@/actions/school/commonActions';
import { notifySuccess, notifyError } from '@/lib/notify';

// Initialize Notiflix with a premium dark theme globally (Client-side only)
if (typeof window !== 'undefined') {
  Notiflix.Confirm.init({
    className: 'notiflix-confirm',
    width: '320px',
    zindex: 4000,
    position: 'center',
    distance: '10px',
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    backOverlay: true,
    backOverlayColor: 'rgba(2, 6, 23, 0.7)',
    rtl: false,
    fontFamily: 'inherit',
    cssAnimation: true,
    cssAnimationDuration: 300,
    cssAnimationStyle: 'zoom',
    plainText: true,

    titleColor: '#f8fafc',
    titleFontSize: '18px',
    titleMaxLength: 34,

    messageColor: '#94a3b8',
    messageFontSize: '14px',
    messageMaxLength: 110,

    buttonsFontSize: '14px',
    buttonsMaxLength: 34,
    okButtonColor: '#f8fafc',
    okButtonBackground: '#e11d48', // rose-600
    cancelButtonColor: '#cbd5e1',
    cancelButtonBackground: '#1e293b',
  });
}

/**
 * Handle Generic Delete Action with Notiflix Confirmation
 * @param {string} module - Entity name (e.g. 'student')
 * @param {string|number} id - Entity ID
 * @param {Function} onSuccess - Callback if deletion is successful
 */
export const handleConfirmDelete = (module, id, onSuccess) => {
  Notiflix.Confirm.show(
    'Confirm Deletion',
    `Are you sure you want to delete this ${module}? This action cannot be undone.`,
    'Yes, Delete',
    'Cancel',
    async () => {
      try {
        const result = await deleteEntityAction(module, id);
        if (result.success) {
          notifySuccess(result.message || `${module} deleted successfully`);
          if (onSuccess) onSuccess();
        } else {
          notifyError(result.message || `Failed to delete ${module}`);
        }
      } catch (err) {
        notifyError('An unexpected error occurred.');
      }
    },
    () => {}
  );
};

/**
 * Custom Confirmation Dialog with Notiflix
 * @param {string} title 
 * @param {string} message 
 * @param {Function} onConfirm 
 * @param {string} confirmText 
 */
export const confirmCustomAction = (title, message, onConfirm, confirmText = 'Yes, Delete') => {
  Notiflix.Confirm.show(
    title,
    message,
    confirmText,
    'Cancel',
    async () => {
      if (onConfirm) await onConfirm();
    },
    () => {}
  );
};

/**
 * Handle Generic Status Update
 * @param {string} module - Entity name
 * @param {string|number} id - Entity ID
 * @param {string} status - New status ('active' | 'inactive')
 * @param {Function} onSuccess - Callback if update is successful
 */
export const handleStatusToggle = async (module, id, status, onSuccess) => {
  try {
    const result = await updateStatusAction(module, id, status);
    if (result.success) {
      notifySuccess(result.message || `${module} status updated to ${status}`);
      if (onSuccess) onSuccess();
    } else {
      notifyError(result.message || `Failed to update ${module} status`);
    }
  } catch (err) {
    notifyError('An unexpected error occurred.');
  }
};

/**
 * Format Phone Number with space after country code +91
 * @param {string} phone 
 * @returns {string}
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let str = String(phone).trim();
  if (!str) return '';
  if (str.startsWith('+91')) {
    if (!str.startsWith('+91 ')) {
      return str.replace(/^\+91\s*/, '+91 ');
    }
    return str;
  }
  if (str.startsWith('+')) {
    return str;
  }
  return `+91 ${str}`;
};

