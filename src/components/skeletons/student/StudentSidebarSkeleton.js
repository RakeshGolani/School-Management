'use client';

/**
 * Ultra-Clean Skeleton Loader for Student Portal Sidebar
 */
export default function StudentSidebarSkeleton() {
  return (
    <aside className="w-72 bg-white flex flex-col justify-between shadow-lg shadow-slate-200/50 h-screen shrink-0 animate-pulse border-r border-slate-100">
      {/* Brand & Student Desk Badge Skeleton */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        {/* School Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-200 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
            <div className="h-3 w-16 bg-slate-100 rounded-sm" />
          </div>
        </div>

        {/* Student Desk Pill Skeleton */}
        <div className="px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-slate-200 shrink-0" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-4 w-14 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* Navigation Menu List Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="px-3.5 pt-1 pb-1">
          <div className="h-2.5 w-20 bg-slate-200 rounded" />
        </div>

        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-100/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-slate-100" />
          </div>
        ))}

        <div className="pt-4 pb-1 px-3.5">
          <div className="h-2.5 w-24 bg-slate-200 rounded" />
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-100/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
          </div>
          <div className="w-3.5 h-3.5 rounded-full bg-slate-100" />
        </div>
      </div>

      {/* Bottom Student Profile Card Skeleton */}
      <div className="p-4 border-t border-slate-100 space-y-2.5">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
              <div className="h-2.5 w-24 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-4 w-12 bg-slate-200 rounded-full" />
        </div>
        <div className="h-9 w-full rounded-xl bg-rose-50/60 border border-rose-100/60" />
      </div>
    </aside>
  );
}
