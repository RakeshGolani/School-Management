'use client';

import { useState, useEffect, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { getParentBusTrackingAction } from '@/actions/parent/transportActions';
import ParentBusTrackingSkeleton from '@/components/skeletons/parent/ParentBusTrackingSkeleton';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import BusNotSubscribedCard from '@/components/parent/BusNotSubscribedCard';
import { notifySuccess, notifyError } from '@/lib/notify';
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
  Route,
  UserCheck
} from 'lucide-react';

// Dynamically import ParentLiveTrackingMap with SSR disabled
const ParentLiveTrackingMap = dynamic(() => import('./ParentLiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 sm:h-[440px] rounded-2xl sm:rounded-3xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
      <Bus size={32} className="animate-bounce text-slate-300" />
      <span className="text-xs font-bold">Initializing Live Road Navigation Map...</span>
    </div>
  )
});

export default function ParentBusTrackingClient({ initialData }) {
  const { activeChild, childrenList } = useParentChild();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filter state for bus attendance journeys
  const [selectedTripFilter, setSelectedTripFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch transport data whenever active ward changes
  useEffect(() => {
    if (!activeChild?.id) return;

    let isMounted = true;
    setLoading(true);

    getParentBusTrackingAction(activeChild.id)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching ward transport:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeChild?.id]);

  const handleRefresh = () => {
    if (!activeChild?.id) return;
    setFetching(true);
    startTransition(async () => {
      try {
        const res = await getParentBusTrackingAction(activeChild.id);
        if (res.success && res.data) {
          setData(res.data);
          notifySuccess('Smart Bus telemetry refreshed');
        } else {
          notifyError(res.message || 'Failed to refresh telemetry');
        }
      } catch (err) {
        console.error('Error refreshing telemetry:', err);
        notifyError('Failed to refresh telemetry');
      } finally {
        setFetching(false);
      }
    });
  };

  const isEnabled = Boolean(data?.is_bus_service_enabled);
  const route = data?.route;
  const assignedStop = data?.assigned_stop;
  const bus = data?.bus;
  const allStops = data?.all_stops || [];
  const school = data?.school;
  const studentInfo = data?.student_info || activeChild;
  const attendanceLogs = data?.attendance_logs || [];

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTripFilter]);

  // Filtered bus journeys
  const filteredLogs = attendanceLogs.filter((l) => {
    const matchesFilter =
      selectedTripFilter === 'ALL' ||
      (selectedTripFilter === 'MORNING' && l.trip_type === 'morning_pickup') ||
      (selectedTripFilter === 'AFTERNOON' && l.trip_type === 'afternoon_drop') ||
      (selectedTripFilter === 'COMPLETED' && l.status === 'COMPLETED');

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
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
    { key: 'MORNING', label: 'Morning Pickup', count: attendanceLogs.filter((l) => l.trip_type === 'morning_pickup').length },
    { key: 'AFTERNOON', label: 'Afternoon Drop', count: attendanceLogs.filter((l) => l.trip_type === 'afternoon_drop').length },
    { key: 'COMPLETED', label: 'Completed', count: attendanceLogs.filter((l) => l.status === 'COMPLETED').length }
  ];

  // DataTable columns for Smart Bus Unified IN & OUT Attendance
  const columns = [
    {
      header: 'Date & Session',
      accessor: 'date',
      className: 'w-[20%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
            <span>{row.date}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <span className="uppercase text-slate-400 font-bold">{row.day}</span>
            <span>•</span>
            <span className={row.trip_type === 'morning_pickup' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              {row.trip_label}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Boarding (IN)',
      accessor: 'in_time',
      className: 'w-[25%]',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-black text-emerald-800 flex items-center gap-1">
            <ArrowUpRight size={13} className="text-emerald-600 shrink-0" />
            <span>{row.in_time}</span>
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
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-black text-blue-800 flex items-center gap-1">
            <ArrowDownRight size={13} className="text-blue-600 shrink-0" />
            <span>{row.out_time}</span>
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

  if (loading) {
    return <ParentBusTrackingSkeleton />;
  }

  const wardDisplayName = studentInfo?.first_name 
    ? `${studentInfo.first_name} ${studentInfo.last_name || ''}`.trim()
    : studentInfo?.name || 'My Ward';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-24 sm:pb-8">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary-50 text-primary-700 border border-primary-200/60">
              <Radio size={13} className="text-primary-600 animate-pulse" /> Live Smart Bus GPS Telemetry
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800">
              <UserCheck size={12} className="text-slate-600" /> Ward: {wardDisplayName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {route?.route_name || 'Assigned Smart Bus Route'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time road transit navigation, stop sequencing, and NFC tap safety logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {bus?.driver_phone && (
            <a
              href={`tel:${bus.driver_phone}`}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 transition shadow-2xs cursor-pointer"
            >
              <Bus size={15} className="text-amber-700" />
              <span>Driver: {bus.driver_name}</span>
            </a>
          )}

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-primary-600 shadow-2xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1 text-xs font-bold"
            title="Refresh Live Telemetry"
          >
            <RefreshCw size={14} className={fetching ? 'animate-spin text-primary-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {!isEnabled ? (
        <BusNotSubscribedCard
          wardName={wardDisplayName}
          schoolPhone={school?.phone || '+91 9876543200'}
          schoolEmail={school?.email || 'transport@greenwood.edu'}
        />
      ) : (
        <>
          {/* Main Grid: Live Map + Stop Sequence */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* Left Column: Live Road Snapped Map + Quick Metric Cards */}
            <div className="lg:col-span-8 space-y-5">
              {/* Real Leaflet Map */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-black">
                      <Navigation size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Live GPS Road Map</h3>
                      <p className="text-[11px] text-slate-500">OSRM Road-Snapped Curves & Directional Telemetry</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Active GPS Signal</span>
                  </span>
                </div>

                <ParentLiveTrackingMap
                  school={school}
                  route={route}
                  assignedStop={assignedStop}
                  bus={bus}
                  allStops={allStops}
                />
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Card 1: Assigned Stop */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <MapPin size={14} />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 truncate">Ward&apos;s Stop</h4>
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {assignedStop?.stop_name || 'Not Allocated'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold pt-1 border-t border-slate-100 text-emerald-700">
                    <span>Pickup: {assignedStop?.pickup_time || '--'}</span>
                    <span>Drop: {assignedStop?.drop_off_time || '--'}</span>
                  </div>
                </div>

                {/* Card 2: Assigned Bus */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Bus size={14} />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 truncate">Assigned Bus</h4>
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-900 truncate">
                    {bus?.bus_number || 'BUS-01'} • <span className="text-slate-500 font-sans">{bus?.plate_number || 'MH-02-AZ-1111'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-100 truncate">
                    Driver: {bus?.driver_name || 'Assigned Driver'}
                  </div>
                </div>

                {/* Card 3: NFC Pass */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                      <CreditCard size={14} />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 truncate">NFC Pass UID</h4>
                  </div>
                  <div className="font-mono font-bold text-xs text-primary-700 truncate">
                    {studentInfo?.nfc_card_uid || 'STUDENT_CARD_001'}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold pt-1 border-t border-slate-100">
                    <CheckCircle2 size={12} />
                    <span>NFC Swipe Enabled</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Route Stop Sequence & ETA */}
            <div className="lg:col-span-4 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-black">
                    <Route size={14} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Route Stop Sequence
                  </h3>
                </div>
                <span className="text-[10px] font-black text-slate-400">
                  {allStops.length} Stops
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {allStops.map((st, index) => {
                  const isAssigned = String(st.id) === String(assignedStop?.id);
                  const isCompleted = index === 0;

                  return (
                    <div
                      key={st.id || index}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isAssigned
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-2xs'
                          : isCompleted
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-primary-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isAssigned
                              ? 'bg-amber-500 text-white'
                              : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {st.stop_name}
                          </h4>
                          {isAssigned && (
                            <span className="text-[9px] font-black uppercase text-amber-700 tracking-wider flex items-center gap-0.5 mt-0.5">
                              ★ Ward&apos;s Assigned Stop
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold text-slate-600 block">
                          {st.pickup_time || '--'}
                        </span>
                        {st.drop_off_time && (
                          <span className="text-[9px] font-mono text-slate-400 block">
                            {st.drop_off_time}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 4. Smart Bus NFC Unified IN & OUT Attendance Logs */}
          <div className="space-y-3.5 pt-2">
            {/* Filter Tabs & Search Bar */}
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-2xs space-y-3 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Filter Pills */}
                <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shadow-2xs">
                  {filterTabs.map((tab) => {
                    const isSelected = selectedTripFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedTripFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-primary-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-primary-50 text-primary-700 font-black' : 'bg-slate-200 text-slate-600 font-bold'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search trip date or stop..."
                    className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
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
              </div>
            </div>

            {/* Unified Journey Table */}
            <Card
              title="Smart Bus NFC Tap Journey Logs"
              icon={Bus}
              subtitle="Real-time NFC boarding (IN) & deboarding (OUT) verification for ward transit safety."
            >
              <DataTable
                columns={columns}
                data={paginatedLogs}
                loading={fetching}
                emptyMessage="No Smart Bus boarding logs recorded for the selected filter."
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
        </>
      )}

    </div>
  );
}
