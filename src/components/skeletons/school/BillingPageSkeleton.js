'use client';
import Skeleton from '@/components/ui/Skeleton';

/**
 * BillingPageSkeleton
 * Mirrors the exact layout of the Billing & Plans page for a seamless loading experience.
 */
export default function BillingPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 text-xs sm:text-sm">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton height={20} className="w-28 rounded-full" />
            <Skeleton height={20} className="w-36 rounded-full" />
          </div>
          <Skeleton height={28} className="w-72" />
          <Skeleton height={12} className="w-96" />
        </div>
        <Skeleton height={36} className="w-36" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* 2 stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton height={10} className="w-32" />
                    <Skeleton height={24} className="w-24" />
                  </div>
                  <Skeleton circle width={40} height={40} />
                </div>
                {/* Progress bar */}
                <Skeleton height={8} className="w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton height={10} className="w-28" />
                  <Skeleton height={18} className="w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Plan info card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Skeleton width={18} height={18} className="rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton height={12} className="w-36" />
                  <Skeleton height={10} className="w-24" />
                </div>
              </div>
              <Skeleton height={22} className="w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton height={9} className="w-20" />
                  <Skeleton height={13} className="w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Invoice table card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Skeleton width={36} height={36} className="rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton height={12} className="w-44" />
                <Skeleton height={10} className="w-64" />
              </div>
            </div>
            <div className="space-y-0 rounded-xl border border-slate-100 overflow-hidden">
              {/* Table header */}
              <div className="bg-slate-50 px-4 py-3 grid grid-cols-5 gap-4 border-b border-slate-100">
                {[80, 60, 60, 48, 48].map((w, i) => (
                  <Skeleton key={i} height={9} className={`w-${w === 80 ? '20' : w === 60 ? '16' : '12'}`} />
                ))}
              </div>
              {/* Table rows */}
              {[0, 1, 2].map((row) => (
                <div key={row} className="px-4 py-3.5 grid grid-cols-5 gap-4 border-b border-slate-100 last:border-0">
                  <Skeleton height={11} className="w-28" />
                  <Skeleton height={11} className="w-20" />
                  <Skeleton height={11} className="w-16" />
                  <Skeleton height={20} className="w-14 rounded-full" />
                  <Skeleton height={11} className="w-24 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Plan Simulator */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton width={18} height={18} className="rounded-md" />
                <Skeleton height={16} className="w-32" />
              </div>
              <Skeleton height={10} className="w-52" />
            </div>

            {/* Plan toggle */}
            <div className="space-y-2">
              <Skeleton height={9} className="w-28" />
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl">
                <Skeleton height={32} className="rounded-lg" />
                <Skeleton height={32} className="rounded-lg" />
              </div>
            </div>

            {/* Slider 1 */}
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <Skeleton height={11} className="w-24" />
                <Skeleton height={20} className="w-16 rounded-md" />
              </div>
              <Skeleton height={6} className="w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton height={9} className="w-12" />
                <Skeleton height={9} className="w-14" />
              </div>
            </div>

            {/* Slider 2 */}
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <Skeleton height={11} className="w-24" />
                <Skeleton height={20} className="w-16 rounded-md" />
              </div>
              <Skeleton height={6} className="w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton height={9} className="w-10" />
                <Skeleton height={9} className="w-12" />
              </div>
            </div>

            {/* Calculations */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton height={11} className="w-36" />
                  <Skeleton height={11} className="w-16" />
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-slate-200">
                <Skeleton height={14} className="w-28" />
                <Skeleton height={14} className="w-20" />
              </div>
            </div>

            {/* Button */}
            <Skeleton height={44} className="w-full rounded-2xl" />
          </div>
        </div>

      </div>
    </div>
  );
}
