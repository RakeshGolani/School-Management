'use client';

/**
 * Ultra-Premium Skeleton Loader for School Dashboard Page
 */
export default function SchoolDashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-pulse pb-12">
      {/* 1. Top Hero Banner Skeleton */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 w-full max-w-lg">
          <div className="flex items-center gap-2">
            <div className="h-6 w-28 bg-slate-200 rounded-full" />
            <div className="h-6 w-32 bg-slate-100 rounded-full" />
          </div>
          <div className="h-8 w-64 sm:w-80 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-48 sm:w-96 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-slate-200 rounded-2xl" />
          <div className="h-10 w-36 bg-slate-100 rounded-2xl border border-slate-200" />
        </div>
      </div>

      {/* 2. 4 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-slate-200 rounded-2xl" />
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-8 w-24 bg-slate-200 rounded-xl" />
              <div className="h-3.5 w-36 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Grid: Bus GPS Live Map & Today's Attendance Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Live Smart Bus GPS Map */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-6 w-48 bg-slate-200 rounded-lg" />
                <div className="h-4 w-64 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-28 bg-slate-100 rounded-full" />
            </div>
            {/* Map Placeholder */}
            <div className="h-[380px] w-full rounded-2xl bg-slate-100" />
          </div>
        </div>

        {/* Right Column: Today's Attendance & Gate Stream */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-6 w-40 bg-slate-200 rounded-lg" />
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
            <div className="h-28 w-full rounded-2xl bg-slate-100" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-slate-200 rounded-xl" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-14 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Fee Collection Overview & Recent Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="h-6 w-44 bg-slate-200 rounded-lg" />
            <div className="h-20 w-full rounded-2xl bg-slate-100" />
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3].map((k) => (
                <div key={k} className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="h-6 w-44 bg-slate-200 rounded-lg" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((l) => (
                <div key={l} className="h-14 w-full bg-slate-50 rounded-xl border border-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
