'use client';

export default function ParentNotificationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-6 flex items-center justify-between border border-slate-200/60">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-200 rounded"></div>
          <div className="h-3.5 w-64 bg-slate-200/70 rounded"></div>
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-xl"></div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-slate-200 rounded"></div>
              <div className="h-3 w-full bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
