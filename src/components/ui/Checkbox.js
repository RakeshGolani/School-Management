'use client';
import { Check } from 'lucide-react';

/**
 * Dynamic Reusable Checkbox Component
 */
export default function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  id,
  name,
  disabled = false,
  className = ''
}) {
  const checkboxId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex items-start space-x-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative flex items-center mt-0.5">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div 
          onClick={() => !disabled && onChange && onChange({ target: { checked: !checked, name } })}
          className={`w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center cursor-pointer ${
            checked 
              ? 'bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/20' 
              : 'bg-slate-900/80 border-white/15 hover:border-slate-400'
          }`}
        >
          {checked && <Check size={14} strokeWidth={3} />}
        </div>
      </div>

      {(label || description) && (
        <div 
          onClick={() => !disabled && onChange && onChange({ target: { checked: !checked, name } })}
          className="select-none cursor-pointer"
        >
          {label && <p className="text-sm font-medium text-slate-200">{label}</p>}
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
}
