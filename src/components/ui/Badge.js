'use client';

/**
 * Dynamic Reusable Badge Component
 */
export default function Badge({
  variant = 'primary',
  children,
  dot = false,
  size = 'md',
  className = ''
}) {
  const variants = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    slate: 'bg-slate-100 border-slate-200 text-slate-700'
  };

  const dotColors = {
    primary: 'bg-primary-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    blue: 'bg-blue-600',
    slate: 'bg-slate-600'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap border rounded-full font-bold tracking-wide leading-normal shrink-0 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotColors[variant] || dotColors.primary} animate-pulse`}></span>}
      {children}
    </span>
  );
}
