'use client';
import { Database } from 'lucide-react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

/**
 * Reusable Data Table Component with Pagination, Empty States, and Loading Skeletons
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  skeletonRow: SkeletonRow,
  skeletonRows = 5,
  emptyMessage = "No records found.",
  emptyIcon: EmptyIcon = Database,
  pagination = null
}) {
  return (
    <div className="w-full">
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-3 px-4 ${col.className || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: skeletonRows }).map((_, i) => (
                SkeletonRow ? <SkeletonRow key={i} /> : (
                  <tr key={i} className="border-b border-slate-100">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`py-3 px-4 ${col.className || ''}`}>
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-full max-w-[100px]" />
                      </td>
                    ))}
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <EmptyIcon size={36} className="mx-auto text-slate-400" />
          <p className="text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-3 px-4 ${col.className || ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-slate-50/80 transition duration-150 border-b border-slate-100">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3 px-4 ${col.className || ''}`}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📄 Pagination Bar */}
      {!loading && data.length > 0 && pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs">
          <div className="text-slate-500">
            Showing <span className="font-bold text-slate-900">{pagination.totalRecords === 0 ? 0 : Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalRecords)}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.totalRecords}</span> entries
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-32">
              <Select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                options={(pagination.pageSizeOptions || [5, 10, 25, 50]).map((size) => 
                  typeof size === 'object' ? size : { label: `${size} per page`, value: size }
                )}
                searchable={false}
                clearable={false}
              />
            </div>

            <Button
              variant="secondary"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(Math.max(pagination.currentPage - 1, 1))}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    pagination.currentPage === pageNum
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(Math.min(pagination.currentPage + 1, pagination.totalPages))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
