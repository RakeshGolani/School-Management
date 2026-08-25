export default function TeacherAttendanceSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
          <div className="h-7 w-60 sm:w-72 bg-slate-200 rounded-xl" />
          <div className="h-3 w-44 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="h-10 w-full sm:w-40 bg-slate-100 rounded-xl flex-1 sm:flex-initial" />
          <div className="h-10 w-32 bg-slate-200 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 4 Stat Pills Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-1.5">
            <div className="h-3 w-16 bg-slate-200 rounded mx-auto" />
            <div className="h-7 w-12 bg-slate-200 rounded-lg mx-auto" />
          </div>
        ))}
      </div>

      {/* Control Bar Skeleton */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="h-10 w-full sm:max-w-md bg-slate-100 rounded-xl" />
        <div className="h-10 w-full sm:w-36 bg-slate-100 rounded-xl" />
      </div>

      {/* Student List Skeleton */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3.5 sm:p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-32 sm:w-40 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="h-3 w-14 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-4 sm:flex gap-1.5 w-full sm:w-auto">
              <div className="h-9 w-full sm:w-20 bg-slate-200 rounded-xl" />
              <div className="h-9 w-full sm:w-20 bg-slate-100 rounded-xl" />
              <div className="h-9 w-full sm:w-20 bg-slate-100 rounded-xl" />
              <div className="h-9 w-full sm:w-20 bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
