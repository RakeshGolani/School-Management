'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Award,
  Radio,
  Search,
  RefreshCw,
  X,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingUp,
  School,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { getStudentAttendanceAction } from '@/actions/student/attendanceActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function StudentAttendanceClient({ initialUser, initialData }) {
  const [data, setData] = useState(initialData);
  const [logs, setLogs] = useState(initialData?.logs || []);
  const [stats, setStats] = useState(initialData?.stats || {
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    late_days: 0,
    leave_days: 0,
    percentage: '100.0',
    tier: 'Excellent Attendance Tier'
  });

  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Client-side pagination state for DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const studentInfo = data?.student_info || initialUser;

  // Refresh attendance data
  const handleRefresh = () => {
    setFetching(true);
    startTransition(async () => {
      try {
        const res = await getStudentAttendanceAction();
        if (res.success && res.data) {
          setData(res.data);
          setLogs(res.data.logs || []);
          setStats(res.data.stats || stats);
          notifySuccess('Attendance telemetry updated');
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

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatusFilter]);

  // Filter logs
  const filteredLogs = logs.filter(l => {
    const matchesStatus = selectedStatusFilter === 'ALL' || l.status === selectedStatusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      (l.date && l.date.toLowerCase().includes(term)) ||
      (l.status && l.status.toLowerCase().includes(term)) ||
      (l.remarks && l.remarks.toLowerCase().includes(term)) ||
      (l.gate && l.gate.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  // Client pagination
  const totalRecords = filteredLogs.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const percentageNum = Number(stats.percentage || 100);

  // Status pills
  const statusFilterTabs = [
    { key: 'ALL', label: 'All Logs', count: logs.length },
    { key: 'PRESENT', label: 'Present', count: stats.present_days },
    { key: 'LATE', label: 'Late', count: stats.late_days },
    { key: 'ABSENT', label: 'Absent', count: stats.absent_days },
    { key: 'LEAVE', label: 'Leave', count: stats.leave_days || 0 }
  ];

  // DataTable columns
  const columns = [
    {
      header: 'Date & Day',
      accessor: 'date',
      className: 'w-[22%]',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-500/20 text-primary-700 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {row.day || 'Day'}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
              {row.date}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {row.raw_date}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Attendance Status',
      accessor: 'status',
      className: 'w-[18%]',
      render: (row) => {
        if (row.status === 'PRESENT') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>PRESENT</span>
            </span>
          );
        }
        if (row.status === 'LATE') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200/60 shadow-2xs">
              <Clock size={12} className="text-amber-600" />
              <span>LATE</span>
            </span>
          );
        }
        if (row.status === 'LEAVE') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
              <FileText size={12} className="text-blue-600" />
              <span>LEAVE</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs">
            <XCircle size={12} className="text-rose-600" />
            <span>ABSENT</span>
          </span>
        );
      }
    },
    {
      header: 'Arrival Time',
      accessor: 'in_time',
      className: 'w-[16%]',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 font-mono text-xs font-bold border border-slate-200/60">
          <Clock size={12} className="text-primary-600 shrink-0" />
          <span>{row.in_time}</span>
        </div>
      )
    },
    {
      header: 'Marked / Approved By',
      accessor: 'teacher',
      className: 'w-[22%]',
      render: (row) => {
        const isLeave = row.status === 'LEAVE' || /approved leave|leave/i.test(row.remarks || '');

        if (isLeave) {
          const isSchool = row.leave_details?.reviewer_type === 'school' || /admin|school/i.test(row.remarks || '');
          const reviewerName = row.leave_details?.reviewer_name || (isSchool ? 'School Administration' : (row.teacher?.name || 'Class Teacher'));
          const reviewerPhoto = isSchool ? null : (row.leave_details?.reviewer_photo || row.teacher?.image_url || row.teacher?.photo);

          if (isSchool) {
            return (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
                  <School size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {reviewerName}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-extrabold">
                    <ShieldCheck size={11} className="text-purple-600" />
                    <span>Approved by School</span>
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center space-x-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-primary-100 text-primary-700 font-black text-xs flex items-center justify-center shrink-0 border border-primary-200/60 shadow-2xs overflow-hidden">
                <span className="select-none">{reviewerName?.charAt(0).toUpperCase() || 'T'}</span>
                {reviewerPhoto && (
                  <img
                    src={reviewerPhoto}
                    alt={reviewerName}
                    className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate">
                  {reviewerName}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-extrabold">
                  <UserCheck size={11} className="text-emerald-600" />
                  <span>Approved by Teacher</span>
                </span>
              </div>
            </div>
          );
        }

        const teacherPhoto = row.teacher?.image_url || row.teacher?.photo;
        return (
          <div className="flex items-center space-x-2.5">
            <div className="relative w-8 h-8 rounded-xl bg-primary-100 text-primary-700 font-black text-xs flex items-center justify-center shrink-0 border border-primary-200/60 shadow-2xs overflow-hidden">
              <span className="select-none">{row.teacher?.initial || 'T'}</span>
              {teacherPhoto && (
                <img
                  src={teacherPhoto}
                  alt={row.teacher?.name || 'Teacher'}
                  className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs truncate">
                {row.teacher?.name || 'Class Teacher'}
              </div>
              <span className="text-[10px] text-primary-700 font-bold block">
                {row.teacher?.role || 'Class Teacher'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Notes & Leave Details',
      accessor: 'remarks',
      className: 'w-[24%]',
      render: (row) => {
        const isLeave = row.status === 'LEAVE' || /approved leave|leave/i.test(row.remarks || '');

        if (isLeave) {
          const ld = row.leave_details;
          const cleanReason = ld?.reason || (row.remarks ? row.remarks.replace(/^Approved Leave(?:\s*\([^)]*\))?:\s*/i, '').trim() : 'Approved Student Leave');
          const leaveType = ld?.leave_type || 'Approved Leave';
          const reviewerNotes = ld?.reviewer_notes;

          return (
            <div className="space-y-1 py-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100/90 px-2 py-0.5 rounded-md border border-blue-200/60">
                  <FileText size={10} />
                  <span>{leaveType}</span>
                </span>
              </div>

              {cleanReason && (
                <Tooltip content={cleanReason} position="top">
                  <p className="text-xs text-slate-800 font-semibold truncate max-w-xs cursor-pointer hover:text-primary-600 transition">
                    "{cleanReason}"
                  </p>
                </Tooltip>
              )}

              {reviewerNotes && (
                <Tooltip content={`Reviewer Note: ${reviewerNotes}`} position="top">
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/70 max-w-xs truncate cursor-pointer">
                    <MessageSquare size={10} className="text-slate-400 shrink-0" />
                    <span className="truncate">{reviewerNotes}</span>
                  </div>
                </Tooltip>
              )}
            </div>
          );
        }

        if (row.remarks) {
          return (
            <Tooltip content={row.remarks} position="top">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60 text-xs font-semibold max-w-xs truncate cursor-pointer">
                <span className="font-bold">Note:</span>
                <span className="truncate">{row.remarks}</span>
              </span>
            </Tooltip>
          );
        }

        return <span className="text-slate-300 text-xs select-none">—</span>;
      }
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-24 sm:pb-8">
      
      {/* 1. Mobile-Specific Compact App Header (< sm) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 border border-slate-100 space-y-2.5 sm:hidden">
        {/* Row 1: Tag pill + 1-Touch Refresh */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-700">
            <CalendarCheck size={11} className="text-primary-600 shrink-0" />
            <span>Attendance Telemetry</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50 min-w-[30px] min-h-[30px] flex items-center justify-center"
            title="Refresh Attendance"
          >
            <RefreshCw size={13} className={fetching ? 'animate-spin text-primary-600' : ''} />
          </button>
        </div>

        {/* Row 2: Title & Class on left, Score pill on right */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 leading-tight">
              My Attendance
            </h1>
            <p className="text-[11px] text-slate-500 font-bold truncate mt-0.5">
              {studentInfo?.class ? `${studentInfo.class} • Roll #${studentInfo.roll_number || '01'}` : 'Class Record'}
            </p>
          </div>

          {/* Right Score Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs text-center shrink-0">
            <div className={`text-base font-black leading-none ${
              percentageNum >= 90 ? 'text-emerald-600' :
              percentageNum >= 75 ? 'text-primary-600' : 'text-rose-600'
            }`}>
              {stats.percentage}%
            </div>
            <span className="text-[9px] text-slate-400 font-bold block leading-tight mt-0.5">
              {percentageNum >= 90 ? 'Excellent' : percentageNum >= 75 ? 'Good' : 'Needs Attn'}
            </span>
          </div>
        </div>
      </div>

      {/* 1b. Desktop / Tablet Header Banner (>= sm) */}
      <div className="hidden sm:flex p-6 md:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 items-center justify-between gap-4 border border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700">
            <CalendarCheck size={12} className="text-primary-600 shrink-0" />
            <span>Attendance Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            My Attendance Meter
          </h1>
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
            {studentInfo?.class && (
              <>
                <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">
                  {studentInfo.class}
                </span>
                <span className="text-slate-300">•</span>
              </>
            )}
            <span>Roll #{studentInfo?.roll_number || '01'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-primary-700 font-bold">{stats.total_days} Total Recorded Days</span>
          </div>
        </div>

        {/* Right Metric Pill & Refresh Action */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200/70 shadow-2xs text-left sm:text-right">
            <div className={`text-xl sm:text-2xl font-black leading-tight ${
              percentageNum >= 90 ? 'text-emerald-600' :
              percentageNum >= 75 ? 'text-primary-600' : 'text-rose-600'
            }`}>
              {stats.percentage}%
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">
              {stats.tier}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50 min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="Refresh Attendance"
          >
            <RefreshCw size={16} className={fetching ? 'animate-spin text-primary-600' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Present Card */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-emerald-200/70 shadow-xs flex flex-col justify-between space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Present</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={12} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-600 leading-none">
            {stats.present_days}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Days on time</span>
        </div>

        {/* Late Card */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-amber-200/70 shadow-xs flex flex-col justify-between space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-800">Late</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={12} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-600 leading-none">
            {stats.late_days}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Delayed arrivals</span>
        </div>

        {/* Absent Card */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-rose-200/70 shadow-xs flex flex-col justify-between space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-800">Absent</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={12} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-rose-600 leading-none">
            {stats.absent_days}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Missed sessions</span>
        </div>

        {/* Total Recorded Days */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-primary-200/70 shadow-xs flex flex-col justify-between space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-primary-800">Total Days</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <CalendarCheck size={12} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-primary-600 leading-none">
            {stats.total_days}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Session records</span>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-xs space-y-3 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="p-1 bg-slate-100/90 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
            {statusFilterTabs.map(tab => {
              const isSelected = selectedStatusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatusFilter(tab.key)}
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

          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by date, status, remarks..."
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

      {/* 4. Mobile Cards View (Only on Narrow Mobile Screens: < md) */}
      <div className="block md:hidden space-y-3">
        {filteredLogs.map((log) => {
          const isPresent = log.status === 'PRESENT';
          const isLate = log.status === 'LATE';
          const isLeave = log.status === 'LEAVE';

          return (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 space-y-2.5 transition"
            >
              {/* Row 1: Date & Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                    {log.day || 'Day'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                      {log.date}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.raw_date}
                    </span>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  isPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                  isLate ? 'bg-amber-50 text-amber-800 border border-amber-200/60' :
                  isLeave ? 'bg-blue-50 text-blue-700 border border-blue-200/60' :
                  'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}>
                  {isPresent && <CheckCircle2 size={10} />}
                  {isLate && <Clock size={10} />}
                  {isLeave && <FileText size={10} />}
                  {!isPresent && !isLate && !isLeave && <XCircle size={10} />}
                  <span>{log.status}</span>
                </span>
              </div>

              {/* Row 2: In Time & Teacher Details */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 font-mono text-slate-700 font-bold">
                  <Clock size={12} className="text-primary-600 shrink-0" />
                  <span>{log.in_time}</span>
                </div>

                <div className="flex items-center space-x-1.5 min-w-0">
                  <div className="relative w-5 h-5 rounded-md bg-primary-100 text-primary-700 font-black text-[10px] flex items-center justify-center shrink-0 overflow-hidden">
                    <span className="select-none">{log.teacher?.initial || 'T'}</span>
                    {(log.teacher?.image_url || log.teacher?.photo) && (
                      <img
                        src={log.teacher.image_url || log.teacher.photo}
                        alt={log.teacher.name || 'Teacher'}
                        className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {log.teacher?.name || 'Class Teacher'}
                  </span>
                </div>
              </div>

              {/* Row 3: Remarks if any */}
              {log.remarks && (
                <div className="text-[11px] text-slate-600 bg-amber-50/60 border border-amber-200/40 p-2 rounded-lg">
                  <span className="font-bold text-amber-800">Note: </span>
                  <span>{log.remarks}</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl shadow-xs border border-slate-100">
            No attendance records found matching criteria.
          </div>
        )}
      </div>

      {/* 5. Desktop / Web Table View (Rule 1: Reusable DataTable Component wrapped in Card with Pagination) */}
      <div className="hidden md:block">
        <Card
          title="Attendance Log History"
          subtitle={`Verified logs & telemetry records (${totalRecords} Total Entries)`}
          icon={CalendarCheck}
        >
          <DataTable
            columns={columns}
            data={paginatedLogs}
            loading={fetching}
            emptyMessage="No attendance logs found for this period."
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
