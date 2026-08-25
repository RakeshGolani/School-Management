export default function StudentTransportSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
          <div className="h-7 w-60 sm:w-72 bg-slate-200 rounded-xl" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="h-5 w-44 bg-slate-200 rounded-lg" />
            <div className="h-64 sm:h-80 w-full bg-slate-100 rounded-2xl" />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded-lg" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
