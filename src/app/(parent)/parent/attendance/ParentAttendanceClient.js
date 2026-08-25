'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { getParentAttendanceAction } from '@/actions/parent/attendanceActions';
import ParentAttendanceSkeleton from '@/components/skeletons/parent/ParentAttendanceSkeleton';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Tooltip from '@/components/ui/Tooltip';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Radio, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  Search, 
  X, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building, 
  FileText, 
  User,
  Info,
  AlertCircle
} from 'lucide-react';

export default function ParentAttendanceClient({ initialData }) {
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

  // Month / Year state (Default to ALL or current year)
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Fetch attendance data whenever active ward or month changes
  useEffect(() => {
    if (!activeChild?.id) return;

    let isMounted = true;
    setLoading(true);

    const monthParam = selectedMonth !== 'ALL' ? selectedMonth : undefined;
    const yearParam = selectedMonth !== 'ALL' ? '2026' : undefined;

    getParentAttendanceAction({
      studentId: activeChild.id,
      month: monthParam,
      year: yearParam
    })
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching ward attendance:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeChild?.id, selectedMonth]);

  const handleRefresh = () => {
    if (!activeChild?.id) return;
    setFetching(true);
    startTransition(async () => {
      try {
        const monthParam = selectedMonth !== 'ALL' ? selectedMonth : undefined;
        const yearParam = selectedMonth !== 'ALL' ? '2026' : undefined;

        const res = await getParentAttendanceAction({
          studentId: activeChild.id,
          month: monthParam,
          year: yearParam
        });

        if (res.success && res.data) {
          setData(res.data);
          notifySuccess('Ward attendance records updated');
        } else {
          notifyError(res.message || 'Failed to refresh attendance');
        }
      } catch (err) {
        console.error('Error refreshing attendance:', err);
        notifyError('Failed to refresh attendance');
      } finally {
        setFetching(false);
      }
    });
  };

  const studentInfo = data?.student_info || activeChild;
  const stats = data?.stats || {
    attendance_rate: '100.0%',
    total_school_days: 0,
    present_days: 0,
    absent_days: 0,
    late_days: 0,
    leave_days: 0,
    nfc_scans_count: 0
  };
  const logs = data?.logs || [];

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatusFilter, selectedMonth]);

  // Filtered attendance logs
  const filteredLogs = logs.filter((l) => {
    const matchesFilter =
      selectedStatusFilter === 'ALL' ||
      (selectedStatusFilter === 'PRESENT' && l.status === 'PRESENT') ||
      (selectedStatusFilter === 'LATE' && l.status === 'LATE') ||
      (selectedStatusFilter === 'ABSENT' && l.status === 'ABSENT') ||
      (selectedStatusFilter === 'LEAVE' && l.status === 'LEAVE');

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (l.date && l.date.toLowerCase().includes(term)) ||
      (l.day && l.day.toLowerCase().includes(term)) ||
      (l.gate_reader && l.gate_reader.toLowerCase().includes(term)) ||
      (l.remarks && l.remarks.toLowerCase().includes(term)) ||
      (l.status && l.status.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  const totalRecords = filteredLogs.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filter tab definitions
  const filterTabs = [
    { key: 'ALL', label: 'All Sessions', count: logs.length },
    { key: 'PRESENT', label: 'Present', count: logs.filter((l) => l.status === 'PRESENT').length },
    { key: 'LATE', label: 'Late Arrivals', count: logs.filter((l) => l.status === 'LATE').length },
    { key: 'ABSENT', label: 'Absences', count: logs.filter((l) => l.status === 'ABSENT').length },
    { key: 'LEAVE', label: 'Excused Leaves', count: logs.filter((l) => l.status === 'LEAVE').length }
  ];

  // Month selector options
  const monthOptions = [
    { key: 'ALL', label: 'All Months (Academic Year)' },
    { key: '08', label: 'August 2026' },
    { key: '07', label: 'July 2026' },
    { key: '06', label: 'June 2026' }
  ];

  // DataTable columns for Ward Attendance
  const columns = [
    {
      header: 'Date & Day',
      accessor: 'date',
      className: 'w-[18%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
            <span>{row.date}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <span className="uppercase text-slate-400 font-bold">{row.day}</span>
            <span>•</span>
            <span className="text-primary-700 font-medium">Session Recorded</span>
          </div>
        </div>
      )
    },
    {
      header: 'Roll Call Status',
      accessor: 'status',
      className: 'w-[16%]',
      render: (row) => {
        if (row.status === 'PRESENT') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>Present</span>
            </span>
          );
        }
        if (row.status === 'LATE') {
          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <Clock size={12} className="text-amber-600" />
                <span>Late Arrival</span>
              </span>
              {row.late_reason && (
                <div className="text-[10px] text-amber-700 font-medium truncate max-w-[140px]" title={row.late_reason}>
                  {row.late_reason}
                </div>
              )}
            </div>
          );
        }
        if (row.status === 'LEAVE') {
          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                <FileText size={12} className="text-blue-600" />
                <span>Excused Leave</span>
              </span>
              {row.leave_details?.reason && (
                <div className="text-[10px] text-blue-700 font-medium truncate max-w-[140px]" title={row.leave_details.reason}>
                  {row.leave_details.reason}
                </div>
              )}
            </div>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <XCircle size={12} className="text-rose-600" />
            <span>Unexcused Absent</span>
          </span>
        );
      }
    },
    {
      header: 'Campus Gate In (NFC)',
      accessor: 'in_time',
      className: 'w-[18%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-black text-emerald-800 flex items-center gap-1">
            <ArrowUpRight size={13} className="text-emerald-600 shrink-0" />
            <span>{row.in_time}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[150px]">
            {row.gate_reader}
          </span>
        </div>
      )
    },
    {
      header: 'Campus Gate Out (NFC)',
      accessor: 'out_time',
      className: 'w-[18%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-black text-blue-800 flex items-center gap-1">
            <ArrowDownRight size={13} className="text-blue-600 shrink-0" />
            <span>{row.out_time}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {row.status === 'PRESENT' || row.status === 'LATE' ? 'Campus Gate 1 Reader' : '--'}
          </span>
        </div>
      )
    },
    {
      header: 'Verified Class Teacher',
      accessor: 'class_teacher',
      className: 'w-[18%]',
      render: (row) => (
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 font-black text-xs flex items-center justify-center shrink-0 border border-primary-200/60 shadow-2xs">
            {row.class_teacher?.initial || 'T'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {row.class_teacher?.name || 'Class Teacher'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              Verified & Marked
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Verification & Details',
      accessor: 'method',
      className: 'w-[12%]',
      render: (row) => (
        <div>
          {row.is_nfc_verified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs">
              <Radio size={10} className="text-emerald-600" />
              <span>NFC Verified</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">
              Manual Roll
            </span>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <ParentAttendanceSkeleton />;
  }

  const wardDisplayName = studentInfo?.first_name 
    ? `${studentInfo.first_name} ${studentInfo.last_name || ''}`.trim()
    : studentInfo?.name || 'My Ward';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-24 sm:pb-8">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary-50 text-primary-700 border border-primary-200/60">
              <CalendarCheck size={13} className="text-primary-600" /> Ward NFC & Attendance History
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800">
              <UserCheck size={12} className="text-slate-600" /> Ward: {wardDisplayName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            NFC Gate Swipes & Attendance Matrix
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review real-time NFC school entry/exit timestamps, verified late arrivals, and class roll call logs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-primary-50 via-white to-primary-50/40 border border-primary-200/80 text-right min-w-[140px] shadow-2xs">
            <div className="text-xl sm:text-2xl font-black text-primary-600 leading-none">
              {stats.attendance_rate || '100.0%'}
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
              Term Attendance Rate
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-primary-600 shadow-2xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1 text-xs font-bold"
            title="Refresh Attendance"
          >
            <RefreshCw size={14} className={fetching ? 'animate-spin text-primary-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Four Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Present Card */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-emerald-300 transition-colors">
          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
            Present Days
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats.present_days}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">On-Time Sessions</span>
        </div>

        {/* Absent Card */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-rose-300 transition-colors">
          <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider block">
            Absent Days
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {stats.absent_days}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Unexcused Misses</span>
        </div>

        {/* Late Arrivals Card */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-amber-300 transition-colors">
          <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
            Late Arrivals
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats.late_days}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Gate 2 Late Desks</span>
        </div>

        {/* Total School Days Card */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-blue-300 transition-colors">
          <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider block">
            Total Sessions
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">
            {stats.total_school_days}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Recorded Days</span>
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

            {/* Month Filter & Search Box */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              {/* Month Dropdown */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition cursor-pointer"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Search Box */}
              <div className="relative w-full sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search date or remarks..."
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
          title="Daily Telemetry & Roll Call Logs"
          icon={CalendarCheck}
          subtitle={`Detailed NFC gate entry/exit timestamps and teacher verification for ${wardDisplayName}.`}
        >
          <DataTable
            columns={columns}
            data={paginatedLogs}
            loading={fetching}
            emptyMessage="No attendance logs recorded for the selected filter."
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
  );
}
