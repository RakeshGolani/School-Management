'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { getParentFeesAction } from '@/actions/parent/feeActions';
import ParentFeesSkeleton from '@/components/skeletons/parent/ParentFeesSkeleton';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Receipt,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  Calendar,
  DollarSign,
  ShieldCheck,
  Building,
  Info,
  Check,
  ChevronRight,
  Printer
} from 'lucide-react';

export default function ParentFeesClient({ initialData }) {
  const { activeChild } = useParentChild();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filter states
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch fees data on active ward change
  useEffect(() => {
    if (!activeChild?.id) return;

    let isMounted = true;
    setLoading(true);

    startTransition(async () => {
      try {
        const res = await getParentFeesAction({
          studentId: activeChild.id
        });

        if (isMounted) {
          if (res?.success && res.data) {
            setData(res.data);
          } else {
            notifyError(res?.message || 'Failed to retrieve fee records');
          }
        }
      } catch (err) {
        if (isMounted) {
          notifyError(err.message || 'Error connecting to institutional server');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeChild?.id]);

  const handleRefresh = async () => {
    if (!activeChild?.id || fetching) return;
    setFetching(true);
    try {
      const res = await getParentFeesAction({
        studentId: activeChild.id
      });
      if (res?.success && res.data) {
        setData(res.data);
        notifySuccess('Fee accounts & payment ledgers refreshed');
      } else {
        notifyError(res?.message || 'Failed to refresh fee records');
      }
    } catch (err) {
      notifyError(err.message || 'Failed to refresh fee records');
    } finally {
      setFetching(false);
    }
  };

  const studentInfo = data?.student_info || activeChild;
  const childFullName = studentInfo?.name || 
    (studentInfo?.first_name ? `${studentInfo.first_name} ${studentInfo.last_name || ''}`.trim() : 'Ward');

  const summary = data?.summary || {
    total_allocated: 0,
    total_paid: 0,
    total_discount: 0,
    total_pending: 0,
    has_overdue: false,
    cleared_percentage: 100
  };
  const invoices = data?.invoices || [];

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatusFilter]);

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter =
      selectedStatusFilter === 'ALL' ||
      (selectedStatusFilter === 'PAID' && inv.status === 'PAID') ||
      (selectedStatusFilter === 'PARTIALLY_PAID' && inv.status === 'PARTIALLY_PAID') ||
      (selectedStatusFilter === 'UNPAID' && (inv.status === 'UNPAID' || inv.status === 'UPCOMING'));

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (inv.invoice_number && inv.invoice_number.toLowerCase().includes(term)) ||
      (inv.latest_payment?.receipt_number && inv.latest_payment.receipt_number.toLowerCase().includes(term)) ||
      (inv.term && inv.term.toLowerCase().includes(term)) ||
      (inv.category_name && inv.category_name.toLowerCase().includes(term)) ||
      (inv.description && inv.description.toLowerCase().includes(term)) ||
      (inv.status && inv.status.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  const totalRecords = filteredInvoices.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Status Filter Tabs
  const filterTabs = [
    { key: 'ALL', label: 'All Invoices', count: invoices.length },
    { key: 'PAID', label: 'Cleared / Paid', count: invoices.filter((i) => i.status === 'PAID').length },
    { key: 'PARTIALLY_PAID', label: 'Partially Paid', count: invoices.filter((i) => i.status === 'PARTIALLY_PAID').length },
    { key: 'UNPAID', label: 'Pending Dues', count: invoices.filter((i) => i.status === 'UNPAID' || i.status === 'UPCOMING').length }
  ];

  // DataTable columns
  const columns = [
    {
      header: 'Fee Item & Invoice',
      accessor: 'term',
      className: 'w-[30%]',
      render: (row) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200/60 flex items-center justify-center text-primary-700 font-bold shrink-0 shadow-2xs">
            <Receipt size={18} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">
              {row.term || row.category_name || 'Monthly Tuition Fee'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded border border-primary-200/50">
                {row.latest_payment?.receipt_number || row.invoice_number}
              </span>
              {row.academic_year && (
                <span className="text-[10px] text-slate-400 font-medium">
                  • {row.academic_year}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Allocated & Paid',
      accessor: 'amount',
      className: 'w-[20%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-900">
            ₹ {Number(row.amount).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">Paid: ₹ {Number(row.paid_amount || 0).toLocaleString('en-IN')}</span>
            {Number(row.discount_amount) > 0 && (
              <span className="text-amber-600">• Disc: ₹ {Number(row.discount_amount).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Due Date & Timeline',
      accessor: 'due_date',
      className: 'w-[18%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" />
            <span>{row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible'}</span>
          </div>
          {row.latest_payment?.payment_date ? (
            <div className="text-[10px] text-emerald-700 font-medium">
              Last paid: {new Date(row.latest_payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 font-medium">
              Pending payment
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      className: 'w-[16%]',
      render: (row) => {
        if (row.status === 'PAID') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>Paid</span>
            </span>
          );
        }
        if (row.status === 'PARTIALLY_PAID') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <Clock size={12} className="text-amber-600" />
              <span>Partially Paid</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <AlertCircle size={12} className="text-rose-600" />
            <span>Pending</span>
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'w-[16%] text-right',
      render: (row) => {
        const hasPayment = row.status === 'PAID' || row.status === 'PARTIALLY_PAID' || Number(row.paid_amount || 0) > 0;
        return (
          <div className="flex items-center justify-end gap-2">
            {hasPayment && (
              <Tooltip content="Print Official Receipt" variant="default">
                <Link
                  href={`/parent/fees/invoices/${row.id}/print`}
                  target="_blank"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 text-slate-600 hover:text-primary-700 transition cursor-pointer shadow-2xs inline-flex items-center justify-center"
                >
                  <Printer size={15} />
                </Link>
              </Tooltip>
            )}

            <Tooltip content="View Invoice & Details" variant="default">
              <Link
                href={`/parent/fees/invoices/${row.id}`}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-2xs inline-flex items-center justify-center"
              >
                <FileText size={15} />
              </Link>
            </Tooltip>
          </div>
        );
      }
    }
  ];

  if (loading && !data) {
    return <ParentFeesSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 1. Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-primary-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-100/80 text-primary-800 border border-primary-200/60 inline-flex items-center gap-1">
              <Sparkles size={11} className="text-primary-600" />
              <span>Institutional Accounts & Finance</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Fee Matrix & Invoices
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Review academic term allocations, smart bus transit subscriptions, verified payment receipts, and instant settlement history for {childFullName}.
          </p>
        </div>

        {/* Right Action Header Card */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Outstanding
            </span>
            <div className="text-xl sm:text-2xl font-black text-primary-600">
              ₹ {Number(summary.total_pending).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              {summary.total_pending === 0 ? '✓ All Dues Cleared' : `${summary.cleared_percentage}% Cleared`}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-primary-600 shadow-2xs transition flex items-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw size={15} className={fetching ? 'animate-spin text-primary-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Allocated */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-primary-300 transition-colors">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
            Total Allocated
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹ {Number(summary.total_allocated).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">All Term Fees</span>
        </div>

        {/* Total Paid */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-emerald-300 transition-colors">
          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
            Total Paid
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            ₹ {Number(summary.total_paid).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">{summary.cleared_percentage}% Institutional Settled</span>
        </div>

        {/* Scholarships / Discounts */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-amber-300 transition-colors">
          <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
            Scholarship & Concession
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            ₹ {Number(summary.total_discount).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Applied Fee Waivers</span>
        </div>

        {/* Net Pending Dues */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-rose-300 transition-colors">
          <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider block">
            Pending Balance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            ₹ {Number(summary.total_pending).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {summary.has_overdue ? '⚠ Overdue Warning' : 'Active Term Invoices'}
          </span>
        </div>
      </div>

      {/* 3. Filter Controls & DataTable */}
      <div className="space-y-3.5">
        {/* Filter Controls Bar */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-2xs space-y-3 border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Status Filter Pills */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
              {filterTabs.map((tab) => {
                const isSelected = selectedStatusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-primary-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-primary-50 text-primary-700 font-black' : 'bg-slate-200 text-slate-600 font-bold'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search invoice number or fee name..."
                  className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 4. DataTable in Card Wrapper */}
        <Card
          title={`Invoices & Allocations (${totalRecords})`}
          subtitle={`Showing official fee invoices and settlement ledgers for ${childFullName}`}
          icon={Receipt}
        >
          <DataTable
            columns={columns}
            data={paginatedInvoices}
            loading={loading}
            emptyIcon={Receipt}
            emptyMessage="No fee invoices match the selected status or query."
            pagination={{
              currentPage,
              pageSize,
              totalRecords,
              totalPages,
              onPageChange: (p) => setCurrentPage(p),
              onPageSizeChange: (s) => {
                setPageSize(s);
                setCurrentPage(1);
              }
            }}
          />
        </Card>
      </div>

    </div>
  );
}
