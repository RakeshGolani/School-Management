'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { getParentTimetableAction } from '@/actions/parent/timetableActions';
import ParentTimetableSkeleton from '@/components/skeletons/parent/ParentTimetableSkeleton';
import Card from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  GraduationCap,
  User,
  Search,
  RefreshCw,
  X,
  Coffee,
  AlertCircle,
  School,
  Layers,
  CheckCircle2,
  Calendar,
  Grid,
  ListFilter,
  Check,
  UserCheck
} from 'lucide-react';

const DAYS_META = [
  { key: 'MONDAY', label: 'Monday', short: 'Mon' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { key: 'SATURDAY', label: 'Saturday', short: 'Sat' }
];

export default function ParentTimetableClient({ initialData }) {
  const { activeChild } = useParentChild();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Auto select today's day of week
  const getTodayKey = () => {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const current = dayNames[new Date().getDay()];
    return current === 'SUNDAY' ? 'MONDAY' : current;
  };

  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'MATRIX'
  const [selectedDay, setSelectedDay] = useState(getTodayKey());
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch timetable on active ward change
  useEffect(() => {
    if (!activeChild?.id) return;

    let isMounted = true;
    setLoading(true);

    startTransition(async () => {
      try {
        const res = await getParentTimetableAction({
          studentId: activeChild.id
        });

        if (isMounted) {
          if (res?.success && res.data) {
            setData(res.data);
          } else {
            notifyError(res?.message || 'Failed to retrieve ward timetable');
          }
        }
      } catch (err) {
        if (isMounted) {
          notifyError(err.message || 'Error connecting to timetable service');
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
      const res = await getParentTimetableAction({
        studentId: activeChild.id
      });
      if (res?.success && res.data) {
        setData(res.data);
        notifySuccess('Ward timetable refreshed');
      } else {
        notifyError(res?.message || 'Failed to refresh timetable');
      }
    } catch (err) {
      notifyError(err.message || 'Failed to refresh timetable');
    } finally {
      setFetching(false);
    }
  };

  const days = data?.days || DAYS_META.map(d => ({ ...d, count: 0 }));
  const schedule = data?.schedule || {};
  const currentSchedule = schedule[selectedDay] || [];
  const classInfo = data?.class_info;
  const studentInfo = data?.student_info || activeChild;
  const periodSlots = data?.period_slots || [];

  const childDisplayName = studentInfo?.name || 
    (studentInfo?.first_name ? `${studentInfo.first_name} ${studentInfo.last_name || ''}`.trim() : 'Ward');

  const classDisplayName = classInfo?.class_name 
    ? `${classInfo.class_name} - ${classInfo.section || 'A'}` 
    : (activeChild?.grade || 'Class 10-A');

  // Filter periods by search term for Cards view
  const filteredSchedule = currentSchedule.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (p.subject && p.subject.toLowerCase().includes(term)) ||
      (p.teacher && p.teacher.toLowerCase().includes(term)) ||
      (p.room && p.room.toLowerCase().includes(term)) ||
      (p.period_title && p.period_title.toLowerCase().includes(term))
    );
  });

  // Calculate stats
  const totalWeeklyPeriods = data?.total_weekly_periods || 0;
  const totalSlotsCount = periodSlots.length || 8;
  const facultySet = new Set();
  Object.values(schedule).forEach(dayList => {
    (dayList || []).forEach(p => {
      if (p.teacher && !p.is_break) facultySet.add(p.teacher);
    });
  });

  if (loading && !data) {
    return <ParentTimetableSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 1. Header Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-primary-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-100/80 text-primary-800 border border-primary-200/60 inline-flex items-center gap-1">
              <Sparkles size={11} className="text-primary-600" />
              <span>Academic Schedule & Daily Periods</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {childDisplayName}&apos;s Weekly Timetable
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Class <strong className="text-slate-900">{classDisplayName}</strong> • Room: <span className="font-semibold text-slate-700">{classInfo?.room_number || 'Room 102'}</span> • Total Weekly Periods: <strong className="text-primary-600 font-bold">{totalWeeklyPeriods}</strong>
          </p>
        </div>

        {/* Right Action Header Card */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-right min-w-[140px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Today&apos;s Schedule
            </span>
            <div className="text-xl sm:text-2xl font-black text-primary-600">
              {currentSchedule.length} Periods
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              {selectedDay}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-primary-600 shadow-2xs transition flex items-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
            title="Refresh Timetable"
          >
            <RefreshCw size={15} className={fetching ? 'animate-spin text-primary-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Quick Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Class Room */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-primary-300 transition-colors">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
            Class & Section
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {classDisplayName}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Room: {classInfo?.room_number || 'Room 102'}</span>
        </div>

        {/* Total Weekly Periods */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-emerald-300 transition-colors">
          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
            Weekly Periods
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {totalWeeklyPeriods}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">Allocated Lectures</span>
        </div>

        {/* Assigned Faculty */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-amber-300 transition-colors">
          <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
            Subject Faculty
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {facultySet.size || 6}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Active Teachers</span>
        </div>

        {/* Today's Active Day */}
        <div className="p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-1 hover:border-primary-300 transition-colors">
          <span className="text-[11px] font-black text-primary-800 uppercase tracking-wider block">
            Active Day Focus
          </span>
          <div className="text-xl sm:text-2xl font-black text-primary-600">
            {selectedDay}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {currentSchedule.length} Periods on {selectedDay}
          </span>
        </div>
      </div>

      {/* 3. Control Bar: Day Filter Tabs, Search & View Switcher */}
      <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-2xs space-y-3 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Day Selector Tabs */}
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
            {days.map((d) => {
              const isSelected = selectedDay === d.key;
              const periodCount = schedule[d.key]?.length || d.count || 0;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(d.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-primary-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{d.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-primary-50 text-primary-700 font-black' : 'bg-slate-200 text-slate-600 font-bold'
                  }`}>
                    {periodCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box & View Mode Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject, teacher, room..."
                className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
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

            {/* View Mode Switcher */}
            <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 shadow-2xs shrink-0">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'CARDS'
                    ? 'bg-white text-primary-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Daily Period Cards View"
              >
                <Grid size={15} />
                <span className="hidden sm:inline">Daily</span>
              </button>
              <button
                onClick={() => setViewMode('MATRIX')}
                className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'MATRIX'
                    ? 'bg-white text-primary-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Full Weekly Matrix View"
              >
                <CalendarDays size={15} />
                <span className="hidden sm:inline">Full Week</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. VIEW 1: Daily Period Cards View */}
      {viewMode === 'CARDS' && (
        <>
          {filteredSchedule.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CalendarDays size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Periods Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm 
                  ? `No period matches "${searchTerm}" on ${selectedDay}.` 
                  : `No academic periods or lectures have been allocated for ${selectedDay}.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchedule.map((item, idx) => {
                const isBreak = item.is_break || item.subject?.toLowerCase().includes('break') || item.subject?.toLowerCase().includes('lunch');
                const isProxy = item.is_proxy;

                return (
                  <div 
                    key={item.id || idx}
                    className={`p-5 rounded-3xl bg-white border transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-md ${
                      isBreak 
                        ? 'border-amber-200/80 bg-amber-50/20' 
                        : isProxy 
                          ? 'border-primary-300 shadow-2xs hover:border-primary-500 hover:ring-2 hover:ring-primary-500/20' 
                          : 'border-slate-200 shadow-2xs hover:border-primary-400 hover:ring-2 hover:ring-primary-500/10'
                    }`}
                  >
                    {/* Top Period Badge & Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs font-mono shadow-2xs ${
                          isBreak 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-primary-50 text-primary-700 border border-primary-200/60'
                        }`}>
                          {isBreak ? <Coffee size={16} /> : `P${item.period}`}
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            {item.period_title || `Period ${item.period}`}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 flex items-center gap-1.5 font-mono">
                        <Clock size={12} className="text-primary-600" />
                        <span>{item.time}</span>
                      </span>
                    </div>

                    {/* Subject & Teacher Info */}
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-slate-900 tracking-tight">
                        {item.subject}
                      </h4>
                      
                      {!isBreak && (
                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="w-6 h-6 rounded-lg bg-primary-50 border border-primary-200/60 flex items-center justify-center text-primary-700 font-bold text-[10px] shrink-0">
                            <User size={12} />
                          </div>
                          <p className="text-xs font-bold text-slate-700">
                            {item.teacher}
                          </p>
                        </div>
                      )}

                      {isProxy && item.proxy_details && (
                        <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5 font-medium">
                          <AlertCircle size={13} className="shrink-0 text-amber-600 mt-0.5" />
                          <span>Substitute teacher assigned in place of {item.proxy_details.original}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Room & Status */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{item.room || classInfo?.room_number || 'Room 102'}</span>
                      </span>

                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isBreak 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isBreak ? 'Recess' : 'Scheduled'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 5. VIEW 2: Full Weekly Timetable Matrix */}
      {viewMode === 'MATRIX' && (
        <Card
          title="Weekly Timetable Matrix"
          subtitle={`Complete Mon–Sat period grid and room assignments for ${classDisplayName}`}
          icon={CalendarDays}
        >
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] bg-slate-50/70">
                  <th className="py-3 px-4 font-black w-28">Day</th>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="py-3 px-4 font-black">
                      Period {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS_META.map((dayObj) => {
                  const dayList = schedule[dayObj.key] || [];
                  const isCurrentDay = selectedDay === dayObj.key;

                  return (
                    <tr 
                      key={dayObj.key}
                      className={`transition-colors ${
                        isCurrentDay ? 'bg-primary-50/30' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Day Label Column */}
                      <td className="py-3.5 px-4 font-black text-slate-900 align-top">
                        <div className="flex items-center gap-1.5">
                          <span>{dayObj.label}</span>
                          {isCurrentDay && (
                            <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          {dayList.length} Periods
                        </span>
                      </td>

                      {/* Period Columns (1 to 6) */}
                      {Array.from({ length: 6 }).map((_, pIdx) => {
                        const periodNum = pIdx + 1;
                        const periodItem = dayList.find(p => p.period === periodNum);

                        if (!periodItem) {
                          return (
                            <td key={periodNum} className="py-3 px-4 align-top text-slate-300 font-mono text-[11px]">
                              -
                            </td>
                          );
                        }

                        const isBreak = periodItem.is_break;

                        return (
                          <td key={periodNum} className="py-3 px-4 align-top">
                            <div className={`p-2.5 rounded-2xl border transition-all space-y-1 ${
                              isBreak 
                                ? 'bg-amber-50/60 border-amber-200/80 text-amber-900' 
                                : 'bg-white border-slate-200/80 shadow-2xs hover:border-primary-300'
                            }`}>
                              <div className="font-black text-slate-900 text-xs truncate">
                                {periodItem.subject}
                              </div>
                              {!isBreak && (
                                <div className="text-[10px] text-slate-500 font-semibold truncate flex items-center gap-1">
                                  <User size={10} className="text-primary-600 shrink-0" />
                                  <span>{periodItem.teacher}</span>
                                </div>
                              )}
                              <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1 pt-0.5">
                                <Clock size={9} />
                                <span>{periodItem.time}</span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}
