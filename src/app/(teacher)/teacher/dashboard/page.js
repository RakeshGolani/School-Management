'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  CalendarDays, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  AlertCircle,
  BellRing,
  Award,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { getTeacherSessionAction } from '@/actions/teacher/authActions';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getTeacherSessionAction();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Failed to load teacher session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const assignedClass = user?.class_teacher_for?.[0] || { class_name: 'Grade 10', section: 'A' };
  const teacherName = user?.name || 'Faculty Member';

  const todayPeriods = [
    { period: 1, time: '08:30 - 09:15 AM', subject: user?.subject || 'Mathematics', class: `${assignedClass.class_name} - ${assignedClass.section}`, room: 'Room 102', status: 'COMPLETED' },
    { period: 2, time: '09:20 - 10:05 AM', subject: user?.subject || 'Mathematics', class: 'Grade 9 - B', room: 'Room 104', status: 'IN_PROGRESS' },
    { period: 3, time: '10:10 - 10:55 AM', subject: 'Lab / Practical', class: `${assignedClass.class_name} - ${assignedClass.section}`, room: 'Science Lab 2', status: 'UPCOMING' },
    { period: 4, time: '11:15 - 12:00 PM', subject: 'Remedial Session', class: 'Grade 8 - A', room: 'Room 201', status: 'UPCOMING' },
    { period: 5, time: '12:45 - 01:30 PM', subject: 'Class Teacher Period', class: `${assignedClass.class_name} - ${assignedClass.section}`, room: 'Room 102', status: 'UPCOMING' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 border border-primary-200">
              <Sparkles size={14} className="text-primary-600" />
              <span>Class Teacher Command Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Good day, {teacherName}!
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              You are assigned as Class Teacher for <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">{assignedClass.class_name} ({assignedClass.section})</span>. Today you have 5 allocated periods.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/teacher/attendance"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>Mark Today&apos;s Attendance</span>
            </Link>
            <Link
              href="/teacher/timetable"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <CalendarDays size={16} />
              <span>Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Assigned</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{assignedClass.class_name}</div>
            <p className="text-xs text-primary-600 font-semibold">Section {assignedClass.section} • 38 Students</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Periods</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">5 Periods</div>
            <p className="text-xs text-cyan-600 font-semibold">1 Completed • 1 Active</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">94.7%</div>
            <p className="text-xs text-emerald-600 font-semibold">36 Present • 2 Absent today</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{user?.subject || 'Academics'}</div>
            <p className="text-xs text-amber-600 font-semibold">Faculty Member</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Period Timeline */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <CalendarDays size={20} className="text-primary-600" />
                  Today&apos;s Period Schedule
                </h2>
                <p className="text-xs text-slate-500">Classroom allocations and real-time period progression.</p>
              </div>
              <Link href="/teacher/timetable" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Full Week <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {todayPeriods.map((item) => (
                <div 
                  key={item.period}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.status === 'IN_PROGRESS' 
                      ? 'bg-primary-50/60 border-primary-200 ring-1 ring-primary-400/30' 
                      : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'IN_PROGRESS' ? 'bg-primary-600 text-white animate-pulse shadow-sm' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      #{item.period}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.subject}</span>
                        <span className="text-[10px] font-mono font-bold text-primary-700 px-2 py-0.5 rounded-full bg-primary-100 border border-primary-200">
                          {item.class}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.time} • <span className="text-slate-700 font-semibold">{item.room}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.status === 'COMPLETED' && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    )}
                    {item.status === 'IN_PROGRESS' && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary-100 text-primary-700 border border-primary-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></span>
                        Now Active
                      </span>
                    )}
                    {item.status === 'UPCOMING' && (
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Class Quick Roster & Notices */}
        <div className="lg:col-span-4 space-y-6">
          {/* Managed Class Quick Action */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary-50/80 via-white to-slate-50 border border-primary-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary-700">Class Desk</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">1-Click Attendance</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{assignedClass.class_name} - {assignedClass.section}</h3>
              <p className="text-xs text-slate-600 mt-1">Manage today&apos;s attendance roll-call, view student behavior logs, and contact parents.</p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link 
                href="/teacher/attendance"
                className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary-600/20"
              >
                <CheckCircle2 size={15} /> Take Class Roll Call
              </Link>
              <Link 
                href="/teacher/students"
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Users size={15} /> View Student Roster
              </Link>
            </div>
          </div>

          {/* Institutional Bulletins */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BellRing size={14} className="text-amber-500" /> Faculty Notice Board
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Term 1 Assessment Review</p>
                <p className="text-slate-600 text-[11px]">Mid-term grading reports must be locked in the system before Friday 4:00 PM.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Staff General Assembly</p>
                <p className="text-slate-600 text-[11px]">Academic council meeting scheduled for Thursday morning in Auditorium Hall.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
