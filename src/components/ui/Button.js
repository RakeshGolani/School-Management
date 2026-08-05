'use client';
import { Loader2 } from 'lucide-react';

/**
 * Dynamic Reusable Button Component
 */
export default function Button({
  variant = 'primary',
  children,
  loading = false,
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer py-2.5 px-4 sm:px-5';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-xs',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} className="mr-2 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
