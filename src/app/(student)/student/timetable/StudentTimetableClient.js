'use client';

import { useState, useTransition } from 'react';
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
  Check
} from 'lucide-react';
import { getStudentTimetableAction } from '@/actions/student/timetableActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function StudentTimetableClient({ initialUser, initialData }) {
  const [data, setData] = useState(initialData);

  // Default day of week (Auto select current day)
  const getTodayKey = () => {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const current = dayNames[new Date().getDay()];
    return current === 'SUNDAY' ? 'MONDAY' : current;
  };

  const [selectedDay, setSelectedDay] = useState(getTodayKey());
  const [searchTerm, setSearchTerm] = useState('');
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const days = data?.days || [
    { key: 'MONDAY', label: 'Monday', short: 'Mon', count: 0 },
    { key: 'TUESDAY', label: 'Tuesday', short: 'Tue', count: 0 },
    { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed', count: 0 },
    { key: 'THURSDAY', label: 'Thursday', short: 'Thu', count: 0 },
    { key: 'FRIDAY', label: 'Friday', short: 'Fri', count: 0 },
    { key: 'SATURDAY', label: 'Saturday', short: 'Sat', count: 0 }
  ];

  const schedule = data?.schedule || {};
  const currentSchedule = schedule[selectedDay] || [];
  const classInfo = data?.class_info;
  const studentInfo = data?.student_info || initialUser;

  // Filter periods by search term
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

  const handleRefresh = () => {
    setFetching(true);
    startTransition(async () => {
      try {
        const res = await getStudentTimetableAction();
        if (res.success && res.data) {
          setData(res.data);
          notifySuccess('Timetable refreshed');
        } else {
          notifyError(res.message || 'Failed to refresh timetable');
        }
      } catch (err) {
        console.error('Error refreshing timetable:', err);
        notifyError('Failed to refresh timetable');
      } finally {
        setFetching(false);
      }
    });
  };

  return (
    <div className="space-y-3.5 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-24 sm:pb-8">
      
      {/* 1. Mobile-Specific Compact App Header (< sm) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 border border-slate-100 flex items-center justify-between gap-3 sm:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-700">
              <Sparkles size={10} className="text-primary-600 shrink-0" />
              <span>Timetable</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {data?.total_weekly_periods || 0} Periods
            </span>
          </div>
          <h1 className="text-base font-black text-slate-900 leading-tight truncate">
            Weekly Class Schedule
          </h1>
          <p className="text-[11px] text-primary-700 font-bold truncate mt-0.5">
            {classInfo ? `${classInfo.class_name} - ${classInfo.section} • ${classInfo.room_number || 'Room'}` : 'Student Schedule'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={fetching}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50 min-w-[38px] min-h-[38px] flex items-center justify-center"
          title="Refresh Schedule"
        >
          <RefreshCw size={15} className={fetching ? 'animate-spin text-primary-600' : ''} />
        </button>
      </div>

      {/* 1b. Desktop / Tablet Header Banner (>= sm) */}
      <div className="hidden sm:flex p-6 md:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 items-center justify-between gap-4 border border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700">
            <Sparkles size={12} className="text-primary-600 shrink-0" />
            <span>Class Timetable</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Weekly Class Schedule
          </h1>
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
            {classInfo ? (
              <>
                <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">
                  {classInfo.class_name} - Section {classInfo.section}
                </span>
                <span className="text-slate-300">•</span>
                <span>{classInfo.room_number || 'Main Classroom'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-primary-700 font-bold">{data?.total_weekly_periods || 0} Weekly Periods</span>
              </>
            ) : (
              <span>Master Timetable Matrix</span>
            )}
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={fetching}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px]"
        >
          <RefreshCw size={15} className={fetching ? 'animate-spin text-primary-600' : ''} />
          <span>Refresh Schedule</span>
        </button>
      </div>

      {/* 2. Native Mobile Day Strip (Horizontal Segmented Scroll) */}
      <div className="p-1 sm:p-1.5 bg-slate-100/90 rounded-2xl sm:rounded-3xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
        {days.map((d) => {
          const isSelected = selectedDay === d.key;
          const count = d.count || (schedule[d.key] ? schedule[d.key].length : 0);

          return (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key)}
              className={`flex-1 min-w-[62px] sm:min-w-[85px] py-1.5 sm:py-2.5 px-1.5 rounded-xl sm:rounded-2xl text-xs font-black transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="uppercase text-[10px] sm:text-xs tracking-wider font-extrabold">{d.short || d.key.slice(0, 3)}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : count > 0
                    ? 'bg-slate-200 text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar & Count Indicator */}
      <div className="p-2.5 sm:p-4 rounded-2xl bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${selectedDay.toLowerCase()} periods...`}
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

        <div className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5 px-1">
          <CalendarDays size={12} className="text-primary-600 shrink-0" />
          <span>{filteredSchedule.length} Periods Scheduled</span>
        </div>
      </div>

      {/* 4. Beautiful Elevated Period Cards */}
      {filteredSchedule.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredSchedule.map((p) => {
            const isBreak = p.is_break;
            const isProxy = p.is_proxy;
            const teacherInitial = (p.teacher || 'T').trim().charAt(0).toUpperCase();

            if (isBreak) {
              return (
                <div
                  key={p.id}
                  className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-50/80 to-white border border-amber-200/70 shadow-xs flex items-center justify-between gap-3 transition"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-l-[inherit]" />
                  <div className="flex items-center gap-3 pl-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs border border-amber-200/50">
                      <Coffee size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-amber-950 text-sm sm:text-base leading-tight truncate">
                        {p.subject || 'Recess & Snack Break'}
                      </h4>
                      <p className="text-[11px] text-amber-800/80 font-bold mt-0.5 whitespace-nowrap">
                        {p.time}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-950 uppercase tracking-wider shrink-0 shadow-2xs">
                    Break
                  </span>
                </div>
              );
            }

            // Calculate live status when viewing today's day
            const todayKey = getTodayKey();
            let liveStatus = 'ALLOCATED';
            if (selectedDay === todayKey) {
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
                    : 'bg-white border-slate-200/80 hover:border-primary-400/50 hover:shadow-md'
                }`}
              >
                {/* Card Top: Period Number Pill & Full Formatted Time Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
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

                {/* Subject Title & Active Now Beacon */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
                      {p.subject}
                    </h3>

                    {isActiveNow && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse shadow-xs shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>ACTIVE NOW</span>
                      </span>
                    )}

                    {isProxy && (
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200/60 shrink-0">
                        <AlertCircle size={10} /> Substitute
                      </span>
                    )}
                  </div>
                </div>

                {/* Faculty Teacher & Classroom Box */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 font-black text-xs flex items-center justify-center shrink-0 border border-primary-200/50 shadow-2xs">
                      {teacherInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                        {p.teacher}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Subject Faculty
                      </span>
                    </div>
                  </div>

                  {/* Room Tag */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-slate-700 border border-slate-200/80 text-xs font-bold shrink-0 shadow-2xs">
                    <MapPin size={12} className="text-primary-600 shrink-0" />
                    <span>{p.room}</span>
                  </div>
                </div>

                {/* Card Footer: Class Info & Scheduled Badge */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-2">
                  <span className="font-bold text-slate-700 truncate text-xs flex items-center gap-1">
                    <GraduationCap size={13} className="text-primary-600 shrink-0" />
                    <span className="truncate">{classInfo ? `${classInfo.class_name} - ${classInfo.section}` : 'Class Schedule'}</span>
                  </span>

                  {isActiveNow ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Live Session</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                      <Check size={11} className="text-emerald-600" /> Done
                    </span>
                  ) : liveStatus === 'UPCOMING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-200 shrink-0">
                      <Clock size={11} className="text-primary-600" /> Upcoming
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                      <CheckCircle2 size={11} className="text-emerald-600" /> Scheduled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 sm:p-14 text-center rounded-2xl sm:rounded-3xl bg-white shadow-xs border border-slate-100 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">No periods scheduled for {selectedDay}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">There are no classes scheduled for this day.</p>
          </div>
        </div>
      )}

    </div>
  );
}
