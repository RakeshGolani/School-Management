'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { CalendarDays, AlertTriangle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

/**
 * AcademicYearGuard
 * Blocks all dashboard pages (except /academic-years) when no active academic
 * session is selected. Shows a premium full-page overlay with a redirect CTA.
 */
export default function AcademicYearGuard({ children }) {
  const { activeYear, loading, academicYears, fetchAcademicYears } = useAcademicYear();
  const pathname = usePathname();
  const router = useRouter();

  // Always allow access to the academic years management page itself
  const isAcademicYearPage = pathname?.startsWith('/academic-years');

  // Show guard overlay only after context has fully loaded and no active year is found
  const showGuard = !loading && !activeYear && !isAcademicYearPage;

  if (showGuard) {
    const hasYears = academicYears && academicYears.length > 0;

    return (
      <>
        {/* Blurred page behind the overlay */}
        <div className="pointer-events-none select-none blur-sm opacity-30 absolute inset-0 overflow-hidden">
          {children}
        </div>

        {/* Full-page guard overlay */}
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* Ambient background glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />

          {/* Card */}
          <div
            className="relative max-w-md w-full mx-6 rounded-3xl p-8 text-center shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.90) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.08)'
            }}
          >
            {/* Icon container */}
            <div className="flex justify-center mb-6">
              <div
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  boxShadow: '0 0 30px rgba(139,92,246,0.2)'
                }}
              >
                {hasYears ? (
                  <AlertTriangle size={36} className="text-amber-400" />
                ) : (
                  <CalendarDays size={36} className="text-violet-400" />
                )}
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  <span className="text-white text-xs font-black">!</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                Session Required
              </span>
              <Sparkles size={14} className="text-violet-400" />
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-3 leading-tight">
              {hasYears
                ? 'No Active Academic Session'
                : 'Academic Session Not Found'}
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {hasYears
                ? 'The selected session has no active year. Please activate an existing academic year or create a new one to access the dashboard data.'
                : 'No academic sessions have been created yet for this school. Set up your first academic session to get started.'}
            </p>

            {/* Divider */}
            <div
              className="h-px w-full mb-6"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }}
            />

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/academic-years')}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm text-white transition-all duration-200 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.35)'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.35)'}
              >
                <CalendarDays size={16} />
                {hasYears ? 'Manage Academic Sessions' : 'Create Academic Session'}
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => fetchAcademicYears()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-2xl font-semibold text-xs text-slate-400 transition-all duration-200 hover:text-slate-200 hover:bg-white/5"
              >
                <RefreshCw size={13} />
                Refresh Session List
              </button>
            </div>

            {/* Footer note */}
            <p className="mt-6 text-[10px] text-slate-600 leading-relaxed">
              All data (fees, attendance, students) is scoped per academic session.<br />
              An active session is required to view or manage school data.
            </p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
