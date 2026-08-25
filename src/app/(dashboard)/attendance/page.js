'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  UserCheck, 
  UserX, 
  Save, 
  Sparkles,
  Search,
  RotateCcw,
  FileText,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import Tooltip from '@/components/ui/Tooltip';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  getAttendanceAction, 
  saveBulkAttendanceAction, 
  getAttendanceSummaryAction 
} from '@/actions/school/attendanceActions';
import { getClassesAction } from '@/actions/school/classActions';
import { useAcademicYear } from '@/context/AcademicYearContext';
import SchoolAttendanceSkeleton from '@/components/skeletons/school/SchoolAttendanceSkeleton';

// Dedicated in-table row skeleton for smooth table transitions
const AttendanceTableRowSkeleton = () => (
  <tr className="border-b border-slate-100 animate-pulse">
    <td className="py-4 px-4 w-[5%] text-center">
      <div className="h-4 w-5 bg-slate-200 rounded mx-auto" />
    </td>
    <td className="py-4 px-4 w-[30%]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-200 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-36 bg-slate-200 rounded-lg" />
          <div className="h-3 w-48 bg-slate-100 rounded" />
        </div>
      </div>
    </td>
    <td className="py-4 px-4 w-[20%]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
        <div className="space-y-1 flex-1">
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>
      </div>
    </td>
    <td className="py-4 px-4 w-[16%]">
      <div className="h-7 w-28 bg-slate-100 rounded-xl border border-slate-200/60" />
    </td>
    <td className="py-4 px-4 w-[29%]">
      <div className="h-9 w-60 bg-slate-200 rounded-xl" />
    </td>
  </tr>
);

export default function AttendancePage() {
  const { activeYear } = useAcademicYear();

  // Filters & Control States
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' | 'STAFF'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic class options
  const [classesList, setClassesList] = useState([]);

  // Data States
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Client-side pagination state for DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch available classes for current school
  const fetchClasses = useCallback(async () => {
    try {
      const res = await getClassesAction();
      if (res && res.success && Array.isArray(res.data)) {
        setClassesList(res.data);
      }
    } catch (err) {
      console.warn('Could not load classes list:', err);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Fetch Attendance Records
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAttendanceAction({
        date: selectedDate,
        entity_type: activeTab,
        class_name: activeTab === 'STUDENT' ? selectedClass : '',
        section: activeTab === 'STUDENT' ? selectedSection : '',
        academic_year_id: activeYear?.id
      });

      if (res && res.success && res.data) {
        setRecords(res.data.records || []);
        if (res.data.summary) {
          setSummary(prev => ({ ...prev, [activeTab.toLowerCase()]: res.data.summary }));
        }
        if (Array.isArray(res.data.classes) && res.data.classes.length > 0) {
          setClassesList(res.data.classes);
        }
      } else {
        setRecords([]);
      }

      // Fetch Summary Stats
      const summaryRes = await getAttendanceSummaryAction(selectedDate, activeYear?.id);
      if (summaryRes && summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
      notifyError('Failed to load attendance records');
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [activeTab, selectedDate, selectedClass, selectedSection, activeYear?.id]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, selectedDate, selectedClass, selectedSection]);

  // Bulk Status Toggler (e.g. Mark All Present / Absent)
  const handleMarkAll = (statusToSet) => {
    setRecords(prev => prev.map(rec => ({ ...rec, status: statusToSet, status_display: statusToSet.toUpperCase() })));
    notifySuccess(`All ${activeTab === 'STUDENT' ? 'Students' : 'Faculty'} marked as '${statusToSet.toUpperCase()}'. Click 'Save Attendance' to persist.`);
  };

  // Change individual record status
  const handleStatusChange = (id, newStatus) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id !== id) return rec;
      let defaultRemark = rec.remarks || '';
      if (newStatus === 'leave' && !defaultRemark) {
        defaultRemark = rec.leave_details?.reason || 'Approved Leave';
      }
      return { 
        ...rec, 
        status: newStatus, 
        status_display: newStatus.toUpperCase(),
        remarks: defaultRemark
      };
    }));
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (records.length === 0) return;
    setSaving(true);
    try {
      const res = await saveBulkAttendanceAction({
        date: selectedDate,
        entity_type: activeTab,
        class_name: activeTab === 'STUDENT' ? selectedClass : '',
        section: activeTab === 'STUDENT' ? selectedSection : '',
        academic_year_id: activeYear?.id,
        records: records.map(r => ({
          id: r.id,
          status: r.status,
          remarks: r.remarks,
          class_name: r.class_name,
          section: r.section
        }))
      });

      if (res && res.success) {
        notifySuccess('Attendance saved and updated in database successfully!');
        fetchAttendance();
      } else {
        notifyError(res?.message || 'Failed to save attendance');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      notifyError('Network error while saving attendance');
    } finally {
      setSaving(false);
    }
  };

  // Filtered records by search query
  const filteredRecords = records.filter(r => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (r.name && r.name.toLowerCase().includes(term)) ||
      (r.roll_number && r.roll_number.toLowerCase().includes(term)) ||
      (r.admission_number && r.admission_number.toLowerCase().includes(term)) ||
      (r.employee_id && r.employee_id.toLowerCase().includes(term)) ||
      (r.class_name && r.class_name.toLowerCase().includes(term)) ||
      (r.department && r.department.toLowerCase().includes(term))
    );
  });

  // Client pagination
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Dynamic Class Options for Filter
  const uniqueClassNames = Array.from(new Set(classesList.map(c => c.class_name))).filter(Boolean);
  const classOptions = [
    { value: 'all', label: 'All Classes / Grades' },
    ...uniqueClassNames.map(cn => ({ value: cn, label: cn }))
  ];

  // Dynamic Section Options
  const sectionOptions = [
    { value: 'all', label: 'All Sections' },
    { value: 'A', label: 'Section A' },
    { value: 'B', label: 'Section B' },
    { value: 'C', label: 'Section C' },
    { value: 'D', label: 'Section D' }
  ];

  // Current Active Summary metrics
  const activeSummary = activeTab === 'STUDENT' 
    ? (summary?.students || { total: records.length, present: 0, absent: 0, late: 0, leave: 0, attendance_rate: 100 })
    : (summary?.staff || { total: records.length, present: 0, absent: 0, late: 0, leave: 0, attendance_rate: 100 });

  // Columns definition for DataTable
  const columns = [
    {
      header: '#',
      accessor: 'index',
      className: 'w-[5%] text-center',
      render: (row, idx) => {
        const itemIdx = typeof idx === 'number' ? idx : paginatedRecords.indexOf(row);
        return (
          <span className="font-mono text-xs font-bold text-slate-400">
            {(currentPage - 1) * pageSize + (itemIdx >= 0 ? itemIdx : 0) + 1}
          </span>
        );
      }
    },
    {
      header: activeTab === 'STUDENT' ? 'Student Details' : 'Faculty Member',
      accessor: 'name',
      className: 'w-[30%]',
      render: (row) => {
        const photo = row.image_url || row.photo;
        const initial = row.initial || row.name?.charAt(0).toUpperCase() || 'U';

        return (
          <div className="flex items-center space-x-3.5">
            <div className="relative w-10 h-10 rounded-2xl bg-primary-50 border-2 border-primary-500/30 text-primary-700 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              <span className="select-none">{initial}</span>
              {photo && (
                <img
                  src={photo}
                  alt={row.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              {/* Row 1: Student Name + Gender Badge */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm truncate">
                  {row.name}
                </span>
                {row.gender && (
                  <span className="text-[11px] select-none">
                    {row.gender === 'male' ? '👨' : '👩'}
                  </span>
                )}
              </div>

              {/* Row 2 & 3: Grade/Roll and Admission Details */}
              {activeTab === 'STUDENT' ? (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200/70 text-[10px]">
                      {row.class_name} - {row.section}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary-50 text-primary-700 font-mono font-bold text-[10px] border border-primary-500/25">
                      Roll #{row.roll_number}
                    </span>
                  </div>
                  {row.admission_number && (
                    <div className="text-[10px] font-mono text-slate-400 font-semibold">
                      Adm No: <span className="text-slate-600 font-bold">{row.admission_number}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200/70 text-[10px]">
                      {row.department || 'Faculty'}
                    </span>
                  </div>
                  {row.employee_id && (
                    <div className="text-[10px] font-mono text-slate-400 font-semibold">
                      Emp ID: <span className="text-slate-600 font-bold">{row.employee_id}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: activeTab === 'STUDENT' ? 'Class Teacher' : 'Faculty Role',
      accessor: 'class_teacher',
      className: 'w-[20%]',
      render: (row) => {
        if (activeTab === 'STUDENT') {
          const ct = row.class_teacher;
          if (!ct) {
            return (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-50 text-slate-400 font-semibold text-xs border border-slate-200/60">
                Unassigned
              </span>
            );
          }

          return (
            <div className="flex items-center space-x-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-primary-50 border border-primary-500/30 text-primary-700 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                <span className="select-none">{ct.initial || 'T'}</span>
                {ct.photo && (
                  <img
                    src={ct.photo}
                    alt={ct.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate">
                  {ct.name}
                </div>
                <span className="text-[10px] text-primary-700 font-bold block">
                  Class Teacher
                </span>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-0.5">
            <div className="font-bold text-slate-800 text-xs">
              {row.department || 'General Faculty'}
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">
              Teaching Staff
            </span>
          </div>
        );
      }
    },
    {
      header: 'Arrival & RFID Scan',
      accessor: 'check_in',
      className: 'w-[16%]',
      render: (row) => {
        const hasTime = Boolean(row.check_in && row.check_in !== '--:--');
        const isLate = row.status === 'late';

        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border transition ${
            isLate
              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
              : hasTime
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
              : 'bg-slate-50 text-slate-400 border-slate-200/60'
          }`}>
            <Clock size={12} className={isLate ? 'text-amber-600' : hasTime ? 'text-emerald-600' : 'text-slate-400'} />
            <span>{row.check_in || '--:--'}</span>
          </div>
        );
      }
    },
    {
      header: 'Attendance Status Action',
      accessor: 'status',
      className: 'w-[29%]',
      render: (row) => {
        const currentStatus = (row.status || 'present').toLowerCase();
        const isLate = currentStatus === 'late';
        const isLeave = currentStatus === 'leave' || currentStatus === 'excused';

        return (
          <div className="space-y-2 py-1">
            {/* Status Segmented Buttons */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl w-fit shadow-2xs">
              <button
                type="button"
                onClick={() => handleStatusChange(row.id, 'present')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  currentStatus === 'present'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Present
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(row.id, 'late')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  isLate
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Late
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(row.id, 'absent')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  currentStatus === 'absent'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Absent
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(row.id, 'leave')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  isLeave
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Leave
              </button>
            </div>

            {/* Remark Display under Leave */}
            {isLeave && (() => {
              const rawText = row.remarks || row.leave_details?.reason || '';
              const cleanReason = rawText.replace(/^Approved Leave(?:\s*\([^)]*\))?:\s*/i, '').trim();
              if (!cleanReason) return null;

              return (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-blue-50/90 border border-blue-200/80 shadow-2xs w-[245px] max-w-[245px] animate-fadeIn">
                  <div className="w-5 h-5 rounded-md bg-blue-200/80 text-blue-800 flex items-center justify-center shrink-0">
                    <FileText size={11} />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="text-[10px] font-black uppercase tracking-wider text-blue-900 leading-none mb-0.5">
                      Approved Leave
                    </div>
                    <Tooltip content={cleanReason} position="top">
                      <p className="text-xs font-semibold text-slate-800 truncate block cursor-pointer hover:text-blue-700 transition">
                        "{cleanReason}"
                      </p>
                    </Tooltip>
                  </div>
                </div>
              );
            })()}

            {/* Remark Display under Late */}
            {isLate && (() => {
              const rawText = row.remarks || '';
              const cleanReason = rawText.replace(/^Late(?:\s*\([^)]*\))?:\s*/i, '').trim() || 'Arrived after morning schedule';

              return (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 shadow-2xs w-[245px] max-w-[245px] animate-fadeIn">
                  <div className="w-5 h-5 rounded-md bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock size={11} />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-900 leading-none mb-0.5">
                      Late Arrival
                    </div>
                    <Tooltip content={cleanReason} position="top">
                      <p className="text-xs font-semibold text-slate-800 truncate block cursor-pointer hover:text-amber-700 transition">
                        "{cleanReason}"
                      </p>
                    </Tooltip>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }
    }
  ];

  // Full page skeleton on initial visit
  if (!initialLoaded && loading) {
    return <SchoolAttendanceSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border border-slate-200/80 p-6 sm:p-7 rounded-3xl shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary-100 text-primary-700">
            <Sparkles size={12} className="text-primary-600 shrink-0" />
            <span>Institutional Attendance Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Attendance Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Real-time verified daily logs, NFC gate scan telemetry, and bulk attendance submissions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button 
            type="button"
            onClick={fetchAttendance} 
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin text-primary-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>
          <button 
            type="button"
            onClick={handleSaveAttendance} 
            disabled={saving || loading || records.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black text-xs transition shadow-md shadow-primary-600/25 active:scale-95 cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'Saving Records...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* 2. Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Strength */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Total {activeTab === 'STUDENT' ? 'Students' : 'Faculty'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeSummary?.total || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium block">
            {activeTab === 'STUDENT' ? 'Enrolled Strength' : 'Active Staff'}
          </span>
        </div>

        {/* Present Today */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {activeSummary?.present || 0}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold block">
            Verified In Campus
          </span>
        </div>

        {/* Late Arrivals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Late Arrivals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {activeSummary?.late || 0}
          </div>
          <span className="text-[11px] text-amber-700 font-bold block">
            Post Schedule Entry
          </span>
        </div>

        {/* Absent */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Absent
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {activeSummary?.absent || 0}
          </div>
          <span className="text-[11px] text-rose-700 font-bold block">
            Unexcused Absentees
          </span>
        </div>

        {/* Attendance Rate */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Turnout Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary-600">
            {activeSummary?.attendance_rate || 100}%
          </div>
          <span className="text-[11px] text-primary-700 font-bold block">
            Overall Ratio
          </span>
        </div>
      </div>

      {/* 3. Main Data Card with Tabs, Filters & Reusable DataTable */}
      <Card
        title={activeTab === 'STUDENT' ? 'Student Attendance Roster' : 'Faculty Attendance Roster'}
        icon={activeTab === 'STUDENT' ? GraduationCap : Users}
        subtitle={`Live verified telemetry records for ${new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
      >
        <div className="space-y-5">
          {/* Tabs & Bulk Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('STUDENT')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === 'STUDENT'
                    ? 'bg-white text-primary-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎓 Student Attendance
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('STAFF')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeTab === 'STAFF'
                    ? 'bg-white text-primary-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👨‍🏫 Faculty Attendance
              </button>
            </div>

            {/* Quick Bulk Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => handleMarkAll('present')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Mark All Present</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleMarkAll('absent')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 transition active:scale-95 cursor-pointer shadow-2xs"
              >
                <XCircle size={13} className="text-rose-600" />
                <span>Mark All Absent</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Attendance Date
              </label>
              <DatePicker 
                value={selectedDate}
                onChange={(e) => {
                  if (e?.target?.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                disableFuture={true}
                clearable={false}
                required={true}
                placeholder="Select date"
                className="w-full"
              />
            </div>

            {activeTab === 'STUDENT' && (
              <>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Class / Grade
                  </label>
                  <Select
                    options={classOptions}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    searchable={true}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Section
                  </label>
                  <Select
                    options={sectionOptions}
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Search Roster
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full h-10 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition"
                />
              </div>
            </div>
          </div>

          {/* Reusable DataTable Component with custom table row skeleton */}
          <DataTable
            columns={columns}
            data={paginatedRecords}
            loading={loading}
            skeletonRow={AttendanceTableRowSkeleton}
            skeletonRows={5}
            emptyMessage={`No ${activeTab === 'STUDENT' ? 'student' : 'faculty'} attendance records found for this date.`}
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
        </div>
      </Card>
    </div>
  );
}
