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
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                <Icon size={18} />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-wide truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0 flex items-center">{action}</div>}
        </div>
      )}

      <div>{children}</div>
    </div>
  );
}
