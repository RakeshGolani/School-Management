'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { getParentDashboardAction } from '@/actions/parent/dashboardActions';
import ParentDashboardSkeleton from '@/components/skeletons/parent/ParentDashboardSkeleton';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import BusNotSubscribedCard from '@/components/parent/BusNotSubscribedCard';
import { notifySuccess, notifyError } from '@/lib/notify';
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
  AlertTriangle,
  Smartphone,
  BookOpen,
  Bell,
  RefreshCw,
  Info,
  Calendar,
  User,
  ArrowUpRight,
  School,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function ParentDashboardClient({ initialData }) {
  const { activeChild, childrenList, setSelectedChildIndex, selectedChildIndex } = useParentChild();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch dashboard summary on active ward change
  useEffect(() => {
    if (!activeChild?.id) return;

    let isMounted = true;
    setLoading(true);

    startTransition(async () => {
      try {
        const res = await getParentDashboardAction({
          studentId: activeChild.id
        });

        if (isMounted) {
          if (res?.success && res.data) {
            setData(res.data);
          } else {
            notifyError(res?.message || 'Failed to load ward dashboard metrics');
          }
        }
      } catch (err) {
        if (isMounted) {
          notifyError(err.message || 'Error connecting to institutional server');
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
      const res = await getParentDashboardAction({
        studentId: activeChild.id
      });
      if (res?.success && res.data) {
        setData(res.data);
        notifySuccess('Dashboard metrics & live alerts refreshed');
      } else {
        notifyError(res?.message || 'Failed to refresh dashboard');
      }
    } catch (err) {
      notifyError(err.message || 'Failed to refresh dashboard');
    } finally {
      setFetching(false);
    }
  };

  const student = data?.student || activeChild;
  const metrics = data?.metrics || {
    gate_status: 'NOT_ENTERED',
    gate_time: null,
    attendance_percentage: 96,
    attended_days: 24,
    total_working_days: 25,
    fee_pending: 0,
    fee_cleared: true,
    fee_total_allocated: 0,
    has_overdue_fee: false,
    total_today_periods: 0,
    active_day: 'TODAY'
  };
  const bus = data?.bus || {};
  const todaySchedule = data?.today_schedule || [];
  const notifications = data?.notifications || [];

  const childFullName = student?.name || 
    (student?.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Ward');
  const childClass = student?.class_name || activeChild?.grade || 'Class 10 - A';
  const admNo = student?.admission_number || 'ADM-1001';
  const rollNo = student?.roll_number ? `#${student.roll_number}` : '';

  if (loading && !data) {
    return <ParentDashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 1. Ward Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 border border-primary-200 shadow-2xs">
              <Sparkles size={14} className="text-primary-600" />
              <span>Ward Safety & Academic Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {childFullName}&apos;s Daily Overview
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed">
              Enrolled in <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">{childClass}</span> {rollNo} • Adm No: <span className="font-mono text-primary-600 font-bold">{admNo}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {bus.is_enabled && (
              <Link
                href="/parent/bus-tracking"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 active:scale-95 transition duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Bus size={16} />
                <span>Live Smart Bus Radar</span>
              </Link>
            )}
            <Link
              href="/parent/attendance"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Gate Logs</span>
            </Link>
            <button
              onClick={handleRefresh}
              disabled={fetching}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-primary-600 shadow-2xs transition flex items-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw size={15} className={fetching ? 'animate-spin text-primary-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Critical Institutional Notifications & Fee Alerts Banner */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bell size={14} className="text-primary-600" />
              <span>Important Notices & Institutional Alerts ({notifications.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {notifications.map((notif) => {
              const isUrgent = notif.type === 'URGENT';
              const isWarning = notif.type === 'WARNING';
              const isSuccess = notif.type === 'SUCCESS';

              return (
                <div 
                  key={notif.id}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex items-start gap-3.5 shadow-2xs ${
                    isUrgent 
                      ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300' 
                      : isWarning 
                        ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300' 
                        : isSuccess
                          ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-primary-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isUrgent 
                      ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                      : isWarning 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : isSuccess
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-primary-50 text-primary-700 border border-primary-200'
                  }`}>
                    {isUrgent ? <AlertCircle size={20} /> : isWarning ? <CreditCard size={19} /> : isSuccess ? <CheckCircle2 size={20} /> : <Info size={19} />}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isUrgent ? 'bg-rose-200/80 text-rose-900' : isWarning ? 'bg-amber-200/80 text-amber-900' : 'bg-emerald-200/80 text-emerald-900'
                      }`}>
                        {notif.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {notif.date ? new Date(notif.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Notice'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="pt-1.5">
                        <Link 
                          href={notif.link}
                          className="inline-flex items-center gap-1 text-xs font-black text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          <span>Take Action / View Details</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Campus Gate Status */}
        <div className="p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Gate Entry</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              metrics.gate_status === 'IN_CAMPUS' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className={`text-xl font-black flex items-center gap-2 ${
              metrics.gate_status === 'IN_CAMPUS' ? 'text-emerald-600' : metrics.gate_status === 'DEPARTED' ? 'text-amber-600' : 'text-slate-700'
            }`}>
              {metrics.gate_status === 'IN_CAMPUS' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
              {metrics.gate_status === 'IN_CAMPUS' ? 'In Campus' : metrics.gate_status === 'DEPARTED' ? 'Checked Out' : 'Expected Today'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.gate_time ? `NFC Gate swipe at ${metrics.gate_time}` : 'RFID Gate attendance pending'}
            </p>
          </div>
        </div>

        {/* Smart Bus Transit Status */}
        <div className="p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Smart Bus Fleet</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bus size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">
              {bus.is_enabled ? `Bus ${bus.bus_number}` : 'Self Transit'}
            </div>
            <p className="text-xs text-amber-600 font-semibold truncate">
              {bus.is_enabled ? `Stop: ${bus.stop_name}` : 'Not enrolled in Smart Bus'}
            </p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-primary-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">
              {metrics.attendance_percentage}%
            </div>
            <p className="text-xs text-primary-600 font-semibold">
              {metrics.attended_days} / {metrics.total_working_days} Days Attended
            </p>
          </div>
        </div>

        {/* Fees Dues Account */}
        <div className="p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Account</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              metrics.fee_cleared ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <div className={`text-xl font-black ${metrics.fee_cleared ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.fee_cleared ? 'All Cleared' : `₹ ${Number(metrics.fee_pending).toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.fee_cleared ? 'No Pending Dues' : (metrics.has_overdue_fee ? '⚠ Overdue Warning' : 'Upcoming Term Dues')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Main Grid: Smart Bus Radar Widget & Today's Periods Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Smart Bus Radar Snapshot */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Radio size={20} className="text-primary-600 animate-pulse" />
                Live Smart Bus Tracking
              </h2>
              <p className="text-xs text-slate-500">Live GPS tracking and stop estimated time of arrival.</p>
            </div>
            {bus.is_enabled && (
              <Link href="/parent/bus-tracking" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Full Map <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {bus.is_enabled ? (
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{bus.route_name}</h3>
                  <p className="text-[11px] text-slate-500">Vehicle: <span className="font-mono font-bold text-slate-800">{bus.bus_number}</span> ({bus.plate_number})</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                  ● {bus.current_status || 'ON ROUTE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pickup Scheduled</span>
                  <div className="text-sm font-black text-slate-900 font-mono">{bus.pickup_time}</div>
                  <span className="text-[10px] text-slate-500 truncate block">{bus.stop_name}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Afternoon Drop</span>
                  <div className="text-sm font-black text-slate-900 font-mono">{bus.drop_off_time}</div>
                  <span className="text-[10px] text-slate-500 truncate block">{bus.stop_name}</span>
                </div>
              </div>

              <Link
                href="/parent/bus-tracking"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-primary-50 text-primary-700 font-black text-xs border border-primary-200 shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MapPin size={14} />
                <span>Open Road-Snapped Navigation Map</span>
              </Link>
            </div>
          ) : (
            <BusNotSubscribedCard
              wardName={childFullName}
              schoolPhone={data?.school?.phone || '+91 9876543200'}
              schoolEmail={data?.school?.email || 'transport@greenwood.edu'}
              className="max-w-none p-6 sm:p-7"
            />
          )}
        </div>

        {/* Right Column: Today's Academic Timetable Schedule */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <CalendarDays size={20} className="text-primary-600" />
                  Today&apos;s Classes
                </h2>
                <p className="text-xs text-slate-500">{metrics.active_day} academic schedule & lectures.</p>
              </div>
              <Link href="/parent/timetable" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                Full Week <ChevronRight size={14} />
              </Link>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <CalendarDays size={32} className="text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No Classes Today</h4>
                <p className="text-xs text-slate-400">No scheduled periods for {metrics.active_day}.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {todaySchedule.map((p, idx) => {
                  // Compute whether this period is actively ongoing right now
                  let isCurrentPeriod = false;
                  if (p.start_time && p.end_time) {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();

                    const [startH, startM] = p.start_time.split(':').map(Number);
                    const [endH, endM] = p.end_time.split(':').map(Number);

                    const startTotal = startH * 60 + (startM || 0);
                    const endTotal = endH * 60 + (endM || 0);

                    if (currentMinutes >= startTotal && currentMinutes <= endTotal) {
                      isCurrentPeriod = true;
                    }
                  }

                  return (
                    <div 
                      key={p.id || idx}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrentPeriod
                          ? 'bg-primary-50/50 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                          : 'bg-white border-slate-200 shadow-2xs hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-mono shadow-2xs shrink-0 ${
                          isCurrentPeriod
                            ? 'bg-primary-600 text-white shadow-primary-500/30'
                            : p.is_break 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-primary-50 text-primary-700 border border-primary-200/60'
                        }`}>
                          {p.is_break ? 'B' : `P${p.period}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-black ${isCurrentPeriod ? 'text-primary-900 font-extrabold' : 'text-slate-900'}`}>
                              {p.subject}
                            </h4>
                            {isCurrentPeriod && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Ongoing Now</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{p.teacher}</span> • <span className="font-semibold text-slate-700">{p.room}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-xl border whitespace-nowrap ${
                        isCurrentPeriod
                          ? 'bg-primary-100 text-primary-800 border-primary-300 font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200/80'
                      }`}>
                        {p.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {student?.class_teacher && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mt-auto">
              <span className="font-semibold">Class Teacher:</span>
              <span className="font-bold text-slate-900">{student.class_teacher.name}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
