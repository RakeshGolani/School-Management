'use client';

export default function NotificationPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-28 rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border border-slate-200/60 p-6 flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-200/70 rounded-md"></div>
        </div>
        <div className="h-10 w-40 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 bg-slate-200 rounded-xl"></div>
        <div className="h-9 w-28 bg-slate-200 rounded-xl"></div>
        <div className="h-9 w-28 bg-slate-200 rounded-xl"></div>
        <div className="h-9 w-28 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Notification Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-52 bg-slate-200 rounded"></div>
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded"></div>
              <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
