'use client';

import { useState, useTransition } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  GraduationCap,
  Users,
  Search,
  X,
  Layers,
  RefreshCw,
  AlertCircle,
  Coffee,
  CheckCircle2,
  Check,
  Zap,
  Radio
} from 'lucide-react';
import { getTeacherTimetableAction } from '@/actions/teacher/timetableActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function TeacherTimetableClient({ initialUser, initialData }) {
  // Determine current day of week
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayName = dayNames[new Date().getDay()];
  const defaultDay = (todayName === 'SUNDAY') ? 'MONDAY' : todayName;

  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const days = data?.days || [
    { key: 'MONDAY', short: 'Mon', count: 0 },
    { key: 'TUESDAY', short: 'Tue', count: 0 },
    { key: 'WEDNESDAY', short: 'Wed', count: 0 },
    { key: 'THURSDAY', short: 'Thu', count: 0 },
    { key: 'FRIDAY', short: 'Fri', count: 0 },
    { key: 'SATURDAY', short: 'Sat', count: 0 }
  ];

  const scheduleMap = data?.schedule || {
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
    FRIDAY: [],
    SATURDAY: []
  };

  const summary = data?.summary || {
    total_weekly_periods: 0,
    total_classes_taught: 0,
    my_class_periods: 0
  };

  const handleRefresh = () => {
    setFetching(true);
    startTransition(async () => {
      try {
        const res = await getTeacherTimetableAction();
        if (res.success && res.data) {
          setData(res.data);
          notifySuccess('Schedule refreshed successfully');
        } else {
          notifyError(res.message || 'Failed to refresh timetable');
        }
      } catch (err) {
        console.error('Error refreshing timetable:', err);
        notifyError('Network error while refreshing timetable');
      } finally {
        setFetching(false);
      }
    });
  };

  const currentDaySchedule = scheduleMap[selectedDay] || [];

  // Filter periods by search term
  const filteredSchedule = currentDaySchedule.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (p.subject && p.subject.toLowerCase().includes(term)) ||
      (p.class && p.class.toLowerCase().includes(term)) ||
      (p.room && p.room.toLowerCase().includes(term)) ||
      (p.period_title && p.period_title.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-16 sm:pb-0">
      
      {/* 1. Header Banner & Key Metrics */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700">
            <Sparkles size={12} className="text-primary-600 shrink-0" />
            <span>Faculty Schedule Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Master Period Allocation Matrix
          </h1>
          <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
            <span>View daily assigned classrooms, section schedules, and period allocations.</span>
            {data?.teacher?.name && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-primary-700 font-bold">{data.teacher.name}</span>
              </>
            )}
          </p>
        </div>

        {/* Quick Stats Pill Group */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Weekly Periods</span>
            <span className="text-lg font-black text-primary-600 leading-tight">{summary.total_weekly_periods}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Classes Taught</span>
            <span className="text-lg font-black text-slate-800 leading-tight">{summary.total_classes_taught}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">My Class</span>
            <span className="text-lg font-black text-emerald-600 leading-tight">{summary.my_class_periods}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 text-slate-500 hover:text-primary-600 shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Refresh Schedule"
          >
            <RefreshCw size={17} className={fetching ? 'animate-spin text-primary-600' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Day Selector Tabs (Horizontal Scroll on Mobile/Tablet) */}
      <div className="p-1.5 sm:p-2 bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {days.map((d) => {
          const isSelected = selectedDay === d.key;
          const isToday = todayName === d.key;

          return (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 min-h-[40px] ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span className="sm:hidden">{d.short}</span>
              <span className="hidden sm:inline">{d.key}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {d.count ?? (scheduleMap[d.key]?.length || 0)}
              </span>
              {isToday && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Search & Day Overview Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${selectedDay} periods by subject, class, room...`}
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

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <CalendarDays size={15} className="text-primary-600 shrink-0" />
          <span>{filteredSchedule.length} Periods Scheduled for {selectedDay}</span>
        </div>
      </div>

      {/* 4. Period Grid Cards */}
      {filteredSchedule.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredSchedule.map((p) => {
            const isBreak = p.is_break;
            const isProxy = p.is_proxy;
            const isClassTeacher = p.is_class_teacher;

            if (isBreak) {
              return (
                <div
                  key={p.id}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-50/50 border border-amber-200/60 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm shrink-0">
                      <Coffee size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm leading-tight">{p.subject || 'Recess / Break'}</h4>
                      <p className="text-[11px] text-amber-700/80 font-medium">{p.time}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-200/60 text-amber-800 uppercase tracking-wider">
                    Break
                  </span>
                </div>
              );
            }

            // Calculate live status when viewing today's day
            let liveStatus = 'ALLOCATED';
            if (selectedDay === todayName) {
              const now = new Date();
              const currentMinutes = now.getHours() * 60 + now.getMinutes();

              const [sh, sm] = (p.start_time || '00:00:00').split(':').map(Number);
              const [eh, em] = (p.end_time || '00:00:00').split(':').map(Number);
              const startMin = sh * 60 + sm;
              const endMin = eh * 60 + em;

              if (currentMinutes >= endMin) {
                liveStatus = 'COMPLETED';
              } else if (currentMinutes >= startMin && currentMinutes < endMin) {
                liveStatus = 'IN_PROGRESS';
              } else {
                liveStatus = 'UPCOMING';
              }
            }

            const isActiveNow = liveStatus === 'IN_PROGRESS';
            const isCompleted = liveStatus === 'COMPLETED';

            return (
              <div
                key={p.id}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 flex flex-col justify-between space-y-3.5 sm:space-y-4 shadow-xs border relative overflow-hidden ${
                  isActiveNow
                    ? 'bg-gradient-to-br from-primary-50/90 via-white to-primary-50/40 border-primary-500 ring-2 ring-primary-500/30 shadow-md scale-[1.01]'
                    : isCompleted
                    ? 'bg-slate-50/70 border-slate-200/70 opacity-80 hover:opacity-100'
                    : isProxy
                    ? 'bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border-amber-200/80 ring-2 ring-amber-300/20'
                    : isClassTeacher
                    ? 'bg-gradient-to-br from-primary-50/60 via-white to-slate-50 border-primary-200/70'
                    : 'bg-white border-slate-200/80 hover:border-primary-400/50 hover:shadow-md'
                }`}
              >
                {/* Card Top: Period Badge & Time */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                      isActiveNow 
                        ? 'bg-primary-600 text-white shadow-xs' 
                        : 'bg-primary-50 border border-primary-500/20 text-primary-700'
                    }`}>
                      P{p.period}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight whitespace-nowrap">
                      {p.period_title || `Period ${p.period}`}
                    </span>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-[11px] sm:text-xs font-bold border shrink-0 ${
                    isActiveNow 
                      ? 'bg-white text-slate-900 border-primary-300 shadow-2xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200/80'
                  }`}>
                    <Clock size={12} className={isActiveNow ? 'text-primary-600 shrink-0' : 'text-slate-400 shrink-0'} />
                    <span>{p.time}</span>
                  </div>
                </div>

                {/* Subject & Class Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {p.subject}
                    </h3>

                    {isActiveNow && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shadow-xs shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>ACTIVE NOW</span>
                      </span>
                    )}

                    {isClassTeacher && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-primary-700 bg-primary-100/80 px-2 py-0.5 rounded-full">
                        <GraduationCap size={11} /> My Class
                      </span>
                    )}
                    {isProxy && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} /> Substitute
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-primary-700 font-bold flex items-center gap-1.5 pt-0.5">
                    <BookOpen size={13} className="shrink-0 text-primary-600" />
                    <span>{p.class}</span>
                  </p>

                  {isProxy && p.proxy_details && (
                    <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200/50 mt-1">
                      Substituting for <strong>{p.proxy_details.original_teacher}</strong> ({p.proxy_details.reason})
                    </p>
                  )}
                </div>

                {/* Card Footer: Classroom & Live Status */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-2">
                  <span className="flex items-center gap-1.5 font-bold truncate text-slate-700">
                    <MapPin size={14} className="text-primary-600 shrink-0" />
                    <span className="truncate">{p.room}</span>
                  </span>

                  {isActiveNow ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 font-black bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Live Session</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                      <Check size={11} className="text-emerald-600" /> Done
                    </span>
                  ) : liveStatus === 'UPCOMING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary-700 font-bold bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200 shrink-0">
                      <Clock size={11} className="text-primary-600" /> Upcoming
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                      <CheckCircle2 size={11} className="text-emerald-600" /> Allocated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center text-slate-500 text-xs space-y-3 bg-white rounded-3xl shadow-xs border border-slate-100">
          <CalendarDays size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-800 text-sm">No periods scheduled for {selectedDay}</h3>
          <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
            {searchTerm 
              ? `No period allocations matching "${searchTerm}". Try clearing your search filter.`
              : 'You do not have any teaching periods allocated on this day.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <X size={13} /> Clear Search
            </button>
          )}
        </div>
      )}

    </div>
  );
}
