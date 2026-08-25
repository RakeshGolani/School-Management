'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  FileText, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Search, 
  X, 
  User, 
  PhoneCall, 
  Sparkles, 
  ShieldCheck, 
  MessageSquareQuote,
  Building,
  CalendarCheck
} from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import StudentApplyLeaveDrawer from './StudentApplyLeaveDrawer';
import { getStudentLeavesAction, applyStudentLeaveAction } from '@/actions/student/leaveActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function StudentLeavesClient({ initialUser, initialData }) {
  const [data, setData] = useState(initialData);
  const [fetching, setFetching] = useState(false);
  const [applying, setApplying] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const leaves = data?.leaves || [];
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0, total_days_approved: 0 };
  const classTeacher = data?.class_teacher;
  const studentInfo = initialUser;

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

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  const handleRefresh = () => {
    setFetching(true);
    startTransition(async () => {
      try {
        const res = await getStudentLeavesAction();
        if (res.success && res.data) {
          setData(res.data);
          notifySuccess('Leave applications refreshed');
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

  const handleApplyLeave = async (formData) => {
    setApplying(true);
    try {
      const res = await applyStudentLeaveAction(formData);
      if (res.success) {
        notifySuccess('Leave application submitted to Class Teacher!');
        setDrawerOpen(false);
        // Refresh data
        const fresh = await getStudentLeavesAction();
        if (fresh.success && fresh.data) {
          setData(fresh.data);
        }
      } else {
        notifyError(res.message || 'Failed to submit leave');
      }
    } catch (err) {
      console.error('Error applying leave:', err);
      notifyError('Failed to submit leave application');
    } finally {
      setApplying(false);
    }
  };

  // Filtered leaves
  const filteredLeaves = leaves.filter(l => {
    const matchesFilter = selectedFilter === 'ALL' || l.status === selectedFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (l.leave_type_label && l.leave_type_label.toLowerCase().includes(term)) ||
      (l.reason && l.reason.toLowerCase().includes(term)) ||
      (l.start_date_formatted && l.start_date_formatted.toLowerCase().includes(term)) ||
      (l.teacher_remarks && l.teacher_remarks.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  const totalRecords = filteredLeaves.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const filterTabs = [
    { key: 'ALL', label: 'All Applications', count: leaves.length },
    { key: 'PENDING', label: 'Pending Review', count: stats.pending || 0 },
    { key: 'APPROVED', label: 'Approved', count: stats.approved || 0 },
    { key: 'REJECTED', label: 'Rejected', count: stats.rejected || 0 }
  ];

  // Helper for leave type icon and color
  const getLeaveTypePill = (type, label) => {
    const map = {
      sick: 'bg-rose-50 text-rose-800 border-rose-200/70',
      casual: 'bg-amber-50 text-amber-800 border-amber-200/70',
      medical: 'bg-indigo-50 text-indigo-800 border-indigo-200/70',
      vacation: 'bg-cyan-50 text-cyan-800 border-cyan-200/70',
      other: 'bg-slate-50 text-slate-800 border-slate-200/70'
    };
    const style = map[type] || map.other;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black border shadow-2xs ${style}`}>
        <span>{label || 'Leave'}</span>
      </span>
    );
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>APPROVED</span>
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <AlertCircle size={13} className="text-rose-600" />
          <span>REJECTED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs animate-pulse">
        <Clock size={13} className="text-amber-600" />
        <span>PENDING REVIEW</span>
      </span>
    );
  };

  // DataTable columns
  const columns = [
    {
      header: 'Category & Applied',
      accessor: 'leave_type',
      className: 'min-w-[170px]',
      render: (row) => (
        <div className="space-y-1.5">
          <div>{getLeaveTypePill(row.leave_type, row.leave_type_label)}</div>
          <p className="text-[10px] text-slate-400 font-medium pl-0.5">
            Applied: <span className="font-bold text-slate-600">{row.applied_on || '--'}</span>
          </p>
        </div>
      )
    },
    {
      header: 'Dates & Duration',
      accessor: 'start_date',
      className: 'min-w-[190px]',
      render: (row) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 whitespace-nowrap">
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
      header: 'Reason for Leave',
      accessor: 'reason',
      className: 'min-w-[260px] max-w-[340px]',
      render: (row) => (
        <div className="space-y-1.5">
          <Tooltip content={row.reason} position="top" maxWidth="max-w-sm" className="w-full">
            <div className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-xs text-slate-700 font-medium leading-relaxed italic break-words break-all cursor-help transition-colors">
              "{row.reason}"
            </div>
          </Tooltip>
          {row.emergency_contact && row.emergency_contact !== '--' && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pl-0.5">
              <PhoneCall size={10} className="text-slate-400" />
              <span>Contact: <strong className="text-slate-600">{row.emergency_contact}</strong></span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Reviewer & Status',
      accessor: 'status',
      className: 'min-w-[220px]',
      render: (row) => (
        <div className="space-y-1.5">
          <div>{getStatusBadge(row.status)}</div>

          {row.status === 'PENDING' ? (
            <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <Clock size={11} className="shrink-0" />
              <span>Awaiting Teacher Decision</span>
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
                    <User size={11} className="text-primary-600" />
                    <span>{row.reviewer_name || classTeacher?.name || 'Class Teacher'}</span>
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
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-24 sm:pb-8">
      
      {/* 1. Mobile-Specific Compact App Header (< sm) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 border border-slate-100 space-y-2.5 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-700">
            <FileText size={11} className="text-primary-600 shrink-0" />
            <span>Leave Management</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              disabled={fetching}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50 min-w-[30px] min-h-[30px] flex items-center justify-center"
              title="Refresh Leaves"
            >
              <RefreshCw size={13} className={fetching ? 'animate-spin text-primary-600' : ''} />
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-primary-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-primary-700 transition cursor-pointer"
            >
              <Plus size={13} />
              <span>Apply</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 leading-tight truncate">
              My Leave Requests
            </h1>
            <p className="text-[11px] text-slate-500 font-bold truncate mt-0.5">
              {stats.approved} Approved • {stats.pending} Pending Review
            </p>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/70 shadow-2xs text-center shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-700 block">
              {stats.total_days_approved || 0} Days
            </span>
            <span className="text-[9px] text-slate-400 font-bold block">Approved</span>
          </div>
        </div>
      </div>

      {/* 1b. Desktop / Tablet Header Banner (>= sm) */}
      <div className="hidden sm:flex p-6 md:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 items-center justify-between gap-4 border border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700">
            <FileText size={12} className="text-primary-600 shrink-0" />
            <span>Student Leave Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
            My Leave Applications & Review Status
          </h1>
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
            {classTeacher && (
              <>
                <span className="font-bold text-slate-900">
                  Class Teacher: {classTeacher.name}
                </span>
                <span className="text-slate-300">•</span>
              </>
            )}
            <span>Total Applied: {stats.total}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">{stats.approved} Approved ({stats.total_days_approved || 0} Total Days)</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-bold">{stats.pending} Pending Review</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px] whitespace-nowrap"
          >
            <RefreshCw size={14} className={fetching ? 'animate-spin text-primary-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-black shadow-md shadow-primary-600/25 hover:shadow-lg hover:shadow-primary-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap min-h-[42px] active:scale-95"
          >
            <Plus size={16} className="shrink-0 stroke-[2.5]" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Showcase Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Card 1: Total Applied */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-xs">
              <FileText size={15} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-none">
              {stats.total}
            </div>
            <p className="text-[11px] text-slate-500 font-bold mt-1">Applications</p>
          </div>
        </div>

        {/* Card 2: Approved Leaves */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 size={15} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Verified</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono leading-none">
              {stats.approved}
            </div>
            <p className="text-[11px] text-emerald-800 font-bold mt-1">
              Approved ({stats.total_days_approved || 0} Days)
            </p>
          </div>
        </div>

        {/* Card 3: Pending Review */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Clock size={15} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Under Review</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono leading-none">
              {stats.pending}
            </div>
            <p className="text-[11px] text-amber-800 font-bold mt-1">Pending Teacher Action</p>
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              <AlertCircle size={15} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Declined</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono leading-none">
              {stats.rejected}
            </div>
            <p className="text-[11px] text-rose-800 font-bold mt-1">Rejected Requests</p>
          </div>
        </div>

      </div>

      {/* 3. Leave Applications History & Table */}
      <div className="space-y-3.5">
        {/* Filter Pills & Search Bar */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-xs space-y-3 border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="p-1 bg-slate-100/90 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
              {filterTabs.map(tab => {
                const isSelected = selectedFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by category, reason, remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/60 rounded-xl py-2 pl-8 pr-7 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Cards View (< md) */}
        <div className="block md:hidden space-y-3">
          {filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 space-y-3 transition"
            >
              {/* Row 1: Type & Status */}
              <div className="flex items-center justify-between gap-2">
                <div>{getLeaveTypePill(leave.leave_type, leave.leave_type_label)}</div>
                <div>{getStatusBadge(leave.status)}</div>
              </div>

              {/* Row 2: Date Range */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <CalendarDays size={13} className="text-primary-600 shrink-0" />
                  <span>{leave.start_date_formatted}</span>
                  <span className="text-slate-400">→</span>
                  <span>{leave.end_date_formatted}</span>
                </div>

                <span className="font-mono font-black text-[10px] text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200/50">
                  {leave.days_count} {leave.days_count === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              {/* Row 3: Reason */}
              <div className="text-xs text-slate-700 font-medium leading-relaxed">
                <span className="font-bold text-slate-900 block text-[11px] mb-0.5">Reason:</span>
                {leave.reason}
              </div>

              {/* Row 4: Teacher Remarks Note (if reviewed) */}
              {leave.teacher_remarks && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <MessageSquareQuote size={12} />
                    <span>{leave.reviewed_by_role === 'SCHOOL_ADMIN' ? 'School Administration Feedback:' : (leave.reviewer_name ? `${leave.reviewer_name} Feedback:` : 'Class Teacher Feedback:')}</span>
                  </span>
                  <p className="italic font-medium leading-tight">{leave.teacher_remarks}</p>
                </div>
              )}

              {/* Row 5: Footer details */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Applied: {leave.applied_on}</span>
                {leave.reviewed_on_formatted && (
                  <span>Reviewed: {leave.reviewed_on_formatted}</span>
                )}
              </div>
            </div>
          ))}

          {filteredLeaves.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl shadow-xs border border-slate-100">
              No leave applications found matching selected filter.
            </div>
          )}
        </div>

        {/* Desktop / Web Table View (Rule 1: Reusable DataTable Component) */}
        <div className="hidden md:block">
          <Card
            title="Leave Applications & Approval Logs"
            subtitle={`Records submitted to Class Teacher (${totalRecords} Total Entries)`}
            icon={FileText}
          >
            <DataTable
              columns={columns}
              data={paginatedLeaves}
              loading={fetching}
              emptyMessage="No leave applications submitted yet. Click 'Apply for Leave' to create one."
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
        </div>
      </div>

      {/* 4. Slide-Over Apply Leave Drawer (Rule 10) */}
      <StudentApplyLeaveDrawer
        isOpen={drawerOpen}
        onClose={() => !applying && setDrawerOpen(false)}
        onSubmit={handleApplyLeave}
        loading={applying}
        classTeacher={classTeacher}
        studentInfo={studentInfo}
      />

    </div>
  );
}
