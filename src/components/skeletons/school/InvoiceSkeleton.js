'use client';

export default function InvoiceSkeleton({ showActionBar = true, theme = 'light' }) {
  const isDark = theme === 'dark';

  // Define colors based on light/dark theme
  const colors = {
    parentBg: isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200',
    itemBg: isDark ? 'bg-slate-850' : 'bg-slate-200',
    cardBg: isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200',
    cardInner: isDark ? 'bg-slate-950/40' : 'bg-slate-50',
    border: isDark ? 'border-slate-800/80' : 'border-slate-200',
    subBorder: isDark ? 'border-slate-800' : 'border-slate-150',
    textMuted: isDark ? 'bg-slate-850' : 'bg-zinc-150',
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto animate-pulse">
      
      {/* Top Action Bar Skeleton */}
      {showActionBar && (
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl border ${colors.parentBg}`}>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className={`w-10 h-10 rounded-xl ${colors.itemBg}`}></div>
            <div className="space-y-2 flex-1 sm:flex-initial">
              <div className={`h-4 w-40 ${colors.itemBg} rounded-lg`}></div>
              <div className={`h-3 w-60 ${colors.itemBg} rounded-lg`}></div>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <div className={`h-8.5 w-20 ${colors.itemBg} rounded-xl`}></div>
            <div className={`h-8.5 w-32 ${colors.itemBg} rounded-xl`}></div>
          </div>
        </div>
      )}

      {/* Main Invoice Card Skeleton */}
      <div className={`mx-auto w-full max-w-[794px] border rounded-3xl overflow-hidden p-10 sm:p-14 space-y-8 ${colors.cardBg}`}>
        
        {/* Header Skeleton */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b gap-6 ${colors.border}`}>
          <div className="space-y-3 w-full md:w-auto">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl ${colors.itemBg}`}></div>
              <div className="space-y-2">
                <div className={`h-4.5 w-44 ${colors.itemBg} rounded-lg`}></div>
                <div className={`h-3 w-56 ${colors.itemBg} rounded-lg`}></div>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className={`h-3 w-72 ${colors.itemBg} rounded-md`}></div>
              <div className={`h-3 w-60 ${colors.itemBg} rounded-md`}></div>
            </div>
          </div>
          <div className={`w-full md:w-56 p-4 rounded-xl border space-y-2 ${colors.cardInner} ${colors.border}`}>
            <div className={`h-3 w-20 ${colors.itemBg} rounded-md`}></div>
            <div className={`h-4.5 w-36 ${colors.itemBg} rounded-lg`}></div>
            <div className={`h-3.5 w-28 ${colors.itemBg} rounded-md`}></div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border space-y-3 ${colors.cardInner} ${colors.border}`}>
            <div className={`h-3 w-32 ${colors.itemBg} rounded-md`}></div>
            <div className={`h-4 w-44 ${colors.itemBg} rounded-lg`}></div>
            <div className="space-y-2 pt-1">
              <div className={`h-3 w-36 ${colors.itemBg} rounded-md`}></div>
              <div className={`h-3 w-52 ${colors.itemBg} rounded-md`}></div>
              <div className={`h-3 w-40 ${colors.itemBg} rounded-md`}></div>
            </div>
          </div>
          <div className={`p-4 rounded-xl border space-y-3 ${colors.cardInner} ${colors.border}`}>
            <div className={`h-3 w-32 ${colors.itemBg} rounded-md`}></div>
            <div className="space-y-2 pt-1.5">
              <div className={`h-3.5 w-full ${colors.itemBg} rounded-md`}></div>
              <div className={`h-3.5 w-full ${colors.itemBg} rounded-md`}></div>
              <div className={`h-3.5 w-full ${colors.itemBg} rounded-md`}></div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className={`rounded-xl border overflow-hidden ${colors.border}`}>
          <div className={`h-10 w-full border-b ${colors.cardInner} ${colors.border}`}></div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className={`h-4 w-60 ${colors.itemBg} rounded-md`}></div>
                <div className={`h-3 w-80 ${colors.itemBg} rounded-md`}></div>
              </div>
              <div className={`h-4 w-32 ${colors.itemBg} rounded-md`}></div>
            </div>
          </div>
        </div>

        {/* Footer Calculations Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start pt-2 gap-4">
          <div className="space-y-2 w-full md:w-auto">
            <div className={`h-3 w-28 ${colors.itemBg} rounded-md`}></div>
            <div className={`h-3 w-72 ${colors.itemBg} rounded-md`}></div>
            <div className={`h-3 w-64 ${colors.itemBg} rounded-md`}></div>
          </div>
          <div className={`w-full md:w-72 p-4 rounded-xl border space-y-2.5 text-xs ${colors.cardInner} ${colors.border}`}>
            <div className={`h-3 w-full ${colors.itemBg} rounded-md`}></div>
            <div className={`h-3 w-full ${colors.itemBg} rounded-md`}></div>
            <div className={`h-3.5 w-full ${colors.itemBg} rounded-md pt-1`}></div>
          </div>
        </div>

        {/* Paid Seal Skeleton */}
        <div className={`pt-4 flex justify-center border-t ${colors.border}`}>
          <div className={`h-4 w-64 ${colors.itemBg} rounded-md`}></div>
        </div>

      </div>
    </div>
  );
}
