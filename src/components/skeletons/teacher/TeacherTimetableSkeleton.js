export default function TeacherTimetableSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
          <div className="h-7 w-64 sm:w-80 bg-slate-200 rounded-xl" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-32 bg-slate-100 rounded-lg" />
      </div>

      {/* Day Pills Bar Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white border border-slate-200 rounded-2xl">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-20 sm:w-28 bg-slate-100 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-slate-200" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-5 w-36 bg-slate-200 rounded-lg" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
