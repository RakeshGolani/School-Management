'use client';
import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';

/**
 * StudentDetailsSkeleton
 * Mirrors the single-page Student Details Hub layout with shimmer loaders.
 */
export default function StudentDetailsSkeleton() {
  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Header Actions Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton height={40} className="w-36 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton height={32} className="w-20 rounded-full" />
          <Skeleton height={36} className="w-36 rounded-xl" />
        </div>
      </div>

      {/* Profile Header Banner Skeleton */}
      <Card className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Skeleton width={112} height={112} circle className="shrink-0" />
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="space-y-2">
                <Skeleton height={28} className="w-64" />
                <Skeleton height={16} className="w-40" />
              </div>
              <div className="flex gap-2">
                <Skeleton height={32} className="w-28 rounded-xl" />
                <Skeleton height={32} className="w-24 rounded-xl" />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton height={36} className="w-full rounded-lg" />
              <Skeleton height={36} className="w-full rounded-lg" />
              <Skeleton height={36} className="w-full rounded-lg" />
              <Skeleton height={36} className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Card>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <Skeleton height={24} className="w-40" />
              <Skeleton height={40} className="w-full rounded-xl" />
              <Skeleton height={40} className="w-full rounded-xl" />
              <Skeleton height={40} className="w-full rounded-xl" />
            </Card>
            <Card className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <Skeleton height={24} className="w-40" />
              <Skeleton height={40} className="w-full rounded-xl" />
              <Skeleton height={40} className="w-full rounded-xl" />
              <Skeleton height={40} className="w-full rounded-xl" />
            </Card>
          </div>

          <Card className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <Skeleton height={24} className="w-56" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton height={80} className="w-full rounded-xl" />
              <Skeleton height={80} className="w-full rounded-xl" />
              <Skeleton height={80} className="w-full rounded-xl" />
            </div>
          </Card>

          <Card className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <Skeleton height={24} className="w-48" />
            <Skeleton height={48} className="w-full rounded-xl" />
            <Skeleton height={48} className="w-full rounded-xl" />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <Skeleton height={24} className="w-40" />
            <Skeleton height={40} className="w-full rounded-xl" />
            <Skeleton height={40} className="w-full rounded-xl" />
            <Skeleton height={40} className="w-full rounded-xl" />
          </Card>
          <Card className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <Skeleton height={24} className="w-40" />
            <Skeleton height={40} className="w-full rounded-xl" />
            <Skeleton height={40} className="w-full rounded-xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}
