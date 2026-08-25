export default function TeacherStudentsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 rounded-full" />
          <div className="h-7 w-60 sm:w-72 bg-slate-200 rounded-xl" />
          <div className="h-3 w-52 bg-slate-100 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="h-10 w-full max-w-md bg-slate-100 rounded-xl" />
      </div>

      {/* Mobile Card List Skeleton */}
      <div className="block md:hidden space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-5 w-12 bg-slate-100 rounded" />
            </div>
            <div className="h-12 w-full bg-slate-50 rounded-xl" />
            <div className="flex justify-between pt-1">
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between">
          <div className="h-4 w-16 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="h-4 w-8 bg-slate-200 rounded" />
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
