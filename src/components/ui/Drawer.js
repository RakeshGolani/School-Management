'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  maxWidth = 'max-w-lg',
  className = '',
  children,
  footer
}) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [animate, setAnimate] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Animate slide-in / slide-out
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setAnimate(true), 15);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!shouldRender || !mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-300 ease-in-out ${
        animate ? 'bg-slate-950/60 backdrop-blur-sm opacity-100' : 'bg-slate-950/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className={`w-screen ${maxWidth} bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out ${
            animate ? 'translate-x-0' : 'translate-x-full'
          } ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header (Fixed) */}
          <div className="shrink-0 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              {Icon && (
                <div className="p-2.5 rounded-2xl bg-primary-50 dark:bg-primary-950/50 border border-primary-100 dark:border-primary-900/50 text-primary-600 dark:text-primary-400 shrink-0">
                  <Icon size={20} />
                </div>
              )}
              <div>
                {title && <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-wide">{title}</h3>}
                {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition duration-200 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {children}
          </div>

          {/* Drawer Footer (Fixed if provided) */}
          {footer && (
            <div className="shrink-0 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
