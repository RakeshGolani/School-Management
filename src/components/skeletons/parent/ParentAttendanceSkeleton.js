export default function ParentAttendanceSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-pulse pb-24 sm:pb-8">
      
      {/* 1. Header Banner Skeleton */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-40 bg-slate-200 rounded-full" />
            <div className="h-5 w-32 bg-slate-100 rounded-full" />
          </div>
          <div className="h-7 w-64 sm:w-80 bg-slate-200 rounded-xl" />
          <div className="h-3.5 w-48 sm:w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-14 w-32 bg-slate-100 rounded-2xl border border-slate-200" />
          <div className="h-10 w-24 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 2. Four Stat Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded mx-auto" />
            <div className="h-8 w-14 bg-slate-200 rounded-xl mx-auto" />
            <div className="h-2.5 w-24 bg-slate-100 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* 3. Filter Bar Skeleton */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-slate-100 rounded-xl shrink-0" />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-36 bg-slate-100 rounded-xl" />
          <div className="h-8 w-48 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 4. DataTable Skeleton */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="h-5 w-48 bg-slate-200 rounded-lg" />
            <div className="h-3 w-64 bg-slate-100 rounded" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
              <div className="space-y-1 w-1/4">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-2.5 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-200 rounded-full" />
              <div className="h-4 w-24 bg-slate-200 rounded font-mono" />
              <div className="h-4 w-24 bg-slate-200 rounded font-mono" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-200 rounded-lg" />
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
