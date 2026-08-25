export default function ParentFeesSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
          <div className="h-7 w-60 sm:w-72 bg-slate-200 rounded-xl" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-7 w-24 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-3 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-24 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
