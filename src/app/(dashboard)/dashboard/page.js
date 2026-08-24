'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Bus, 
  CreditCard, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  ChevronRight, 
  Radio as RadioIcon, 
  Plus, 
  Calendar,
  Layers,
  PhoneCall,
  ShieldCheck,
  RefreshCw,
  Zap,
  TrendingUp,
  Sliders
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { usePackage } from '@/context/PackageContext';
import { getSchoolDashboardAction } from '@/actions/school/dashboardActions';
import SchoolDashboardSkeleton from '@/components/skeletons/school/SchoolDashboardSkeleton';

// Dynamically load the Leaflet Map component with SSR disabled
const LiveTrackingMap = dynamic(
  () => import('@/app/(dashboard)/transport/LiveTrackingMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full rounded-2xl bg-slate-100/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Bus className="w-8 h-8 animate-bounce text-primary-500" />
        <p className="text-sm font-semibold">Loading Live GPS Campus Map...</p>
      </div>
    )
  }
);

/**
 * Ultra-Premium School Dashboard
 * Unified Real-Time Command Center that adaptively renders according to the school's assigned package.
 */
export default function Dashboard() {
  const { activeYear } = useAcademicYear();
  const { hasModule, isTransportOnly, isSchoolOnly, isFullSuite, packageInfo } = usePackage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardMetrics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {};
      if (activeYear?.id) params.academic_year_id = activeYear.id;

      const res = await getSchoolDashboardAction(params);
      if (res && res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeYear?.id]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  if (loading && !dashboardData) {
    return <SchoolDashboardSkeleton />;
  }

  const { stats, attendanceToday, fees, buses, recentAdmissions, subscription } = dashboardData || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Ultra-Premium Top Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="emerald" dot font-bold>
              {isTransportOnly ? 'Fleet GPS Live' : 'Campus Live'}
            </Badge>
            {hasModule('academic_years') && activeYear && (
              <Badge variant="primary" icon={Calendar}>
                Academic Year {activeYear.year_name}
              </Badge>
            )}
            <Badge variant="slate" icon={Zap}>
              {packageInfo?.name || 'Standard Plan'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isTransportOnly ? 'Smart Bus Fleet Command Center' : isSchoolOnly ? 'School Academic Command Center' : 'School Command Center'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {isTransportOnly 
              ? 'Real-time vehicle telemetry, live road-snapped bus tracking, driver assignments, and NFC transit logs.'
              : isSchoolOnly
              ? 'Real-time overview of student admissions, classroom attendance records, academic sessions, and fee collections.'
              : 'Real-time overview of student admissions, smart fleet GPS coordinates, daily gate attendance, and fee collections.'
            }
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            icon={RefreshCw} 
            loading={refreshing}
            onClick={() => fetchDashboardMetrics(true)}
          >
            Refresh
          </Button>

          {hasModule('transport') && (
            <Link href="/transport">
              <Button variant="secondary" size="sm" icon={Bus}>
                Live Map
              </Button>
            </Link>
          )}

          {hasModule('fees') && (
            <Link href="/fees">
              <Button variant="secondary" size="sm" icon={CreditCard}>
                Fee Portal
              </Button>
            </Link>
          )}

          <Link href="/students">
            <Button variant="primary" size="sm" icon={Plus}>
              {isTransportOnly ? 'Add Commuter' : 'New Student'}
            </Button>
          </Link>
        </div>

        {/* Subtle Decorative Background Glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Four Core Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Students / Commuters */}
        <Link href="/students" className="group block">
          <Card 
            title={isTransportOnly ? "Bus Commuters" : "Total Students"} 
            icon={Users} 
            action={
              <span className="w-7 h-7 rounded-lg bg-primary-50 border border-primary-200/60 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                <ArrowUpRight size={14} />
              </span>
            }
          >
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.totalStudents ?? 0}
                </p>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  {isTransportOnly ? 'Commuters' : 'Enrolled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isTransportOnly ? `Assigned to ${stats?.totalRoutes ?? 0} Bus Routes` : `Across ${stats?.totalClasses ?? 0} Class Sections`}
              </p>
            </div>
          </Card>
        </Link>

        {/* Card 2: Faculty Staff (or Total Fleet if Transport Only) */}
        {isTransportOnly ? (
          <Link href="/transport" className="group block">
            <Card 
              title="Active Fleet Buses" 
              icon={Bus} 
              action={
                <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                  <ArrowUpRight size={14} />
                </span>
              }
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.busesOnRoad ?? 0}
                  </p>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                    On Duty
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Out of {stats?.totalBuses ?? 0} Registered Buses
                </p>
              </div>
            </Card>
          </Link>
        ) : (
          <Link href="/teachers" className="group block">
            <Card 
              title="Faculty Staff" 
              icon={GraduationCap} 
              action={
                <span className="w-7 h-7 rounded-lg bg-primary-50 border border-primary-200/60 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                  <ArrowUpRight size={14} />
                </span>
              }
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.totalTeachers ?? 0}
                  </p>
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200/60 px-2 py-0.5 rounded-full">
                    Certified
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  100% Class Allocation
                </p>
              </div>
            </Card>
          </Link>
        )}

        {/* Card 3: Attendance (or Total Routes if Transport Only) */}
        {isTransportOnly ? (
          <Link href="/transport" className="group block">
            <Card 
              title="Active Bus Routes" 
              icon={Layers} 
              action={
                <Badge variant="emerald" size="sm">
                  100% Online
                </Badge>
              }
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.totalRoutes ?? 0}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                    Scheduled
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Covering all pickup & drop stops
                </p>
              </div>
            </Card>
          </Link>
        ) : (
          <Link href="/attendance" className="group block">
            <Card 
              title="Today's Attendance" 
              icon={CheckCircle2} 
              action={
                <Badge variant={attendanceToday?.attendanceRate >= 90 ? 'emerald' : 'amber'} dot size="sm">
                  {attendanceToday?.attendanceRate ?? 100}%
                </Badge>
              }
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {attendanceToday?.present ?? 0}
                  </p>
                  <span className="text-xs text-slate-400 font-medium">
                    / {attendanceToday?.totalMarked ?? (stats?.totalStudents || 0)} Marked
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {attendanceToday?.absent ?? 0} Absent • {attendanceToday?.late ?? 0} Late Check-in
                </p>
              </div>
            </Card>
          </Link>
        )}

        {/* Card 4: Fee Collection (or GPS Telemetry if Transport Only) */}
        {hasModule('fees') ? (
          <Link href="/fees" className="group block">
            <Card 
              title="Fee Collections" 
              icon={CreditCard} 
              action={
                <Badge variant="emerald" size="sm">
                  {fees?.collectionRate ?? 0}% Paid
                </Badge>
              }
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400">₹</span>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {Number(fees?.totalPaid || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-xs text-rose-500 font-medium truncate">
                  ₹{Number(fees?.totalPending || 0).toLocaleString('en-IN')} Balance Pending
                </p>
              </div>
            </Card>
          </Link>
        ) : (
          <Link href="/transport" className="group block">
            <Card 
              title="GPS Telemetry Signal" 
              icon={RadioIcon} 
              action={
                <Badge variant="emerald" dot size="sm">
                  Live
                </Badge>
              }
            >
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-emerald-600 tracking-tight">
                    Active
                  </p>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate">
                  Real-time telemetry 0ms latency
                </p>
              </div>
            </Card>
          </Link>
        )}
      </div>

      {/* 3. Primary Centerpiece Grid: Live Smart Bus GPS Map & Today's Gate Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Smart Bus GPS Tracking Map (if Transport enabled) */}
        {hasModule('transport') ? (
          <div className={hasModule('attendance') ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
            <Card 
              title="Smart Bus Fleet & Live GPS Campus Map" 
              icon={Bus} 
              subtitle="Real-time vehicle movement, speed telemetry & route stops"
              action={
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" dot font-bold>
                    {stats?.busesOnRoad ?? 0} of {stats?.totalBuses ?? 0} Active
                  </Badge>
                  <Link href="/transport">
                    <Button variant="outline" size="sm" icon={ArrowUpRight}>
                      Full Transport
                    </Button>
                  </Link>
                </div>
              }
            >
              <div className="space-y-4">
                {/* Interactive Leaflet Map Container */}
                <LiveTrackingMap 
                  initialSchoolLocation={dashboardData?.schoolLocation} 
                  initialRoutes={dashboardData?.routes} 
                />

                {/* Fleet Quick Status Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Fleet</p>
                      <p className="text-lg font-black text-slate-900">{stats?.totalBuses ?? 0} Buses</p>
                    </div>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs">
                      {stats?.totalRoutes ?? 0} Routes
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GPS Live Signal</p>
                      <p className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Connected
                      </p>
                    </div>
                    <Badge variant="emerald" size="sm">0ms Delay</Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Smart Transit</p>
                      <p className="text-lg font-black text-primary-600">Active</p>
                    </div>
                    <Link href="/transport">
                      <span className="text-xs font-bold text-primary-600 hover:underline">
                        Live Fleet →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Academic Class Overview Card when Transport is disabled (School ERP Only) */
          <div className="lg:col-span-8 space-y-6">
            <Card
              title="Academic Class Sections & Student Strength"
              icon={BookOpen}
              subtitle="Overview of class teacher podiums and active sections"
              action={
                <Link href="/classes">
                  <Button variant="outline" size="sm" icon={ArrowUpRight}>
                    View All Classes
                  </Button>
                </Link>
              }
            >
              <div className="p-6 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                <BookOpen className="w-10 h-10 mx-auto text-primary-500/80 mb-2" />
                <h4 className="text-sm font-bold text-slate-800">
                  {stats?.totalClasses || 0} Active Classes & Sections
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Managing curriculum, student enrollments, timetable allocations, and classroom attendance.
                </p>
                <div className="pt-2">
                  <Link href="/classes">
                    <Button variant="primary" size="sm">
                      Manage Classes
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Right Column: Live Gate Scan Feed & Attendance Breakdown (4 Cols) */}
        {hasModule('attendance') && (
          <div className="lg:col-span-4 space-y-6">
            <Card 
              title="Live Attendance Stream" 
              icon={RadioIcon} 
              subtitle="Campus terminal RFID / NFC card stream"
              action={
                <Badge variant="primary" dot>
                  Live Feed
                </Badge>
              }
            >
              <div className="space-y-4">
                {/* Daily Attendance Progress Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50/50 to-slate-50 border border-primary-100/60 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Today&apos;s Gate Completion</span>
                    <span className="text-primary-700 font-extrabold">{attendanceToday?.attendanceRate ?? 100}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${attendanceToday?.attendanceRate ?? 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
                    <span className="text-emerald-700 font-bold">● {attendanceToday?.present ?? 0} Present</span>
                    <span className="text-amber-700 font-bold">● {attendanceToday?.late ?? 0} Late</span>
                    <span className="text-rose-700 font-bold">● {attendanceToday?.absent ?? 0} Absent</span>
                  </div>
                </div>

                {/* Real-time NFC Logs List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {attendanceToday?.recentScans && attendanceToday.recentScans.length > 0 ? (
                    attendanceToday.recentScans.map((scan) => (
                      <div 
                        key={scan.id} 
                        className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar box (Rule 15) */}
                          <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden bg-primary-50 text-primary-600 border border-primary-500/20 font-black text-sm flex items-center justify-center">
                            {scan.photo ? (
                              <img 
                                src={scan.photo} 
                                alt={scan.student_name} 
                                className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10" 
                              />
                            ) : (
                              <span>{scan.student_name?.charAt(0)?.toUpperCase() || 'S'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                              {scan.student_name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                              {scan.grade} • {scan.admission_number}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <Badge 
                            variant={scan.status === 'present' ? 'emerald' : scan.status === 'late' ? 'amber' : 'rose'} 
                            size="sm"
                          >
                            {scan.status?.toUpperCase()}
                          </Badge>
                          <p className="text-[9px] text-slate-400 mt-1 font-semibold flex items-center justify-end gap-1">
                            <Clock size={10} />
                            {scan.check_in ? new Date(scan.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Gate'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-1">
                      <RadioIcon className="w-7 h-7 mx-auto opacity-50 mb-2" />
                      <p className="text-xs font-bold text-slate-600">No NFC Swipes Yet Today</p>
                      <p className="text-[11px]">Gate terminal is online and awaiting check-ins.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 4. Bottom Grid: Fee Revenue & Recent Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Fee Collection Overview (if Fees enabled) */}
        {hasModule('fees') ? (
          <div className="lg:col-span-6 space-y-6">
            <Card 
              title="Fee Revenue & Payment Receipts" 
              icon={CreditCard} 
              subtitle="Financial collection tracking & recent transactions"
              action={
                <Link href="/fees">
                  <Button variant="outline" size="sm" icon={ArrowUpRight}>
                    View All Fees
                  </Button>
                </Link>
              }
            >
              <div className="space-y-4">
                {/* Fee Target Breakdown Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Total Billed: ₹{Number(fees?.totalAllocated || 0).toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600 font-extrabold">{fees?.collectionRate ?? 0}% Recovered</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${fees?.collectionRate ?? 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                    <span className="text-emerald-700">Collected: ₹{Number(fees?.totalPaid || 0).toLocaleString('en-IN')}</span>
                    <span className="text-rose-600">Pending: ₹{Number(fees?.totalPending || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Recent Fee Payments Table */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Transactions</p>
                  {fees?.recentPayments && fees.recentPayments.length > 0 ? (
                    fees.recentPayments.map((p) => (
                      <div 
                        key={p.id} 
                        className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                            ₹
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {p.student_name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {p.receipt_number} • {p.category_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-emerald-600">
                            +₹{Number(p.amount_paid).toLocaleString('en-IN')}
                          </p>
                          <Badge variant="slate" size="sm" className="mt-0.5">
                            {p.payment_mode?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs font-medium">
                      No fee payments recorded recently.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Transport Fleet Route Status (when Fees disabled) */
          <div className="lg:col-span-6 space-y-6">
            <Card
              title="Bus Transit Routes & Stops"
              icon={Bus}
              subtitle="Overview of registered pickup routes and stops"
              action={
                <Link href="/transport">
                  <Button variant="outline" size="sm" icon={ArrowUpRight}>
                    Manage Routes
                  </Button>
                </Link>
              }
            >
              <div className="p-6 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                <Bus className="w-10 h-10 mx-auto text-amber-500/80 mb-2" />
                <h4 className="text-sm font-bold text-slate-800">
                  {stats?.totalRoutes || 0} Registered Transit Routes
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Fleet telemetry running with road-snapped polylines and student stop assignments.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Right Column: Recent Admissions / Commuters (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card 
            title={isTransportOnly ? "Recent Bus Commuters" : "Recent Student Admissions"} 
            icon={Users} 
            subtitle={isTransportOnly ? "Newly registered bus riders" : "Newly enrolled students in the active academic session"}
            action={
              <Link href="/students">
                <Button variant="outline" size="sm" icon={Plus}>
                  {isTransportOnly ? "Add Commuter" : "Admit Student"}
                </Button>
              </Link>
            }
          >
            <div className="space-y-4">
              {/* Subscription Usage Gauge */}
              {subscription && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      Plan: {subscription.plan_name}
                    </span>
                    <span className="text-amber-400 font-black">
                      {subscription.current_students_count} / {subscription.max_students_limit} Students
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary-400 to-emerald-400 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${subscription.usage_percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {subscription.max_students_limit - subscription.current_students_count} Student slots remaining in current subscription.
                  </p>
                </div>
              )}

              {/* Recent Admissions List */}
              <div className="space-y-2.5">
                {recentAdmissions && recentAdmissions.length > 0 ? (
                  recentAdmissions.map((student) => (
                    <Link 
                      key={student.id} 
                      href={`/students/${student.id}`} 
                      className="block group"
                    >
                      <div className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar box (Rule 15) */}
                          <div className="w-9 h-9 rounded-xl relative shrink-0 overflow-hidden bg-primary-50 text-primary-600 border border-primary-500/20 font-black text-xs flex items-center justify-center">
                            {student.image_url || student.photo ? (
                              <img 
                                src={student.image_url || student.photo} 
                                alt={student.name || student.first_name} 
                                className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10" 
                              />
                            ) : (
                              <span>{(student.name || student.first_name || 'S').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                              {student.name || `${student.first_name} ${student.last_name}`}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {student.grade || 'Grade 10'} • {student.admission_number}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {student.is_bus_service_enabled && (
                            <Badge variant="amber" size="sm" icon={Bus}>Bus</Badge>
                          )}
                          <ChevronRight size={14} className="text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-400 text-xs font-medium">
                    No recent records found.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
