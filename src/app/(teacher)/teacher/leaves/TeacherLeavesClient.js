'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  FileText, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  X, 
  User, 
  Edit3,
  Sparkles, 
  ShieldCheck, 
  MessageSquareQuote,
  GraduationCap,
  Building,
  UserCheck,
  Check,
  XCircle,
  PhoneCall
} from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Tooltip from '@/components/ui/Tooltip';
import TeacherReviewLeaveModal from './TeacherReviewLeaveModal';
import { getTeacherStudentLeavesAction, reviewStudentLeaveAction } from '@/actions/teacher/leaveActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function TeacherLeavesClient({ initialUser, initialData }) {
  const [data, setData] = useState(initialData);
  const [fetching, setFetching] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const leaves = data?.leaves || [];
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const managedClasses = data?.managed_classes || [];
  const isClassTeacher = data?.is_class_teacher;

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Reset pagination on filter change (Rule 1)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  const handleRefresh = () => {
    setFetching(true);
    startTransition(async () => {
      try {
        const res = await getTeacherStudentLeavesAction();
        if (res.success && res.data) {
          setData(res.data);
          notifySuccess('Leave queue updated');
        } else {
          notifyError(res.message || 'Failed to refresh leaves');
        }
      } catch (err) {
        console.error('Error refreshing leaves:', err);
        notifyError('Failed to refresh leaves');
      } finally {
        setFetching(false);
      }
    });
  };

  const handleReviewSubmit = async (leaveId, payload) => {
    setReviewing(true);
    try {
      const res = await reviewStudentLeaveAction(leaveId, payload);
      if (res.success) {
        notifySuccess(`Leave application marked as ${payload.status}!`);
        setModalOpen(false);
        setSelectedLeave(null);
        // Refresh data
        const fresh = await getTeacherStudentLeavesAction();
        if (fresh.success && fresh.data) {
          setData(fresh.data);
        }
      } else {
        notifyError(res.message || 'Failed to review leave application');
      }
    } catch (err) {
      console.error('Error reviewing leave:', err);
      notifyError('Failed to review leave application');
    } finally {
      setReviewing(false);
    }
  };

  const openReviewModal = (leave) => {
    setSelectedLeave(leave);
    setModalOpen(true);
  };

  // Filtered leaves
  const filteredLeaves = leaves.filter(l => {
    const matchesFilter = selectedFilter === 'ALL' || l.status === selectedFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (l.student_name && l.student_name.toLowerCase().includes(term)) ||
      (l.admission_number && l.admission_number.toLowerCase().includes(term)) ||
      (l.leave_type_label && l.leave_type_label.toLowerCase().includes(term)) ||
      (l.reviewer_name && l.reviewer_name.toLowerCase().includes(term)) ||
      (l.reason && l.reason.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  const totalRecords = filteredLeaves.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const filterTabs = [
    { key: 'ALL', label: 'All Requests', count: leaves.length },
    { key: 'PENDING', label: 'Pending Review', count: stats.pending || 0 },
    { key: 'APPROVED', label: 'Approved', count: stats.approved || 0 },
    { key: 'REJECTED', label: 'Rejected', count: stats.rejected || 0 }
  ];

  // Helper for leave type badge
  const getLeaveTypePill = (type, label) => {
    const map = {
      sick: 'bg-rose-50 text-rose-800 border-rose-200/80',
      casual: 'bg-amber-50 text-amber-800 border-amber-200/80',
      medical: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      vacation: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
      other: 'bg-slate-50 text-slate-800 border-slate-200/80'
    };
    const style = map[type] || map.other;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs ${style}`}>
        <span>{label || 'Leave'}</span>
      </span>
    );
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <Check size={12} className="stroke-[3]" />
          <span>APPROVED</span>
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <XCircle size={12} className="stroke-[2.5]" />
          <span>REJECTED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs animate-pulse">
        <Clock size={12} className="stroke-[2.5]" />
        <span>PENDING ACTION</span>
      </span>
    );
  };

  // DataTable columns (Rule 1: Reusable DataTable Component)
  const columns = [
    {
      header: 'Student & Classroom',
      accessor: 'student_name',
      render: (row) => {
        const initialChar = (row.student_name || 'S').trim().charAt(0).toUpperCase();
        return (
          <div className="flex items-center space-x-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-500/20 flex items-center justify-center text-primary-700 font-black text-xs shrink-0 overflow-hidden relative shadow-2xs">
              <span>{initialChar}</span>
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
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5 flex-wrap">
                <span className="font-mono font-bold text-primary-700">{row.admission_number}</span>
                <span>•</span>
                <span className="font-bold text-slate-700">{row.class_name}</span>
                {row.roll_number && row.roll_number !== '--' && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-600">Roll #{row.roll_number}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Category & Duration',
      accessor: 'leave_type',
      className: 'min-w-[190px]',
      render: (row) => (
        <div className="space-y-1.5">
          <div>{getLeaveTypePill(row.leave_type, row.leave_type_label)}</div>
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
      accessor: 'reason',
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
      className: 'min-w-[230px]',
      render: (row) => (
        <div className="space-y-1.5">
          <div>{getStatusBadge(row.status)}</div>

          {row.status === 'PENDING' ? (
            <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <Clock size={11} className="shrink-0" />
              <span>Awaiting Class Teacher Review</span>
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
                <p className="text-slate-700 italic font-medium leading-relaxed break-words break-all pt-0.5">
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
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end">
          <Tooltip 
            text={row.status === 'PENDING' ? 'Review & Decide' : 'Edit / Override Decision'} 
            position="left"
          >
            <button
              onClick={() => openReviewModal(row)}
              className={`px-3 py-2 rounded-xl border transition shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold active:scale-95 ${
                row.status === 'PENDING'
                  ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-500 shadow-primary-600/25'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-primary-500/50'
              }`}
            >
              <UserCheck size={14} className={row.status === 'PENDING' ? 'text-white' : 'text-primary-600'} />
              <span>{row.status === 'PENDING' ? 'Review' : 'Edit'}</span>
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-24 sm:pb-8">
      
      {/* 🌟 1. Header Banner (Rule 3) */}
      <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary-100/80 text-primary-800 border border-primary-200/60">
            <Sparkles size={12} className="text-primary-600 shrink-0" />
            <span>Class Teacher Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
            Student Leave Applications & Approvals
          </h1>
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5 font-medium">
            {managedClasses.length > 0 ? (
              <span className="font-bold text-slate-900">
                Assigned Class Teacher: {managedClasses.map(c => c.display).join(', ')}
              </span>
            ) : (
              <span className="text-slate-500">Class Leave Management</span>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-bold">{stats.pending || 0} Pending Action</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">{stats.approved || 0} Approved</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-primary-600 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px]"
          >
            <RefreshCw size={14} className={fetching ? 'animate-spin text-primary-600' : 'text-slate-500'} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. Telemetry Stat Showcase Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Received */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Requests</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.total || 0}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block">Class Submissions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs shrink-0">
            <FileText size={22} />
          </div>
        </div>

        {/* Card 2: Pending Action */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">Pending Action</span>
            <div className="text-2xl font-black text-amber-700 font-mono">
              {stats.pending || 0}
            </div>
            <span className="text-[10px] text-amber-600/90 font-semibold block">Requires Decision</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs shrink-0 border border-amber-100">
            <Clock size={22} />
          </div>
        </div>

        {/* Card 3: Approved */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Leaves Granted</span>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              {stats.approved || 0}
            </div>
            <span className="text-[10px] text-emerald-600/90 font-semibold block">Authorized Absence</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0 border border-emerald-100">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">Declined Requests</span>
            <div className="text-2xl font-black text-rose-700 font-mono">
              {stats.rejected || 0}
            </div>
            <span className="text-[10px] text-rose-600/90 font-semibold block">Denied by Authority</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs shrink-0 border border-rose-100">
            <AlertCircle size={22} />
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Bar (Filter Tabs + Search Bar) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedFilter(tab.key)}
                className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap text-center flex items-center gap-1.5 ${
                  selectedFilter === tab.key
                    ? 'bg-white text-primary-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                  selectedFilter === tab.key ? 'bg-primary-100 text-primary-800' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Live Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student, roll, category, reason..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition font-medium min-h-[42px]"
            />
          </div>

        </div>
      </div>

      {/* 🌟 4. Reusable DataTable Component (Rule 1) */}
      <Card
        title="Class Student Leave Applications"
        icon={FileText}
        subtitle={`Leave queue for your assigned class students (${totalRecords} Total Entries)`}
      >
        <DataTable
          columns={columns}
          data={paginatedLeaves}
          loading={fetching}
          emptyMessage="No student leave requests found for the selected criteria."
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            totalPages,
            onPageChange: (page) => setCurrentPage(page),
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            }
          }}
        />
      </Card>

      {/* Review Modal Component */}
      {selectedLeave && (
        <TeacherReviewLeaveModal
          isOpen={modalOpen}
          leave={selectedLeave}
          onClose={() => {
            setModalOpen(false);
            setSelectedLeave(null);
          }}
          onSubmit={handleReviewSubmit}
          loading={reviewing}
        />
      )}

    </div>
  );
}
