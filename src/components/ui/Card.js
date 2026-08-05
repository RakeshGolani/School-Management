'use client';

/**
 * Dynamic Reusable Card Component
 */
export default function Card({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = '',
  glass = true,
  ...props
}) {
  return (
    <div 
      className={`${
        glass ? 'glass-panel' : 'bg-white border border-slate-200 shadow-sm'
      } p-6 rounded-3xl space-y-4 shadow-sm transition-all duration-300 ${className}`}
      {...props}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-bold text-slate-900 tracking-wide">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div>{children}</div>
    </div>
  );
}
