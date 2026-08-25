'use client';

/**
 * Ultra-Premium Skeleton Loader for School Attendance Management Page
 */
export default function SchoolAttendanceSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse pb-16">
      {/* 1. Header Banner Skeleton */}
      <div className="rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 w-full max-w-lg">
          <div className="h-5 w-44 bg-slate-200 rounded-full" />
          <div className="h-8 w-64 sm:w-80 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-52 sm:w-96 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-24 bg-slate-100 rounded-2xl border border-slate-200" />
          <div className="h-10 w-36 bg-slate-200 rounded-2xl" />
        </div>
      </div>

      {/* 2. 5 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5 ${
              i === 5 ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 bg-slate-100 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded-xl" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Main Data Card Skeleton */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100" />
            <div className="space-y-1.5">
              <div className="h-5 w-48 bg-slate-200 rounded-lg" />
              <div className="h-3.5 w-64 bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        {/* Tabs & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 w-fit">
            <div className="h-8 w-36 bg-slate-200 rounded-xl" />
            <div className="h-8 w-36 bg-slate-100 rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-32 bg-slate-100 rounded-xl border border-slate-200" />
            <div className="h-8 w-32 bg-slate-100 rounded-xl border border-slate-200" />
          </div>
        </div>

        {/* Filter Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/60" />
            </div>
          ))}
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3 pt-2">
          <div className="h-10 w-full bg-slate-50 rounded-xl border border-slate-100" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between gap-4">
              <div className="h-4 w-6 bg-slate-200 rounded shrink-0" />
              {/* Student Details */}
              <div className="flex items-center gap-3 w-[30%]">
                <div className="w-10 h-10 rounded-2xl bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                </div>
              </div>
              {/* Class Teacher */}
              <div className="flex items-center gap-2.5 w-[20%] hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3.5 w-24 bg-slate-200 rounded" />
                  <div className="h-2.5 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              {/* RFID Scan */}
              <div className="h-7 w-24 bg-slate-100 rounded-xl border border-slate-200/60 hidden md:block" />
              {/* Status Action */}
              <div className="h-8 w-52 bg-slate-200 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
