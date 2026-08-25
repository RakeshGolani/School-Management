'use client';

export default function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto animate-pulse pb-12">
      {/* 1. Hero Banner Skeleton */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2.5 max-w-lg w-full">
          <div className="h-5 w-48 bg-slate-200 rounded-full" />
          <div className="h-8 w-64 sm:w-80 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-48 sm:w-96 bg-slate-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="h-11 w-full sm:w-36 bg-slate-200 rounded-2xl" />
          <div className="h-11 w-full sm:w-36 bg-slate-100 rounded-2xl border border-slate-200" />
        </div>
      </div>

      {/* 2. Spotlight: Current Active Period & Next Period Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Active Period Card Skeleton */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-200/80 border border-slate-300/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 bg-slate-300 rounded-full" />
            <div className="h-6 w-28 bg-slate-300 rounded-xl" />
          </div>
          <div className="space-y-2 py-1">
            <div className="h-7 w-48 bg-slate-300 rounded-xl" />
            <div className="flex items-center gap-3">
              <div className="h-5 w-28 bg-slate-300/80 rounded-lg" />
              <div className="h-5 w-24 bg-slate-300/80 rounded-lg" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-300/60 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-300/70 rounded" />
            <div className="h-8 w-36 bg-slate-300 rounded-xl" />
          </div>
        </div>

        {/* Right: Upcoming Next Period Card Skeleton */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 bg-slate-200 rounded-full" />
            <div className="h-6 w-20 bg-slate-100 rounded-lg" />
          </div>
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between">
              <div className="h-7 w-44 bg-slate-200 rounded-xl" />
              <div className="h-6 w-28 bg-slate-100 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-36 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* 3. KPI Metric Cards Skeleton (2-col mobile, 4-col desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="w-8 h-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-1">
              <div className="h-7 w-24 bg-slate-200 rounded-lg" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Complete Today's Schedule Matrix Skeleton */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="h-6 w-56 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-44 bg-slate-100 rounded" />
          </div>
          <div className="h-4 w-28 bg-slate-200 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-slate-200 rounded-md" />
                <div className="h-4 w-14 bg-slate-200 rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="h-5 w-36 bg-slate-200 rounded-lg" />
                <div className="h-3.5 w-24 bg-slate-100 rounded" />
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
