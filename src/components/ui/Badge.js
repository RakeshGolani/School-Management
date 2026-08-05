'use client';

/**
 * Dynamic Reusable Badge Component
 */
export default function Badge({
  variant = 'primary',
  children,
  dot = false,
  className = ''
}) {
  const variants = {
    primary: 'bg-primary-500/10 border-primary-500/20 text-primary-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    slate: 'bg-slate-800 border-white/10 text-slate-300'
  };

  const dotColors = {
    primary: 'bg-primary-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    blue: 'bg-blue-400',
    slate: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center border px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${variants[variant] || variants.primary} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant] || dotColors.primary} animate-pulse`}></span>}
      {children}
    </span>
  );
}
