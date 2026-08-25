'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Navigation, 
  User, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Building, 
  PhoneCall, 
  Compass,
  ArrowRight,
  CreditCard,
  Search,
  X,
  ArrowDownRight,
  ArrowUpRight,
  Route
} from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import { getStudentTransportAction } from '@/actions/student/transportActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function StudentTransportClient({ initialUser, initialData }) {
  const [data, setData] = useState(initialData);
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEnabled = Boolean(data?.is_bus_service_enabled);
  const route = data?.route;
  const assignedStop = data?.assigned_stop;
  const bus = data?.bus;
  const allStops = data?.all_stops || [];
  const school = data?.school;
  const studentInfo = data?.student_info || initialUser;
  const attendanceLogs = data?.attendance_logs || [];

  // Filter state for bus attendance journeys
  const [selectedTripFilter, setSelectedTripFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleRefresh = () => {
    setFetching(true);
    startTransition(async () => {
      try {
        const res = await getStudentTransportAction();
        if (res.success && res.data) {
          setData(res.data);
          notifySuccess('Smart Bus telemetry updated');
        } else {
          notifyError(res.message || 'Failed to refresh transport details');
        }
      } catch (err) {
        console.error('Error refreshing transport:', err);
        notifyError('Failed to refresh transport details');
      } finally {
        setFetching(false);
      }
    });
  };

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTripFilter]);

  // Filtered bus journeys
  const filteredLogs = attendanceLogs.filter(l => {
    const matchesFilter = selectedTripFilter === 'ALL' || 
      (selectedTripFilter === 'MORNING' && l.trip_type === 'morning_pickup') ||
      (selectedTripFilter === 'AFTERNOON' && l.trip_type === 'afternoon_drop') ||
      (selectedTripFilter === 'COMPLETED' && l.status === 'COMPLETED');

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (l.date && l.date.toLowerCase().includes(term)) ||
      (l.in_stop && l.in_stop.toLowerCase().includes(term)) ||
      (l.out_stop && l.out_stop.toLowerCase().includes(term)) ||
      (l.bus_number && l.bus_number.toLowerCase().includes(term)) ||
      (l.trip_label && l.trip_label.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  const totalRecords = filteredLogs.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Filter tab definitions
  const filterTabs = [
    { key: 'ALL', label: 'All Trips', count: attendanceLogs.length },
    { key: 'MORNING', label: 'Morning Pickup', count: attendanceLogs.filter(l => l.trip_type === 'morning_pickup').length },
    { key: 'AFTERNOON', label: 'Afternoon Drop', count: attendanceLogs.filter(l => l.trip_type === 'afternoon_drop').length },
    { key: 'COMPLETED', label: 'Completed', count: attendanceLogs.filter(l => l.status === 'COMPLETED').length }
  ];

  // DataTable columns for Smart Bus Unified IN & OUT Attendance
  const columns = [
    {
      header: 'Date & Session',
      accessor: 'date',
      className: 'w-[20%]',
      render: (row) => {
        const isMorning = row.trip_type === 'morning_pickup';

        return (
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-500/20 text-primary-700 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {row.day || 'Day'}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                {row.date}
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider mt-0.5 px-2 py-0.2 rounded-full ${
                isMorning ? 'bg-amber-100/80 text-amber-900' : 'bg-indigo-100/80 text-indigo-900'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isMorning ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                <span>{row.trip_label}</span>
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Boarding (IN)',
      accessor: 'in_time',
      className: 'w-[25%]',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs">
              <ArrowDownRight size={11} className="text-emerald-600" />
              <span>IN</span>
            </span>
            <span className="font-mono text-xs font-black text-emerald-950 bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-100">
              {row.in_time}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1 pl-0.5">
            <MapPin size={12} className="text-emerald-600 shrink-0" />
            <span className="truncate">{row.in_stop}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Deboarding (OUT)',
      accessor: 'out_time',
      className: 'w-[25%]',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200/70 shadow-2xs">
              <ArrowUpRight size={11} className="text-blue-600" />
              <span>OUT</span>
            </span>
            <span className="font-mono text-xs font-black text-blue-950 bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100">
              {row.out_time}
            </span>
          </div>
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1 pl-0.5">
            <Building size={12} className="text-blue-600 shrink-0" />
            <span className="truncate">{row.out_stop}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      className: 'w-[14%]',
      render: (row) => {
        const isCompleted = row.status === 'COMPLETED';

        return (
          <div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>Completed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs animate-pulse">
                <Radio size={11} className="text-amber-600" />
                <span>On Board</span>
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Vehicle & Driver',
      accessor: 'bus_number',
      className: 'w-[16%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-black text-slate-900 flex items-center gap-1">
            <Bus size={12} className="text-amber-600 shrink-0" />
            <span>{row.bus_number}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {row.driver_name}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-24 sm:pb-8">
      
      {/* 1. Mobile-Specific Compact App Header (< sm) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 border border-slate-100 space-y-2.5 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-700">
            <Bus size={11} className="text-primary-600 shrink-0" />
            <span>Transit & Smart Bus</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50 min-w-[30px] min-h-[30px] flex items-center justify-center"
            title="Refresh Transport"
          >
            <RefreshCw size={13} className={fetching ? 'animate-spin text-primary-600' : ''} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 leading-tight truncate">
              {route?.route_name || (isEnabled ? 'Assigned Smart Bus' : 'Transport Service')}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold truncate mt-0.5">
              {studentInfo?.class ? `${studentInfo.class} • Roll #${studentInfo.roll_number || '01'}` : 'Transit Access'}
            </p>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/70 shadow-2xs text-center shrink-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
              isEnabled ? 'text-emerald-700' : 'text-slate-500'
            }`}>
              <Radio size={10} className={isEnabled ? 'text-emerald-600 animate-pulse' : 'text-slate-400'} />
              <span>{isEnabled ? 'Active' : 'Inactive'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 1b. Desktop / Tablet Header Banner (>= sm) */}
      <div className="hidden sm:flex p-6 md:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 items-center justify-between gap-4 border border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700">
            <Bus size={12} className="text-primary-600 shrink-0" />
            <span>Transit & Smart Bus Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
            {route?.route_name || (isEnabled ? 'Assigned Smart Bus Transit' : 'Transit Service Details')}
          </h1>
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
            {studentInfo?.class && (
              <>
                <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">
                  {studentInfo.class}
                </span>
                <span className="text-slate-300">•</span>
              </>
            )}
            <span>Roll #{studentInfo?.roll_number || '01'}</span>
            {route?.route_code && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-mono font-bold text-slate-700">Route Code: {route.route_code}</span>
              </>
            )}
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <Radio size={11} className="text-emerald-600 animate-pulse" /> Live Fleet Tracking Enabled
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={fetching}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-700 hover:text-primary-600 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px]"
        >
          <RefreshCw size={15} className={fetching ? 'animate-spin text-primary-600' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {isEnabled ? (
        <>
          {/* 2. Top Metric Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            
            {/* Card 1: Assigned Stop & Schedule */}
            <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3.5">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-500 to-primary-600 rounded-l-[inherit]" />
              
              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <MapPin size={15} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Assigned Stop
                  </h3>
                </div>
                {assignedStop?.sequence && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-50 text-primary-700 border border-primary-200/50">
                    Stop #{assignedStop.sequence}
                  </span>
                )}
              </div>

              <div className="pl-1">
                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {assignedStop?.stop_name || 'Assigned Transit Stop'}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {route?.route_name || 'Assigned Highway Route'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 pl-1">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/50 space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 block">Morning Pickup</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-950 block">
                    {assignedStop?.pickup_time || '--'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/50 space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">Afternoon Drop</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-amber-950 block">
                    {assignedStop?.drop_off_time || '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Vehicle & Driver Contact */}
            <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3.5">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-l-[inherit]" />

              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <Bus size={15} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Smart Bus & Crew
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  {bus?.status || 'Active Fleet'}
                </span>
              </div>

              <div className="pl-1">
                <div className="font-mono text-base font-black text-slate-900 leading-snug">
                  {bus?.bus_number || 'MH-02-AZ-1111'}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  GPS Telemetry Device Linked
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 pl-2.5">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                    <User size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {bus?.driver_name || 'Mr. Ramesh Singh'}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Primary Fleet Driver
                    </span>
                  </div>
                </div>

                {bus?.driver_phone && (
                  <a
                    href={`tel:${bus.driver_phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shrink-0 shadow-2xs transition"
                  >
                    <PhoneCall size={12} className="text-amber-700" />
                    <span>Call Driver</span>
                  </a>
                )}
              </div>
            </div>

            {/* Card 3: NFC Pass & Campus Support */}
            <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3.5 md:col-span-2 lg:col-span-1">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-l-[inherit]" />

              <div className="flex items-center justify-between pl-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    <CreditCard size={15} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Digital NFC Tap Pass
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                  Verified
                </span>
              </div>

              <div className="pl-1">
                <div className="font-mono text-xs sm:text-sm font-black text-slate-900 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-sans font-bold">NFC Card UID:</span>
                  <span className="text-primary-700">{studentInfo?.nfc_card_uid || 'STUDENT_CARD_001'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 pl-1">
                <div className="flex items-center gap-1.5">
                  <Building size={13} className="text-primary-600 shrink-0" />
                  <span className="font-bold truncate">{school?.name || 'Greenwood Campus Desk'}</span>
                </div>
                {school?.phone && (
                  <a href={`tel:${school.phone}`} className="font-mono font-bold text-primary-700 hover:underline shrink-0">
                    {school.phone}
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* 3. Complete Route Stops Timeline */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white shadow-xs border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Compass size={16} className="text-primary-600 shrink-0" />
                  <span>Route Stops Timeline & Sequence</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {route?.route_name || 'All Transit Stops'} ({allStops.length} Total Sequenced Stops)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>My Assigned Stop</span>
                </span>
              </div>
            </div>

            {/* Stops Grid / List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {allStops.map((stop, idx) => {
                const isMyStop = stop.is_my_stop;

                return (
                  <div
                    key={stop.id || idx}
                    className={`relative overflow-hidden p-3.5 sm:p-4 rounded-2xl transition-all border flex flex-col justify-between space-y-2.5 shadow-2xs ${
                      isMyStop
                        ? 'bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50/80 border-slate-200/60 hover:bg-white hover:border-primary-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                        isMyStop ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{stop.sequence || (idx + 1)}
                      </span>

                      {isMyStop ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 size={10} /> My Stop
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">
                          Stop #{stop.sequence || (idx + 1)}
                        </span>
                      )}
                    </div>

                    {/* Stop Name */}
                    <div>
                      <h4 className={`text-xs sm:text-sm font-black leading-tight truncate ${
                        isMyStop ? 'text-emerald-950' : 'text-slate-800'
                      }`}>
                        {stop.stop_name}
                      </h4>
                    </div>

                    {/* Timings */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Clock size={10} /> {stop.pickup_time || '--'}
                      </span>
                      <span className="text-amber-700">
                        {stop.drop_off_time || '--'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Smart Bus NFC Unified IN & OUT Attendance Logs */}
          <div className="space-y-3.5">
            {/* Filter Tabs & Search Bar */}
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-xs space-y-3 border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Filter Pills */}
                <div className="p-1 bg-slate-100/90 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
                  {filterTabs.map(tab => {
                    const isSelected = selectedTripFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedTripFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25 scale-[1.02]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by date, stop, bus plate..."
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
              </div>
            </div>

            {/* Mobile Cards View (< md) */}
            <div className="block md:hidden space-y-3">
              {filteredLogs.map((log) => {
                const isCompleted = log.status === 'COMPLETED';
                const isMorning = log.trip_type === 'morning_pickup';

                return (
                  <div
                    key={log.key || log.id}
                    className="p-4 rounded-2xl bg-white shadow-xs border border-slate-100 space-y-3 transition"
                  >
                    {/* Header: Date + Trip Type + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                          {log.day || 'Day'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                            {log.date}
                          </h4>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
                            isMorning ? 'text-amber-800' : 'text-indigo-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isMorning ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                            {log.trip_label}
                          </span>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}>
                        <CheckCircle2 size={11} />
                        <span>{log.status_label}</span>
                      </span>
                    </div>

                    {/* Visual 2-Step Journey Timeline */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                      {/* Step 1: IN (Boarded) */}
                      <div className="flex items-start gap-2.5">
                        <div className="flex flex-col items-center shrink-0">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                            <ArrowDownRight size={11} />
                          </span>
                          <span className="w-0.5 h-6 bg-slate-200 my-0.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                              Boarded (IN)
                            </span>
                            <span className="font-mono text-xs font-black text-emerald-950 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                              {log.in_time}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                            {log.in_stop}
                          </p>
                        </div>
                      </div>

                      {/* Step 2: OUT (Deboarded) */}
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0">
                          <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                            <ArrowUpRight size={11} />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
                              Deboarded (OUT)
                            </span>
                            <span className="font-mono text-xs font-black text-blue-950 bg-blue-100/60 px-1.5 py-0.2 rounded">
                              {log.out_time}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                            {log.out_stop}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Bus Plate & Driver */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                        <Bus size={11} className="text-amber-600" />
                        <span>{log.bus_number}</span>
                      </span>
                      <span>Driver: {log.driver_name}</span>
                    </div>
                  </div>
                );
              })}

              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl shadow-xs border border-slate-100">
                  No transit journey records found matching filter.
                </div>
              )}
            </div>

            {/* Desktop / Web Table View (Rule 1: Reusable DataTable Component) */}
            <div className="hidden md:block">
              <Card
                title="Smart Bus NFC Boarding & Deboarding Logs"
                subtitle={`Automated in/out gate attendance per journey (${totalRecords} Total Trips)`}
                icon={Bus}
              >
                <DataTable
                  columns={columns}
                  data={paginatedLogs}
                  loading={fetching}
                  emptyMessage="No transit attendance scan logs recorded yet."
                  pagination={{
                    currentPage,
                    pageSize,
                    totalRecords,
                    totalPages,
                    onPageChange: (page) => setCurrentPage(page),
                    onPageSizeChange: (size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }
                  }}
                />
              </Card>
            </div>
          </div>
        </>
      ) : (
        /* Not Enrolled Banner */
        <div className="p-8 sm:p-14 text-center rounded-2xl sm:rounded-3xl bg-white shadow-xs border border-slate-100 space-y-3 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60">
            <Bus size={24} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">Smart Bus Transit Not Enrolled</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              You are currently registered as a private commuter. If you require School Bus transit, GPS tracking, and automated NFC gate access, please contact the campus transport administration desk.
            </p>
          </div>
          {school?.phone && (
            <div className="pt-2">
              <a
                href={`tel:${school.phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs shadow-xs hover:bg-primary-700 transition"
              >
                <Phone size={13} />
                <span>Contact Transport Desk ({school.phone})</span>
              </a>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
