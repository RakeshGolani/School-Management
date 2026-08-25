export default function ParentDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="p-5 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2.5">
          <div className="h-5 w-44 bg-slate-200 rounded-full" />
          <div className="h-8 w-60 sm:w-80 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-48 sm:w-96 bg-slate-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2.5 sm:gap-3">
          <div className="h-11 w-full sm:w-40 bg-slate-200 rounded-2xl" />
          <div className="h-11 w-full sm:w-32 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton (2-col mobile, 4-col desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <div className="h-7 w-24 bg-slate-200 rounded-lg" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 w-44 bg-slate-200 rounded-lg" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
            <div className="h-48 sm:h-64 w-full bg-slate-100 rounded-2xl" />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-6 w-40 bg-slate-200 rounded-lg" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
