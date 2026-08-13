'use client';
import React from 'react';

/**
 * Enterprise-Grade Professional Dynamic Checkbox Component
 */
export default function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  id,
  name,
  disabled = false,
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) {
  const checkboxId = id || name || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const sizeClasses = {
    sm: 'w-4 h-4 rounded-[4px]',
    md: 'w-[18px] h-[18px] rounded-[5px]',
    lg: 'w-5 h-5 rounded-md',
  }[size] || 'w-[18px] h-[18px] rounded-[5px]';

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  }[size] || 12;

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || !onChange) return;
    onChange({
      target: {
        checked: !checked,
        name: name || id,
        type: 'checkbox'
      }
    });
  };

  return (
    <div 
      className={`inline-flex items-start gap-2.5 select-none cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="relative flex items-center shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={() => {}}
          disabled={disabled}
          className="sr-only"
        />
        <div 
          className={`${sizeClasses} border transition-colors duration-150 flex items-center justify-center relative ${
            checked 
              ? 'bg-primary-600 border-primary-600 text-white shadow-2xs' 
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
          }`}
          style={checked ? {
            backgroundColor: 'var(--theme-primary-500)',
            borderColor: 'var(--theme-primary-500)'
          } : {}}
        >
          {checked && (
            <svg 
              className="text-white" 
              style={{ width: iconSizes, height: iconSizes }}
              viewBox="0 0 14 14" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2.5 7.5L5.5 10.5L11.5 3.5" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          )}
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
