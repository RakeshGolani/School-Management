'use client';

import Skeleton from '@/components/ui/Skeleton';

export default function SchoolProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <Skeleton width={80} height={80} className="rounded-2xl shrink-0" />
          <div className="space-y-2.5 text-center sm:text-left w-full sm:w-auto">
            <Skeleton height={18} className="w-36 rounded-full" />
            <Skeleton height={28} className="w-64" />
            <Skeleton height={16} className="w-48" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton height={42} className="w-32 rounded-xl" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Skeleton height={38} className="w-36 rounded-xl" />
        <Skeleton height={38} className="w-36 rounded-xl" />
        <Skeleton height={38} className="w-36 rounded-xl" />
      </div>

      {/* Form Content Grid Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton height={16} className="w-32" />
            <Skeleton height={42} className="w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton height={16} className="w-32" />
            <Skeleton height={42} className="w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton height={16} className="w-32" />
            <Skeleton height={42} className="w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton height={16} className="w-32" />
            <Skeleton height={42} className="w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
