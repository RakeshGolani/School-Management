'use client';

import Skeleton from '@/components/ui/Skeleton';

export default function ParentProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <Skeleton width={80} height={80} className="rounded-2xl shrink-0" />
        <div className="space-y-2.5 text-center sm:text-left w-full">
          <Skeleton height={18} className="w-36 rounded-full" />
          <Skeleton height={28} className="w-64" />
          <Skeleton height={16} className="w-48" />
        </div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <Skeleton height={20} className="w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <Skeleton height={16} className="w-32" />
                <Skeleton height={16} className="w-44" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <Skeleton height={20} className="w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <Skeleton height={16} className="w-32" />
                <Skeleton height={16} className="w-44" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
