'use client';

/**
 * Premium Light Theme Skeleton Loader Component
 * Supports smooth white shimmer animation and table-row presets.
 */
export default function Skeleton({ className = '', width, height, circle = false, style = {} }) {
  const shape = circle ? 'rounded-full' : 'rounded-xl';
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 ${shape} ${className}`}
      style={{ width, height, ...style }}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/80 dark:via-slate-700/80 to-transparent" />
    </div>
  );
}

/**
 * SkeletonTableRow – renders one shimmer row matching generic table columns
 */
export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <Skeleton circle width={36} height={36} className="shrink-0" />
          <div className="space-y-1.5">
            <Skeleton height={10} className="w-28" />
            <Skeleton height={8} className="w-16" />
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton height={10} className="w-20" />
      </td>
      <td className="py-3 px-4">
        <Skeleton height={10} className="w-24" />
      </td>
      <td className="py-3 px-4">
        <Skeleton height={10} className="w-20" />
      </td>
      <td className="py-3 px-4">
        <Skeleton height={20} className="w-24 rounded-full" />
      </td>
      <td className="py-3 px-4">
        <div className="space-y-1.5">
          <Skeleton height={10} className="w-28" />
          <Skeleton height={8} className="w-20" />
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton width={32} height={18} className="rounded-full" />
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end space-x-2">
          <Skeleton width={28} height={28} className="rounded-lg" />
          <Skeleton width={28} height={28} className="rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

/**
 * SkeletonClassRow – 7-column row skeleton for Class & Section table
 */
export function SkeletonClassRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="py-4 px-6">
        <Skeleton height={14} className="w-28" />
      </td>
      <td className="py-4 px-6">
        <Skeleton height={20} className="w-20 rounded-md" />
      </td>
      <td className="py-4 px-6">
        <Skeleton height={14} className="w-32" />
      </td>
      <td className="py-4 px-6">
        <Skeleton height={14} className="w-20" />
      </td>
      <td className="py-4 px-6">
        <Skeleton height={14} className="w-24" />
      </td>
      <td className="py-4 px-6">
        <Skeleton height={20} className="w-16 rounded-full" />
      </td>
      <td className="py-4 px-6 text-right">
        <div className="flex justify-end space-x-2">
          <Skeleton width={28} height={28} className="rounded-lg" />
          <Skeleton width={28} height={28} className="rounded-lg" />
          <Skeleton width={28} height={28} className="rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

/**
 * SkeletonClassroomLayout – Full visual skeleton for Classroom Seating Page
 */
export function SkeletonClassroomLayout() {
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Skeleton width={40} height={40} className="rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton height={12} className="w-36" />
            <Skeleton height={22} className="w-56" />
            <Skeleton height={10} className="w-40" />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Skeleton width={90} height={36} className="rounded-xl" />
          <Skeleton width={140} height={36} className="rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-2xs">
            <Skeleton height={10} className="w-24" />
            <div className="flex items-center justify-between">
              <Skeleton height={24} className="w-16" />
              <Skeleton width={28} height={28} circle />
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar Skeleton */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton height={36} className="w-full sm:w-80 rounded-xl" />
        <Skeleton height={36} className="w-full sm:w-48 rounded-xl" />
      </div>

      {/* Classroom Graphic Stage Skeleton */}
      <div className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Blackboard Skeleton */}
          <div className="lg:col-span-8 bg-emerald-950/80 border-4 border-amber-900/50 rounded-2xl p-6 space-y-4 min-h-[200px]">
            <Skeleton height={14} className="w-48 bg-emerald-900/50" />
            <Skeleton height={28} className="w-3/4 bg-emerald-900/50" />
            <Skeleton height={12} className="w-1/2 bg-emerald-900/50" />
          </div>
          {/* Teacher Podium Skeleton */}
          <div className="lg:col-span-4 bg-amber-50 dark:bg-slate-900 border-2 border-amber-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton width={48} height={48} circle />
              <div className="space-y-2">
                <Skeleton height={14} className="w-32" />
                <Skeleton height={10} className="w-24" />
              </div>
            </div>
            <Skeleton height={40} className="w-full rounded-xl" />
          </div>
        </div>

        {/* Desks Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((d) => (
            <div key={d} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
              <div className="flex justify-between">
                <Skeleton height={10} className="w-12" />
                <Skeleton width={10} height={10} circle />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Skeleton width={48} height={48} circle />
                <Skeleton height={12} className="w-20" />
                <Skeleton height={8} className="w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
