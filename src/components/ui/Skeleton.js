'use client';

/**
 * Premium Light Theme Skeleton Loader Component
 * Supports smooth white shimmer animation and table-row presets.
 */
export default function Skeleton({ className = '', width, height, circle = false, style = {} }) {
  const shape = circle ? 'rounded-full' : 'rounded-xl';
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 border border-slate-100 ${shape} ${className}`}
      style={{ width, height, ...style }}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

/**
 * SkeletonTableRow – renders one shimmer row matching table columns
 */
export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-100">
      {/* Avatar + name */}
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <Skeleton circle width={36} height={36} className="shrink-0" />
          <div className="space-y-1.5">
            <Skeleton height={10} className="w-28" />
            <Skeleton height={8} className="w-16" />
          </div>
        </div>
      </td>
      {/* Employee / Admission ID */}
      <td className="py-3 px-4">
        <Skeleton height={10} className="w-20" />
      </td>
      {/* Subject / Grade */}
      <td className="py-3 px-4">
        <Skeleton height={10} className="w-24" />
      </td>
      {/* Assigned Class */}
      <td className="py-3 px-4">
        <Skeleton height={10} className="w-20" />
      </td>
      {/* NFC UID */}
      <td className="py-3 px-4">
        <Skeleton height={20} className="w-24 rounded-full" />
      </td>
      {/* Phone Contact */}
      <td className="py-3 px-4">
        <div className="space-y-1.5">
          <Skeleton height={10} className="w-28" />
          <Skeleton height={8} className="w-20" />
        </div>
      </td>
      {/* Status Switch */}
      <td className="py-3 px-4">
        <Skeleton width={32} height={18} className="rounded-full" />
      </td>
      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end space-x-2">
          <Skeleton width={28} height={28} className="rounded-lg" />
          <Skeleton width={28} height={28} className="rounded-lg" />
        </div>
      </td>
    </tr>
  );
}
