'use client';
import { usePathname, useRouter } from 'next/navigation';
import { usePackage } from '@/context/PackageContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getModuleInfo } from '@/config/modules';

/**
 * Route prefix to Module Key mapping
 */
const ROUTE_MODULE_MAP = [
  // School Admin Routes
  { prefix: '/transport', moduleKey: 'transport' },
  { prefix: '/classes', moduleKey: 'academics' },
  { prefix: '/teachers', moduleKey: 'teachers' },
  { prefix: '/attendance', moduleKey: 'attendance' },
  { prefix: '/leaves', moduleKey: 'attendance' },
  { prefix: '/timetable', moduleKey: 'timetable' },
  { prefix: '/fees', moduleKey: 'fees' },
  { prefix: '/academic-years', moduleKey: 'academic_years' },

  // Teacher Desk Routes
  { prefix: '/teacher/attendance', moduleKey: 'attendance' },
  { prefix: '/teacher/leaves', moduleKey: 'attendance' },
  { prefix: '/teacher/timetable', moduleKey: 'timetable' },
  { prefix: '/teacher/students', moduleKey: 'students' },

  // Student Portal Routes
  { prefix: '/student/transport', moduleKey: 'transport' },
  { prefix: '/student/timetable', moduleKey: 'timetable' },
  { prefix: '/student/attendance', moduleKey: 'attendance' },
  { prefix: '/student/leaves', moduleKey: 'attendance' },

  // Parent Portal Routes
  { prefix: '/parent/bus-tracking', moduleKey: 'transport' },
  { prefix: '/parent/attendance', moduleKey: 'attendance' },
  { prefix: '/parent/fees', moduleKey: 'fees' },
  { prefix: '/parent/timetable', moduleKey: 'timetable' },
];

/**
 * PackageRouteGuard
 * Prevents direct URL address bar navigation to pages that are not
 * included in the school's assigned SaaS package / modules.
 */
export default function PackageRouteGuard({ children }) {
  const { packageInfo, hasModule, loading } = usePackage();
  const pathname = usePathname();
  const router = useRouter();

  // Find if current route requires a specific module
  const matchedRoute = ROUTE_MODULE_MAP.find(route => pathname === route.prefix || pathname?.startsWith(`${route.prefix}/`));

  if (matchedRoute && !loading) {
    const isAllowed = hasModule(matchedRoute.moduleKey);

    if (!isAllowed) {
      const moduleInfo = getModuleInfo(matchedRoute.moduleKey);

      // Determine home dashboard redirect URL based on active portal
      const homeDashboardUrl = (pathname === '/teacher' || pathname?.startsWith('/teacher/'))
        ? '/teacher/dashboard'
        : (pathname === '/student' || pathname?.startsWith('/student/'))
        ? '/student/dashboard'
        : (pathname === '/parent' || pathname?.startsWith('/parent/'))
        ? '/parent/dashboard'
        : '/dashboard';

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 text-center space-y-6 animate-fadeIn">
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock size={32} />
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                <ShieldAlert size={13} /> Module Restricted
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {moduleInfo.label} Not Included
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                The <strong>{moduleInfo.label}</strong> feature is not enabled for your school&apos;s current subscription package.
              </p>
            </div>

            {/* Current Package Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Current Package Plan</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-black border border-primary-200/60 uppercase">
                  {packageInfo?.code || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold">{packageInfo?.name || 'School ERP'}</p>
              <p className="text-[11px] text-slate-400">
                To access this module, please contact your Super Admin to upgrade your package or enable this module.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                variant="primary"
                icon={ArrowLeft}
                onClick={() => router.push(homeDashboardUrl)}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
