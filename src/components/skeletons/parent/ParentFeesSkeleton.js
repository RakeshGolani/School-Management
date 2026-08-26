'use client';

/**
 * Ultra-Clean Skeleton Loader for Parent Fees & Invoices Page
 */
export default function ParentFeesSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse pb-12">
      {/* 1. Header Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-36 bg-slate-200 rounded-full" />
            <div className="h-6 w-24 bg-slate-100 rounded-full" />
          </div>
          <div className="h-8 w-64 sm:w-80 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-48 sm:w-96 bg-slate-100 rounded-lg" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-slate-100 rounded-2xl border border-slate-200" />
        </div>
      </div>

      {/* 2. 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-center">
            <div className="h-3 w-24 bg-slate-200 rounded mx-auto" />
            <div className="h-8 w-28 bg-slate-200 rounded-xl mx-auto" />
            <div className="h-3 w-20 bg-slate-100 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* 3. Filter Bar Skeleton */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white shadow-2xs border border-slate-200/80 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="h-10 w-full lg:w-96 bg-slate-100 rounded-2xl" />
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="h-10 w-44 bg-slate-100 rounded-xl" />
          <div className="h-10 w-52 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 4. Table / Invoices List Card Skeleton */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-slate-200 rounded-lg" />
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-200 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-20 bg-slate-200 rounded-full" />
                <div className="w-9 h-9 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
