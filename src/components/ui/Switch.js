'use client';
import React from 'react';

/**
 * Reusable Toggle Switch Component
 */
export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  activeColor = 'bg-emerald-500',
  inactiveColor = 'bg-slate-700',
  className = '',
  size = 'md'
}) {
  const sizes = {
    sm: { switch: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { switch: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { switch: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (!disabled && onChange) onChange(!checked);
      }}
      className={`
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
        focus-visible:ring-white/75 ${checked ? activeColor : inactiveColor} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
        ${currentSize.switch} ${className}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block rounded-full bg-white shadow-lg transform ring-0 
          transition duration-200 ease-in-out
          ${currentSize.thumb}
          ${checked ? currentSize.translate : 'translate-x-0'}
        `}
      />
    </button>
  );
}
