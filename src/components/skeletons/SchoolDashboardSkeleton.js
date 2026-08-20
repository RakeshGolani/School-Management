'use client';
import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';

/**
 * Ultra-Premium Skeleton Loader for School Dashboard Page
 */
export default function SchoolDashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse pb-12">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl p-6 sm:p-8 bg-slate-100 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 w-full max-w-lg">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-4 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* 4 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-8 w-24 rounded-lg mb-2" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Bus GPS Live Map & Today's Attendance Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Smart Bus GPS Map */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            {/* Map Placeholder */}
            <Skeleton className="h-[380px] w-full rounded-2xl" />
          </div>
        </div>

        {/* Right Column: Today's Attendance & Gate Stream */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Fee Collection Overview & Recent Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((l) => (
                <Skeleton key={l} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
