'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Users, 
  Sparkles, 
  Search, 
  CheckCheck, 
  Filter, 
  X, 
  GraduationCap, 
  Layers, 
  RefreshCw,
  School,
  Check,
  FileText
} from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/notify';
import { getTeacherAttendanceAction, saveTeacherAttendanceAction } from '@/actions/teacher/attendanceActions';
import TeacherAttendanceSkeleton from '@/components/skeletons/teacher/TeacherAttendanceSkeleton';
import DatePicker from '@/components/ui/DatePicker';
import Select from '@/components/ui/Select';

export default function TeacherAttendanceClient({ initialUser, initialAttendance, initialDate }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState(initialAttendance?.classes || []);
  const [selectedClassId, setSelectedClassId] = useState(
    initialAttendance?.selected_class?.id ? String(initialAttendance.selected_class.id) : ''
  );
  const [selectedClassInfo, setSelectedClassInfo] = useState(initialAttendance?.selected_class || null);
  const [students, setStudents] = useState(initialAttendance?.students || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fetching, setFetching] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [isPending, startTransition] = useTransition();

  const debounceTimers = useRef({});

  // Fetch updated attendance data when class or date changes
  const fetchAttendance = async (targetClassId, targetDate) => {
    setFetching(true);
    try {
      const res = await getTeacherAttendanceAction({
        classId: targetClassId || selectedClassId,
        date: targetDate || selectedDate
      });

      if (res.success && res.data) {
        setClasses(res.data.classes || []);
        setSelectedClassInfo(res.data.selected_class || null);
        if (res.data.selected_class?.id) {
          setSelectedClassId(String(res.data.selected_class.id));
        }
        setStudents(res.data.students || []);
        setSyncStatus('idle');
      } else {
        notifyError(res.message || 'Failed to load class attendance');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      notifyError('Failed to communicate with server');
    } finally {
      setFetching(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    startTransition(() => {
      fetchAttendance(selectedClassId, newDate);
    });
  };

  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    startTransition(() => {
      fetchAttendance(newClassId, selectedDate);
    });
  };

  // Auto-Save single student status & remarks immediately to backend
  const autoSaveStudent = async (studentId, status, remarks) => {
    if (!selectedClassInfo?.id) return;
    setSyncStatus('saving');
    try {
      const res = await saveTeacherAttendanceAction({
        classId: selectedClassInfo.id,
        date: selectedDate,
        records: [{
          id: studentId,
          status,
          remarks: remarks || ''
        }]
      });

      if (res.success) {
        setSyncStatus('saved');
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, is_marked: true } : s));
        setTimeout(() => {
          setSyncStatus('idle');
        }, 2000);
      } else {
        setSyncStatus('error');
        notifyError(res.message || 'Failed to auto-save attendance');
      }
    } catch (err) {
      console.error('Auto-save error:', err);
      setSyncStatus('error');
    }
  };

  // Instant status change with auto-save
  const handleStatusChange = (id, newStatus) => {
    const student = students.find(s => s.id === id);
    const remarks = student?.remarks || '';
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    autoSaveStudent(id, newStatus, remarks);
  };

  // Remarks change with debounced auto-save
  const handleRemarksChange = (id, newRemarks) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, remarks: newRemarks } : s));

    // Clear previous timer for this student
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }

    const currentStudent = students.find(s => s.id === id);
    const status = currentStudent?.status || 'LATE';

    // Debounce save by 600ms
    debounceTimers.current[id] = setTimeout(() => {
      autoSaveStudent(id, status, newRemarks);
    }, 600);
  };

  // Blur save immediately if user tabs out or clicks away
  const handleRemarksBlur = (id, remarks) => {
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    const currentStudent = students.find(s => s.id === id);
    autoSaveStudent(id, currentStudent?.status || 'LATE', remarks || '');
  };

  // Mark all present & bulk auto-save
  const handleMarkAllPresent = async () => {
    if (students.length === 0 || !selectedClassInfo?.id) return;

    const updated = students.map(s => ({ ...s, status: 'PRESENT', is_marked: true }));
    setStudents(updated);
    setSyncStatus('saving');

    try {
      const records = updated.map(s => ({
        id: s.id,
        status: 'PRESENT',
        remarks: s.remarks || ''
      }));

      const res = await saveTeacherAttendanceAction({
        classId: selectedClassInfo.id,
        date: selectedDate,
        records
      });

      if (res.success) {
        setSyncStatus('saved');
        notifySuccess('All students marked as Present & auto-saved!');
        setTimeout(() => {
          setSyncStatus('idle');
        }, 2000);
      } else {
        setSyncStatus('error');
        notifyError(res.message || 'Failed to save attendance');
      }
    } catch (err) {
      console.error('Mark all error:', err);
      setSyncStatus('error');
      notifyError('Failed to auto-save roster');
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = !term || 
                        (s.name && s.name.toLowerCase().includes(term)) || 
                        (s.roll && String(s.roll).toLowerCase().includes(term)) || 
                        (s.adm && s.adm.toLowerCase().includes(term)) ||
                        (s.remarks && s.remarks.toLowerCase().includes(term));
    const matchFilter = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchFilter;
  });

  // Calculate dynamic live metrics from local state
  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const lateCount = students.filter(s => s.status === 'LATE').length;
  const excusedCount = students.filter(s => s.status === 'EXCUSED').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Class options for Select component
  const classOptions = classes.map(c => ({
    value: String(c.id),
    label: `${c.class_name} - Sec ${c.section} ${c.is_class_teacher ? '★ (Class Teacher)' : ''}`
  }));

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-16 sm:pb-0">
      
      {/* 1. Header Banner & Live Sync Status */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700">
            <Sparkles size={12} className="text-primary-600 shrink-0" />
            <span>Faculty Attendance Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Daily Attendance Roll Call
          </h1>
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
            {selectedClassInfo ? (
              <>
                <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">
                  {selectedClassInfo.class_name} - Section {selectedClassInfo.section}
                </span>
                <span className="text-slate-300">•</span>
                <span>{selectedClassInfo.room_number || 'Main Classroom'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-primary-700 font-bold">{students.length} Total Students</span>
              </>
            ) : (
              <span className="text-slate-500 font-medium">No class assigned or available</span>
            )}
          </div>
        </div>

        {/* Date Selector, Class Selector & Live Auto-Sync Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Class Dropdown if multiple classes exist */}
          {classes.length > 1 && (
            <div className="w-full sm:w-60">
              <Select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                options={classOptions}
                placeholder="Select Class"
                size="md"
              />
            </div>
          )}

          {/* Date Picker */}
          <div className="w-full sm:w-52">
            <DatePicker
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              placeholder="Select date"
              align="left"
              disableFuture={true}
              clearable={false}
              required={true}
            />
          </div>

          {/* Live Auto-Save Indicator (Replaces Save Button) */}
          <div className="shrink-0 flex items-center justify-center sm:justify-start min-h-[42px]">
            {syncStatus === 'saving' ? (
              <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs animate-pulse">
                <RefreshCw size={14} className="animate-spin text-amber-600 shrink-0" />
                <span>Saving...</span>
              </div>
            ) : syncStatus === 'saved' ? (
              <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>Auto-saved</span>
              </div>
            ) : syncStatus === 'error' ? (
              <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs">
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <span>Sync Error</span>
              </div>
            ) : (
              <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100/90 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                <Check size={14} className="text-primary-600 shrink-0" />
                <span>Auto-sync Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Attendance Metric Cards (1-Tap Fast Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Present Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'PRESENT' ? 'ALL' : 'PRESENT')}
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white transition-all text-left space-y-2 shadow-xs cursor-pointer group border ${
            statusFilter === 'PRESENT'
              ? 'ring-2 ring-emerald-500/40 bg-emerald-50/40 border-emerald-200 shadow-sm'
              : 'border-slate-100 hover:bg-emerald-50/20 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Present</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{presentCount}</div>
            <p className="text-[11px] text-emerald-700/80 font-semibold">{attendanceRate}% Rate Today</p>
          </div>
        </button>

        {/* Absent Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'ABSENT' ? 'ALL' : 'ABSENT')}
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white transition-all text-left space-y-2 shadow-xs cursor-pointer group border ${
            statusFilter === 'ABSENT'
              ? 'ring-2 ring-rose-500/40 bg-rose-50/40 border-rose-200 shadow-sm'
              : 'border-slate-100 hover:bg-rose-50/20 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">Absent</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <XCircle size={17} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600">{absentCount}</div>
            <p className="text-[11px] text-rose-700/80 font-semibold">Unexcused Absence</p>
          </div>
        </button>

        {/* Late Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'LATE' ? 'ALL' : 'LATE')}
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white transition-all text-left space-y-2 shadow-xs cursor-pointer group border ${
            statusFilter === 'LATE'
              ? 'ring-2 ring-amber-500/40 bg-amber-50/40 border-amber-200 shadow-sm'
              : 'border-slate-100 hover:bg-amber-50/20 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Late</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock size={17} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{lateCount}</div>
            <p className="text-[11px] text-amber-700/80 font-semibold">Delayed Arrival</p>
          </div>
        </button>

        {/* Excused Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'EXCUSED' ? 'ALL' : 'EXCUSED')}
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white transition-all text-left space-y-2 shadow-xs cursor-pointer group border ${
            statusFilter === 'EXCUSED'
              ? 'ring-2 ring-blue-500/40 bg-blue-50/40 border-blue-200 shadow-sm'
              : 'border-slate-100 hover:bg-blue-50/20 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">Excused</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertCircle size={17} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600">{excusedCount}</div>
            <p className="text-[11px] text-blue-700/80 font-semibold">Approved Leave</p>
          </div>
        </button>
      </div>

      {/* 3. Search & Quick Action Control Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-100">
        {/* Search input with clear action */}
        <div className="relative flex-1 max-w-lg">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search student by name, roll #, admission ID, remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200/60 rounded-xl py-2.5 pl-10 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Fast Action: Mark All Present & Filter Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Filter size={13} /> Clear Filter ({statusFilter})
            </button>
          )}
          <button
            onClick={handleMarkAllPresent}
            disabled={students.length === 0}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs flex-1 md:flex-initial min-h-[38px] disabled:opacity-50"
          >
            <CheckCheck size={16} className="shrink-0" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* 4. Student Attendance Roll Call Cards with Late Remarks Input */}
      {fetching ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-3xl shadow-xs border border-slate-100 space-y-3">
          <RefreshCw size={24} className="mx-auto text-primary-500 animate-spin" />
          <p className="font-bold text-xs text-slate-700">Loading student roster...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((s) => {
            const photoUrl = s.image_url || s.photo;
            const initialChar = (s.name || 'S').trim().charAt(0).toUpperCase();
            const isLate = s.status === 'LATE';

            return (
              <div 
                key={s.id} 
                className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white shadow-xs space-y-3 transition hover:shadow-sm border ${
                  isLate ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-slate-100'
                }`}
              >
                {/* Student Info Bar & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Unified Avatar Box */}
                    <div className="relative w-11 h-11 rounded-2xl bg-primary-50 border border-primary-500/30 flex items-center justify-center font-black text-sm text-primary-700 shrink-0 overflow-hidden shadow-2xs">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={s.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                      <span className="font-black text-primary-700 select-none">
                        {initialChar}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">{s.name}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          Roll #{s.roll}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-primary-600 font-semibold">{s.adm}</span>
                        <span>•</span>
                        <span className="uppercase font-semibold text-[10px]">{s.gender || 'STUDENT'}</span>
                        {s.remarks && !isLate && (
                          <>
                            <span>•</span>
                            <span className="text-amber-700 font-medium text-[10px] flex items-center gap-0.5 max-w-[160px] truncate" title={s.remarks}>
                              <FileText size={10} className="shrink-0" />
                              <span className="truncate">{s.remarks}</span>
                            </span>
                          </>
                        )}
                        {s.is_marked && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium text-[10px] flex items-center gap-0.5">
                              ✓ Saved
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current Status Pill */}
                  <div className="shrink-0">
                    {s.status === 'PRESENT' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> Present
                      </span>
                    )}
                    {s.status === 'ABSENT' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle size={11} /> Absent
                      </span>
                    )}
                    {s.status === 'LATE' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={11} /> Late
                      </span>
                    )}
                    {s.status === 'EXCUSED' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <AlertCircle size={11} /> Excused
                      </span>
                    )}
                  </div>
                </div>

                {/* Segmented Status Selector (Mobile-First Capsule Bar) */}
                <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1">
                  {/* Present Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'PRESENT')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center min-h-[38px] ${
                      s.status === 'PRESENT'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                    title="Present"
                  >
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span className="sm:hidden font-black text-xs">P</span>
                    <span className="hidden sm:inline">Present</span>
                  </button>

                  {/* Absent Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'ABSENT')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center min-h-[38px] ${
                      s.status === 'ABSENT'
                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                    title="Absent"
                  >
                    <XCircle size={13} className="shrink-0" />
                    <span className="sm:hidden font-black text-xs">A</span>
                    <span className="hidden sm:inline">Absent</span>
                  </button>

                  {/* Late Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'LATE')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center min-h-[38px] ${
                      s.status === 'LATE'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                    title="Late"
                  >
                    <Clock size={13} className="shrink-0" />
                    <span className="sm:hidden font-black text-xs">L</span>
                    <span className="hidden sm:inline">Late</span>
                  </button>

                  {/* Excused Button */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(s.id, 'EXCUSED')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center min-h-[38px] ${
                      s.status === 'EXCUSED'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                    title="Excused"
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    <span className="sm:hidden font-black text-xs">E</span>
                    <span className="hidden sm:inline">Excused</span>
                  </button>
                </div>

                {/* 5. Dynamic Late Arrival Remarks Input Box (Opens when Late is selected) */}
                {isLate && (
                  <div className="pt-1 animate-fadeIn">
                    <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/90 rounded-2xl px-3.5 py-2.5 shadow-2xs focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:bg-white transition-all">
                      <Clock size={15} className="text-amber-600 shrink-0" />
                      <input
                        type="text"
                        placeholder="Enter late arrival reason (e.g. 15 mins late due to traffic, hospital checkup)..."
                        value={s.remarks || ''}
                        onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                        onBlur={(e) => handleRemarksBlur(s.id, e.target.value)}
                        className="w-full bg-transparent text-xs text-slate-900 placeholder-amber-700/60 focus:outline-none font-medium"
                      />
                      {s.remarks && (
                        <button
                          type="button"
                          onClick={() => handleRemarksChange(s.id, '')}
                          className="text-amber-500 hover:text-amber-800 p-0.5 rounded-full hover:bg-amber-100 transition cursor-pointer"
                          title="Clear remark"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2 bg-white rounded-3xl shadow-xs border border-slate-100">
              <Users size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No students match your filter</p>
              <p className="text-slate-400 text-[11px]">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'Try clearing your search or status filters.' 
                  : 'No student records enrolled in this class.'}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
