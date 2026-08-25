'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  CheckCircle2, 
  Bus, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Award, 
  User, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  BellRing,
  Coffee,
  Check,
  FileText,
  PhoneCall,
  GraduationCap,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import { getStudentDashboardAction } from '@/actions/student/dashboardActions';
import StudentDashboardSkeleton from '@/components/skeletons/student/StudentDashboardSkeleton';
import Tooltip from '@/components/ui/Tooltip';

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getStudentDashboardAction();
        if (res?.success && res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !dashboardData) {
    return <StudentDashboardSkeleton />;
  }

  const { student, stats, today, current_period, next_period, today_periods } = dashboardData;
  const studentName = student?.name || 'Student';
  const admissionNumber = student?.admission_number || 'ADM-2026-001';
  const className = student?.class 
    ? `${student.class.class_name} - Section ${student.class.section}` 
    : 'Class 10-A';
  const classTeacher = student?.class?.class_teacher;
  const transport = student?.transport;
  const periods = today_periods || [];

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Student Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 p-5 sm:p-8 shadow-xs shadow-slate-200/50 border border-slate-100">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary-100 text-primary-800 border border-primary-200/80">
              <Sparkles size={13} className="text-primary-600 shrink-0" />
              <span>Student Learning Desk • {today?.day_name}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              Enrolled in <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">{className}</span> • Admission ID: <span className="font-mono text-primary-700 font-bold">{admissionNumber}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-0">
            <Link
              href="/student/leaves"
              className="py-3 px-4 sm:px-5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-600/25 active:scale-95 transition flex items-center justify-center gap-2 text-center"
            >
              <FileText size={16} className="shrink-0" />
              <span className="truncate">Apply Leave</span>
            </Link>
            <Link
              href="/student/timetable"
              className="py-3 px-4 sm:px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs border border-slate-200 text-center"
            >
              <CalendarDays size={16} className="shrink-0 text-primary-600" />
              <span className="truncate">Class Timetable</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Spotlight: LIVE CURRENT PERIOD & UPCOMING NEXT PERIOD MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Card A: Current Period Spotlight */}
        <div className={`p-5 sm:p-6 rounded-3xl transition-all relative overflow-hidden ${
          current_period 
            ? 'bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 text-white shadow-lg shadow-primary-900/20' 
            : 'bg-white border border-slate-200/80 shadow-xs'
        }`}>
          {current_period ? (
            <>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black tracking-wider uppercase backdrop-blur-md border border-white/20 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Period #{current_period.period_number} • Live Now</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-white/20 border border-white/25 px-3 py-1 rounded-xl shadow-xs backdrop-blur-md">
                    <Clock size={13} className="text-white shrink-0" />
                    <span>{current_period.time_formatted}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {current_period.subject_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/95 mt-1.5 font-bold">
                    <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-lg border border-white/20">
                      <User size={14} className="text-white shrink-0" />
                      <span>{current_period.teacher_name}</span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-lg border border-white/20">
                      <MapPin size={14} className="text-white shrink-0" />
                      <span>{current_period.room_number}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/20">
                  <span className="text-xs text-white/90 font-bold">
                    In Classroom Session
                  </span>
                  <Link
                    href="/student/timetable"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-50 transition active:scale-95 shadow-md"
                  >
                    <span>View Schedule</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black tracking-wide uppercase">
                  <Coffee size={13} className="text-amber-600" />
                  <span>Break / Recess Time</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  {today?.date_formatted}
                </span>
              </div>

              <div className="py-2 space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  No Active Class Session Right Now
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  You are currently in recess break or today's scheduled classroom periods are wrapped up.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary-700">
                <span className="inline-flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>{stats?.total_periods_today || 0} Periods Scheduled</span>
                </span>
                <Link href="/student/timetable" className="hover:underline flex items-center gap-1">
                  <span>Weekly Matrix</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Card B: Upcoming Next Period Spotlight */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black tracking-wide uppercase">
              <Clock size={13} className="text-amber-600" />
              <span>Next Upcoming Period</span>
            </div>
            {next_period && (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                Period #{next_period.period_number}
              </span>
            )}
          </div>

          {next_period ? (
            <div className="space-y-2 py-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {next_period.subject_name}
                </h3>
                <span className="font-mono text-xs font-bold text-primary-700 whitespace-nowrap bg-primary-50 px-2 py-0.5 rounded-md">
                  {next_period.time_formatted}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                  <User size={14} className="text-primary-600" />
                  <span>{next_period.teacher_name}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{next_period.room_number}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="py-2 space-y-1">
              <h3 className="text-base font-black text-slate-800">
                All Classes Concluded for Today 🎉
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Great job today! Complete your homework assignments and check your schedule for tomorrow.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">
              {next_period ? `Location: ${next_period.room_number}` : 'Have a productive afternoon!'}
            </span>
            <Link
              href="/student/timetable"
              className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-800 font-black"
            >
              <span>View Full Table</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        
        {/* Card 1: Attendance Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {stats?.attendance_rate || 96}%
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {stats?.present_days || 25} of {stats?.total_days || 26} Days Present
            </p>
          </div>
        </div>

        {/* Card 2: Today's Classes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Periods Today</span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {stats?.total_periods_today || 0} Periods
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Scheduled on {today?.day_name}
            </p>
          </div>
        </div>

        {/* Card 3: Smart Bus Transit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transit / Bus</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bus size={16} />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 truncate font-mono">
              {transport?.is_enabled ? transport.bus_number : 'Non-Bus'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              {transport?.is_enabled ? transport.stop_name : 'Campus Commuter'}
            </p>
          </div>
        </div>

        {/* Card 4: Leave Requests */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Leave Applications</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {stats?.pending_leaves_count || 0} Active
            </div>
            <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
              {stats?.pending_leaves_count > 0 ? 'Under Review by Teacher' : 'All applications cleared'}
            </p>
          </div>
        </div>

      </div>

      {/* 4. Complete Today's Classroom Timeline */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="text-primary-600 shrink-0" size={18} />
              <span>Today's Class Schedule Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {className} • {today?.day_name}, {today?.date_formatted}
            </p>
          </div>

          <Link
            href="/student/timetable"
            className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Weekly Matrix</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {periods.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <BookOpen size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No Classes Scheduled for Today</p>
            <p className="text-xs text-slate-400">Enjoy your holiday or study review time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {periods.map((item) => {
              const isActive = item.status === 'IN_PROGRESS';
              const isCompleted = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition duration-200 relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'bg-primary-50/70 border-primary-500 ring-2 ring-primary-500/20 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-50/60 border-slate-200/60 opacity-80'
                      : 'bg-white border-slate-200 hover:border-primary-400 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-black uppercase">
                        Period #{item.period_number}
                      </span>

                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>ACTIVE NOW</span>
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Check size={12} className="text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      )}

                      {item.status === 'UPCOMING' && (
                        <span className="text-[10px] font-bold text-slate-400">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">
                        {item.subject_name}
                      </h4>
                      <p className="text-xs font-bold text-primary-700 mt-0.5 flex items-center gap-1">
                        <User size={13} className="text-primary-600" />
                        <span>{item.teacher_name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                      <Clock size={12} className="text-primary-600" />
                      <span>{item.time_formatted}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{item.room_number}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Class Teacher & Contact Info Card */}
      {classTeacher && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-500/20 text-primary-700 font-black text-base flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
              <span>{(classTeacher.name || 'T').trim().charAt(0).toUpperCase()}</span>
              {classTeacher.photo && (
                <img 
                  src={classTeacher.photo} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary-800 text-[10px] font-black uppercase tracking-wider">
                <GraduationCap size={11} className="text-primary-600" />
                <span>Class Teacher</span>
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                {classTeacher.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {classTeacher.email || 'Faculty In-Charge'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {classTeacher.phone && (
              <a
                href={`tel:${classTeacher.phone}`}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <PhoneCall size={14} className="text-primary-600" />
                <span>{classTeacher.phone}</span>
              </a>
            )}
            <Link
              href="/student/leaves"
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <FileText size={14} />
              <span>Contact for Leave</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
