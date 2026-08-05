'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Dynamic Reusable Input Component
 */
export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  className = '',
  disabled = false,
  id,
  name,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPassword = type === 'password';
  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Icon size={18} />
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={computedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-slate-50/70 border ${
            error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'
          } rounded-xl py-2.5 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${isPassword ? 'pr-11' : 'pr-4'} text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 ${
            error ? 'focus:ring-rose-500/20' : 'focus:ring-primary-500/20'
          } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>
      )}
    </div>
  );
}
