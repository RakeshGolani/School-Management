'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays, 
  Search, 
  RefreshCw, 
  Sparkles, 
  Filter, 
  GraduationCap,
  MessageSquare,
  Building,
  UserCheck,
  Check,
  XCircle,
  Eye,
  PhoneCall
} from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';
import SchoolReviewLeaveModal from './SchoolReviewLeaveModal';
import { getSchoolLeavesAction, reviewSchoolLeaveAction } from '@/actions/school/leaveActions';

export default function SchoolLeavesClient({ initialData }) {
  const [data, setData] = useState(initialData?.data || { leaves: [], stats: {}, classes: [] });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters state
  const [selectedClass, setSelectedClass] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [searchTerm, setSearchTerm] = useState('');

  // Review Modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state (Rule 1)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeaves = async (classId = selectedClass, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await getSchoolLeavesAction({
        classId: classId === 'all' ? undefined : classId,
        status: status === 'ALL' ? undefined : status,
        search: searchTerm || undefined
      });
      if (res.success && res.data) {
        setData(res.data);
      } else {
        showToast(res.message || 'Failed to fetch student leaves', 'error');
      }
    } catch (err) {
      showToast('Network error while refreshing leaves', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (leave) => {
    setSelectedLeave(leave);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (leaveId, payload) => {
    setActionLoading(true);
    try {
      const res = await reviewSchoolLeaveAction(leaveId, payload);
      if (res.success) {
        showToast(`Leave application marked as ${payload.status} successfully by School Administration!`, 'success');
        setReviewModalOpen(false);
        setSelectedLeave(null);
        await fetchLeaves();
      } else {
        showToast(res.message || 'Failed to update leave status', 'error');
      }
    } catch (err) {
      showToast('Error reviewing leave application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter options for classes dropdown (Rule 2)
  const classOptions = useMemo(() => {
    const raw = data.classes || [];
    return [
      { value: 'all', label: '🏫 All Classes & Sections' },
      ...raw.map(c => ({ value: String(c.value), label: c.label }))
    ];
  }, [data.classes]);

  // Client-side filtering for live search
  const filteredLeaves = useMemo(() => {
    let list = data.leaves || [];

    if (selectedClass !== 'all') {
      list = list.filter(l => String(l.class_id) === String(selectedClass));
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(l => l.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(l => 
        l.student_name?.toLowerCase().includes(q) ||
        l.admission_number?.toLowerCase().includes(q) ||
        l.class_name?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q) ||
        l.leave_type_label?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data.leaves, selectedClass, statusFilter, searchTerm]);

  // Reset pagination on filter change (Rule 1)
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, statusFilter, searchTerm]);

  // Pagination calculation (Rule 1)
  const totalRecords = filteredLeaves.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeaves.slice(start, start + pageSize);
  }, [filteredLeaves, currentPage, pageSize]);

  const stats = data.stats || {};

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <Check size={12} className="stroke-[3]" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <XCircle size={12} className="stroke-[2.5]" />
            <span>REJECTED</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <Clock size={12} className="stroke-[2.5]" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  // Columns definition for DataTable (Rule 1)
  const columns = [
    {
      header: 'Student & Admission',
      accessor: 'student',
      render: (row) => {
        const initial = (row.student_name || 'S').trim().charAt(0).toUpperCase();
        return (
          <div className="flex items-center space-x-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-500/25 flex items-center justify-center text-primary-700 font-black text-sm shrink-0 overflow-hidden relative shadow-2xs">
              <span>{initial}</span>
              {row.student_image_url || (row.student_photo && (row.student_photo.startsWith('/') || row.student_photo.startsWith('http'))) ? (
                <img 
                  src={row.student_image_url || row.student_photo} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {row.student_name}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                <span className="font-mono font-bold text-primary-700">{row.admission_number}</span>
                {row.roll_number && row.roll_number !== '--' && (
                  <>
                    <span>•</span>
                    <span>Roll #{row.roll_number}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Class & Section',
      accessor: 'class_name',
      render: (row) => (
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-black text-slate-900">
            <GraduationCap size={13} className="text-primary-600" />
            <span>{row.class_name}</span>
          </span>
          {row.room_number && row.room_number !== '--' && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Room: {row.room_number}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Category & Duration',
      accessor: 'leave_type',
      className: 'min-w-[190px]',
      render: (row) => (
        <div className="space-y-1.5">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80">
              {row.leave_type_label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 whitespace-nowrap">
            <CalendarDays size={13} className="text-primary-600 shrink-0" />
            <span>{row.start_date_formatted}</span>
            <span className="text-slate-400 font-light">→</span>
            <span>{row.end_date_formatted}</span>
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-black text-[10px]">
            {row.days_count} {row.days_count === 1 ? 'Day' : 'Days'} Duration
          </span>
        </div>
      )
    },
    {
      header: 'Reason & Contact',
      accessor: 'dates',
      className: 'min-w-[260px] max-w-[340px]',
      render: (row) => (
        <div className="space-y-1.5">
          <Tooltip content={row.reason} position="top" maxWidth="max-w-sm" className="w-full">
            <div className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-xs text-slate-700 font-medium leading-relaxed italic break-words break-all cursor-help transition-colors">
              "{row.reason}"
            </div>
          </Tooltip>
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
            <span>Applied: <strong className="text-slate-600 font-semibold">{row.applied_on || '--'}</strong></span>
            {row.emergency_contact && row.emergency_contact !== '--' && (
              <span className="font-mono text-slate-600 flex items-center gap-1">
                <PhoneCall size={10} className="text-slate-400" />
                <span>{row.emergency_contact}</span>
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Reviewer & Status',
      accessor: 'status',
      render: (row) => (
        <div className="space-y-1.5 min-w-[210px]">
          <div>{renderStatusBadge(row.status)}</div>

          {row.status === 'PENDING' ? (
            <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <Clock size={11} className="shrink-0" />
              <span>Awaiting Review</span>
            </p>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] space-y-1 shadow-2xs">
              {/* Reviewer Tag */}
              <div className="flex items-center gap-1.5 font-bold">
                {row.reviewed_by_role === 'SCHOOL_ADMIN' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase tracking-wide">
                    <Building size={11} className="text-purple-600" />
                    <span>School Administration</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary-800 border border-primary-200 text-[10px] font-black uppercase tracking-wide">
                    <GraduationCap size={11} className="text-primary-600" />
                    <span>{row.reviewer_name || 'Class Teacher'}</span>
                  </span>
                )}
              </div>

              {/* Feedback remarks */}
              {row.teacher_remarks && (
                <p className="text-slate-700 italic font-medium leading-tight line-clamp-2 pt-0.5">
                  "{row.teacher_remarks}"
                </p>
              )}

              {/* Timestamp */}
              {row.reviewed_on_formatted && (
                <div className="text-[10px] font-mono text-slate-400 pt-0.5 border-t border-slate-200/50">
                  {row.reviewed_on_formatted}
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip text={row.status === 'PENDING' ? 'Review & Decide' : 'Override / Update Status'} position="left">
            <button
              onClick={() => handleOpenReview(row)}
              className="p-2 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white transition duration-200 cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5 font-bold text-xs"
            >
              <UserCheck size={14} />
              <span className="hidden sm:inline">Review</span>
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[110] px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 animate-fadeIn ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} className="text-rose-600 shrink-0" /> : <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* 🌟 1. Page Header & Light Soft Banner (Rule 3) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/70 border border-primary-200/60 text-primary-800 text-[11px] font-black uppercase tracking-wider">
              <Sparkles size={12} className="text-primary-600" />
              <span>Institutional Oversight</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Student Leave Management & Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Oversee, approve, or reject student leave requests across all classes and academic sections.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchLeaves()}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px]"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-primary-600' : 'text-slate-500'} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 2. Telemetry Stat Showcase Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Applications */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Applications</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.total ?? 0}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block">Institutional Log</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs shrink-0">
            <FileText size={22} />
          </div>
        </div>

        {/* Stat 2: Pending Action */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">Pending Action</span>
            <div className="text-2xl font-black text-amber-700 font-mono">
              {stats.pending ?? 0}
            </div>
            <span className="text-[10px] text-amber-600/90 font-semibold block">Requires Review</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs shrink-0 border border-amber-100">
            <Clock size={22} />
          </div>
        </div>

        {/* Stat 3: Approved */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Approved Leaves</span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {stats.approved ?? 0}
            </div>
            <span className="text-[10px] text-emerald-600/90 font-semibold block">
              {stats.total_days_approved ?? 0} Total Days Authorized
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0 border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Stat 4: Rejected */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">Declined / Rejected</span>
            <div className="text-2xl font-black text-rose-700 font-mono">
              {stats.rejected ?? 0}
            </div>
            <span className="text-[10px] text-rose-600/90 font-semibold block">Denied by Authority</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs shrink-0 border border-rose-100">
            <AlertCircle size={22} />
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Bar (Searchable Class Select, Status Filter, Search Bar) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Class Select (Rule 2 Searchable Select) */}
          <div className="md:col-span-4">
            <Select
              value={selectedClass}
              onChange={(e) => {
                const val = e?.target ? e.target.value : e;
                setSelectedClass(val || 'all');
              }}
              options={classOptions}
              searchable={true}
              placeholder="Filter by Class & Section"
            />
          </div>

          {/* Status Tabs */}
          <div className="md:col-span-4 flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 overflow-x-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap text-center ${
                  statusFilter === st
                    ? 'bg-white text-primary-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Live Search Input */}
          <div className="md:col-span-4 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student, admission, reason..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition font-medium min-h-[42px]"
            />
          </div>

        </div>
      </div>

      {/* 🌟 4. Reusable DataTable Wrapped inside Card (Rule 1) */}
      <Card
        title="Institutional Leave Applications"
        icon={Building}
        subtitle={`Showing ${filteredLeaves.length} student leave logs`}
      >
        <DataTable
          columns={columns}
          data={paginatedData}
          loading={loading}
          emptyMessage="No student leave requests found for the selected criteria."
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            totalPages,
            onPageChange: setCurrentPage,
            onPageSizeChange: (newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }
          }}
        />
      </Card>

      {/* Review Modal */}
      {selectedLeave && (
        <SchoolReviewLeaveModal
          isOpen={reviewModalOpen}
          leave={selectedLeave}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedLeave(null);
          }}
          onSubmit={handleReviewSubmit}
          loading={actionLoading}
        />
      )}

    </div>
  );
}
