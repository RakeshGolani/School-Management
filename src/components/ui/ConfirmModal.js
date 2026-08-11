'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, Info, HelpCircle, X } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Dynamic Reusable Confirmation Modal (Matches Admin & Light/Dark Theme dynamically)
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  type = 'confirm', // 'confirm' | 'warning' | 'danger' | 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(null);

  // Set mounted state on client side
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  // Handle clicking outside the modal container to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !loading) {
      onClose();
    }
  };

  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !mounted) return null;

  // Type configuration helper with dynamic theme classes
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertCircle,
          iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
          buttonVariant: 'danger',
          borderAccent: 'border-rose-500/20',
          buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-2xs'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
          buttonVariant: 'primary',
          borderAccent: 'border-amber-500/20',
          buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-2xs'
        };
      case 'info':
        return {
          icon: Info,
          iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
          buttonVariant: 'secondary',
          borderAccent: 'border-blue-500/20',
          buttonClass: ''
        };
      case 'confirm':
      default:
        return {
          icon: HelpCircle,
          iconBg: 'bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400',
          buttonVariant: 'primary',
          borderAccent: 'border-primary-500/20',
          buttonClass: ''
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return createPortal(
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200 ease-out ${
        animate ? 'bg-slate-950/70 backdrop-blur-xs opacity-100' : 'bg-slate-950/0 backdrop-blur-none opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${styles.borderAccent} rounded-[28px] p-6 shadow-2xl space-y-6 transition-all duration-200 ease-out origin-center ${
          animate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        {/* Close Button */}
        {!loading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header & Icon */}
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${styles.iconBg}`}>
            <IconComponent size={24} />
          </div>
          <div className="space-y-1.5 pt-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {!loading && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          
          <Button
            onClick={onConfirm}
            variant={styles.buttonVariant}
            loading={loading}
            className={styles.buttonClass}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
