'use client';
import { usePathname } from 'next/navigation';
import Skeleton, { SkeletonTableRow, SkeletonClassRow } from '@/components/ui/Skeleton';
import SchoolDashboardSkeleton from '@/components/skeletons/school/SchoolDashboardSkeleton';
import SchoolAttendanceSkeleton from '@/components/skeletons/school/SchoolAttendanceSkeleton';
import SchoolProfileSkeleton from '@/components/skeletons/school/SchoolProfileSkeleton';
import StudentDetailsSkeleton from '@/components/skeletons/school/StudentDetailsSkeleton';
import TeacherDetailsSkeleton from '@/components/skeletons/school/TeacherDetailsSkeleton';
import BillingPageSkeleton from '@/components/skeletons/school/BillingPageSkeleton';
import NotificationPageSkeleton from '@/components/skeletons/school/NotificationPageSkeleton';

/**
 * PageWiseSkeleton
 * Renders the exact contextual skeleton loader matching the active route pathname.
 * Used during subscription lockouts and loading states to prevent real backend API calls.
 */
export default function PageWiseSkeleton() {
  const pathname = usePathname() || '';

  // 1. Dashboard
  if (pathname === '/dashboard' || pathname === '/') {
    return <SchoolDashboardSkeleton />;
  }

  // 2. Attendance & Leaves
  if (pathname === '/attendance' || pathname?.startsWith('/attendance') || pathname === '/leaves') {
    return <SchoolAttendanceSkeleton />;
  }

  // 3. Profile
  if (pathname === '/profile') {
    return <SchoolProfileSkeleton />;
  }

  // 4. Billing
  if (pathname === '/billing') {
    return <BillingPageSkeleton />;
  }

  // 5. Notifications
  if (pathname === '/notifications') {
    return <NotificationPageSkeleton />;
  }

  // 6. Student Details
  if (pathname?.startsWith('/students/') && pathname.split('/').length > 2) {
    return <StudentDetailsSkeleton />;
  }

  // 7. Teacher Details
  if (pathname?.startsWith('/teachers/') && pathname.split('/').length > 2) {
    return <TeacherDetailsSkeleton />;
  }

  // 8. General Table / Directory Skeleton (Students, Teachers, Classes, Fees, Academic Years, Settings)
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Shimmer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-100 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton height={20} className="w-24 rounded-full" />
            <Skeleton height={20} className="w-28 rounded-full" />
          </div>
          <Skeleton height={28} className="w-64 sm:w-80" />
          <Skeleton height={14} className="w-72 sm:w-96" />
        </div>
        <Skeleton height={42} className="w-36 rounded-xl" />
      </div>

      {/* Metric Cards Shimmer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton height={12} className="w-20" />
              <Skeleton circle width={32} height={32} />
            </div>
            <Skeleton height={28} className="w-16" />
            <Skeleton height={10} className="w-24" />
          </div>
        ))}
      </div>

      {/* Main Table Card Shimmer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        {/* Table Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Skeleton height={40} className="w-full sm:w-72 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton height={38} className="w-28 rounded-xl" />
            <Skeleton height={38} className="w-28 rounded-xl" />
          </div>
        </div>

        {/* Shimmer Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 pb-3">
                <th className="py-3 px-4"><Skeleton height={12} className="w-24" /></th>
                <th className="py-3 px-4"><Skeleton height={12} className="w-20" /></th>
                <th className="py-3 px-4"><Skeleton height={12} className="w-28" /></th>
                <th className="py-3 px-4"><Skeleton height={12} className="w-20" /></th>
                <th className="py-3 px-4"><Skeleton height={12} className="w-24" /></th>
                <th className="py-3 px-4 text-right"><Skeleton height={12} className="w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((rowIdx) => (
                <SkeletonTableRow key={rowIdx} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
