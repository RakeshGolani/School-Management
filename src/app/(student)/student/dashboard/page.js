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
  BellRing
} from 'lucide-react';
import { getStudentSessionAction } from '@/actions/student/authActions';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const session = await getStudentSessionAction();
      if (session?.user) {
        setUser(session.user);
      }
    }
    load();
  }, []);

  const studentName = user?.full_name || user?.first_name || 'Student';
  const admissionNumber = user?.admission_number || 'ADM-2026-001';
  const className = user?.class?.class_name 
    ? `${user.class.class_name} - ${user.class.section}` 
    : user?.grade || 'Class 10-A';
  const busRoute = user?.bus_route?.route_name || 'Route #01 - North City Express';
  const busStop = user?.bus_stop?.stop_name || 'Greenwood Crossing Stop #3';

  const todayPeriods = [
    { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Mr. Rajesh Verma', room: 'Room 102', status: 'COMPLETED' },
    { period: 2, time: '09:20 - 10:05 AM', subject: 'Science Physics', teacher: 'Mrs. Neha Singh', room: 'Science Lab 2', status: 'IN_PROGRESS' },
    { period: 3, time: '10:10 - 10:55 AM', subject: 'English Literature', teacher: 'Ms. Clara D’Souza', room: 'Room 102', status: 'UPCOMING' },
    { period: 4, time: '11:15 - 12:00 PM', subject: 'Social Studies', teacher: 'Mr. Arvind Dave', room: 'Room 102', status: 'UPCOMING' },
    { period: 5, time: '12:45 - 01:30 PM', subject: 'Physical Education / Sports', teacher: 'Coach Sandeep', room: 'Sports Ground', status: 'UPCOMING' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Student Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 border border-primary-200">
              <Sparkles size={14} className="text-primary-600" />
              <span>Student Learning Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              Enrolled in <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">{className}</span> • Admission ID: <span className="font-mono text-primary-600 font-bold">{admissionNumber}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/timetable"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <CalendarDays size={16} />
              <span>View Timetable</span>
            </Link>
            <Link
              href="/student/profile"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <User size={16} />
              <span>Digital ID</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">96.2%</div>
            <p className="text-xs text-primary-600 font-semibold">25 of 26 Days Present</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Classes</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">5 Periods</div>
            <p className="text-xs text-primary-600 font-semibold">1 Finished • 1 Active</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Bus</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bus size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">Route #01</div>
            <p className="text-xs text-amber-600 font-semibold truncate">Drop at 02:45 PM</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Term</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">Term 1</div>
            <p className="text-xs text-emerald-600 font-semibold">2026 - 2027 Year</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <CalendarDays size={20} className="text-primary-600" />
                Today&apos;s Classes & Rooms
              </h2>
              <p className="text-xs text-slate-500">Class schedule, allocated room numbers, and subject teachers.</p>
            </div>
            <Link href="/student/timetable" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
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
                    P{item.period}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{item.subject}</span>
                      <span className="text-[10px] text-slate-500">• {item.teacher}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.time} • <span className="text-primary-700 font-bold">{item.room}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {item.status === 'COMPLETED' && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Done
                    </span>
                  )}
                  {item.status === 'IN_PROGRESS' && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary-100 text-primary-700 border border-primary-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></span>
                      Active Period
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

        {/* Right Column: Smart Bus & Notices */}
        <div className="lg:col-span-4 space-y-6">
          {/* Smart Bus Info */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Bus size={14} className="text-amber-500" /> Commute Details
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">{busRoute}</div>
              <p className="text-slate-600">Pickup & Drop: <span className="text-amber-700 font-semibold">{busStop}</span></p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-[11px] text-slate-500">
                <span>Morning: 07:15 AM</span>
                <span>Afternoon: 02:45 PM</span>
              </div>
            </div>
            <Link 
              href="/student/transport"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center justify-end gap-1"
            >
              Full Transit Info <ChevronRight size={13} />
            </Link>
          </div>

          {/* Student Notices */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BellRing size={14} className="text-primary-600" /> Student Bulletins
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Annual Science Exhibition</p>
                <p className="text-slate-600 text-[11px]">Submit project abstracts by next Tuesday to Science department.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Inter-House Sports Week</p>
                <p className="text-slate-600 text-[11px]">Trials for football and basketball starting this Thursday.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
