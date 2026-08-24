'use client';

import Skeleton from '@/components/ui/Skeleton';

export default function StudentProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <Skeleton width={80} height={80} className="rounded-2xl shrink-0" />
          <div className="space-y-2.5 text-center sm:text-left w-full sm:w-auto">
            <Skeleton height={18} className="w-40 rounded-full" />
            <Skeleton height={28} className="w-60" />
            <Skeleton height={16} className="w-56" />
          </div>
        </div>
        <Skeleton height={42} className="w-32 rounded-xl shrink-0" />
      </div>

      {/* 2-Column Responsive Layout: Left Details + Right ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Academic Details + Guardian & Access Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          {/* Academic Information Card Skeleton */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <Skeleton height={20} className="w-60" />
              <Skeleton height={16} className="w-28 rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <Skeleton height={16} className="w-36" />
                  <Skeleton height={16} className="w-44" />
                </div>
              ))}
            </div>
          </div>

          {/* Guardian & Access Telemetry Card Skeleton */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <Skeleton height={20} className="w-56" />
              <Skeleton height={16} className="w-28 rounded-full" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <Skeleton height={16} className="w-32" />
                  <Skeleton height={16} className="w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Official Student ID Card Skeleton */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-[320px] bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <Skeleton width={36} height={36} className="rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton height={14} className="w-3/4" />
                <Skeleton height={10} className="w-1/2" />
              </div>
            </div>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center space-y-2.5 py-2">
              <Skeleton width={88} height={88} className="rounded-2xl" />
              <Skeleton height={20} className="w-36" />
              <Skeleton height={16} className="w-24 rounded-full" />
            </div>

            {/* Detail Grid */}
            <div className="p-3 bg-slate-50 rounded-2xl grid grid-cols-2 gap-2">
              <Skeleton height={28} className="w-full rounded-lg" />
              <Skeleton height={28} className="w-full rounded-lg" />
              <Skeleton height={28} className="w-full rounded-lg" />
              <Skeleton height={28} className="w-full rounded-lg" />
            </div>

            {/* Footer rows */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton height={14} className="w-full" />
              <Skeleton height={14} className="w-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
