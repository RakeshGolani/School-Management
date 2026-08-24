'use client';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import Link from 'next/link';
import { 
  Bus, 
  CheckCircle2, 
  CreditCard, 
  CalendarDays, 
  Radio, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  ChevronRight,
  AlertCircle,
  Smartphone
} from 'lucide-react';

export default function ParentDashboard() {
  const { activeChild, childrenList } = useParentChild();

  const childName = activeChild?.full_name || activeChild?.first_name || 'My Child';
  const childClass = activeChild?.class?.class_name 
    ? `${activeChild.class.class_name} - ${activeChild.class.section}` 
    : activeChild?.grade || 'Class 10-A';
  const admNo = activeChild?.admission_number || 'ADM-2026-001';
  const rollNo = activeChild?.roll_number || '01';
  const busRoute = activeChild?.bus_route?.route_name || 'Route #01 - North City Express';
  const busStop = activeChild?.bus_stop?.stop_name || 'Greenwood Crossing Stop #3';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Ward Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 border border-primary-200">
              <Sparkles size={14} className="text-primary-600" />
              <span>Ward Safety & Academic Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {childName}&apos;s Daily Overview
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              Enrolled in <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">{childClass}</span> • Roll No: {rollNo} • Adm No: <span className="font-mono text-primary-600 font-bold">{admNo}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/parent/bus-tracking"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Bus size={16} />
              <span>Live Smart Bus Radar</span>
            </Link>
            <Link
              href="/parent/attendance"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 size={16} />
              <span>Gate Logs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Live Gate Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Gate Entry</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              In Campus
            </div>
            <p className="text-xs text-slate-500 mt-1">NFC Swiped at <span className="text-slate-900 font-bold">07:42 AM</span></p>
          </div>
        </div>

        {/* Bus Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smart Bus Fleet</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bus size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">Route Active</div>
            <p className="text-xs text-amber-600 font-semibold truncate">Pickup Stop: {busStop.split('Stop')[0]}</p>
          </div>
        </div>

        {/* Attendance Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">96.2%</div>
            <p className="text-xs text-primary-600 font-semibold">25 / 26 Days Attended</p>
          </div>
        </div>

        {/* Fees Dues */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Account</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600">All Cleared</div>
            <p className="text-xs text-slate-500 mt-1">Term 1 Dues Paid</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Smart Bus Radar Widget & Today's Periods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Smart Bus Live Snapshot Widget */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Radio size={20} className="text-primary-600 animate-pulse" />
                Live Smart Bus Tracking
              </h2>
              <p className="text-xs text-slate-500">Live GPS tracking and stop estimated time of arrival.</p>
            </div>
            <Link href="/parent/bus-tracking" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Full Map <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-900">{busRoute}</span>
                <p className="text-[11px] text-slate-500">Vehicle: <span className="font-mono text-amber-600 font-bold">GJ-01-SB-4402</span> (Yellow Cruiser)</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live GPS Stream
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Stop</span>
                <p className="font-bold text-slate-900 truncate">{busStop}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Morning Pickup</span>
                <p className="font-bold text-emerald-600">07:15 AM</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Afternoon Drop</span>
                <p className="font-bold text-amber-600">02:45 PM</p>
              </div>
            </div>

            <Link
              href="/parent/bus-tracking"
              className="w-full py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
            >
              <MapPin size={15} /> Open Road-Snapped Navigation Map
            </Link>
          </div>
        </div>

        {/* Right Column: Ward's Day Schedule & Teacher Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <CalendarDays size={14} className="text-primary-600" /> Today&apos;s Class Schedule
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Period 1: Mathematics</span>
                  <p className="text-[11px] text-slate-500">08:30 - 09:15 AM • Room 102</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Completed</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Period 2: Science Physics</span>
                  <p className="text-[11px] text-slate-500">09:20 - 10:05 AM • Science Lab</p>
                </div>
                <span className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Period 3: English Literature</span>
                  <p className="text-[11px] text-slate-500">10:10 - 10:55 AM • Room 102</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Upcoming</span>
              </div>
            </div>
            <Link 
              href="/parent/timetable"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center justify-end gap-1 pt-1"
            >
              View Full Week Timetable <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
