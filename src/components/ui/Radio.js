'use client';

/**
 * Dynamic Reusable Radio & RadioGroup Components
 */
export function RadioGroup({
  label,
  options = [],
  value,
  onChange,
  name,
  disabled = false,
  className = ''
}) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <div
              key={option.value}
              onClick={() => !disabled && onChange && onChange(option.value)}
              className={`flex items-start space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-primary-600/10 border-primary-500/40 text-white'
                  : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80 text-slate-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center h-5 mt-0.5">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'border-primary-500 bg-primary-600' : 'border-slate-500 bg-slate-900'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RadioGroup;
