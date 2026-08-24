'use client';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { 
  Bus, 
  MapPin, 
  Radio, 
  Sparkles, 
  Phone, 
  Clock, 
  Navigation, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function ParentBusTrackingPage() {
  const { activeChild } = useParentChild();

  const busRoute = activeChild?.bus_route?.route_name || 'Route #01 - North City Express';
  const busStop = activeChild?.bus_stop?.stop_name || 'Greenwood Crossing Stop #3';

  const stops = [
    { seq: 1, name: 'Campus Bus Terminal (Start)', time: '06:45 AM', status: 'PASSED' },
    { seq: 2, name: 'Sunrise Apartments Gate 2', time: '07:00 AM', status: 'PASSED' },
    { seq: 3, name: busStop, time: '07:15 AM', status: 'CURRENT_TARGET', isMyStop: true },
    { seq: 4, name: 'Metro Pillar #204 Junction', time: '07:30 AM', status: 'UPCOMING' },
    { seq: 5, name: 'School Main Campus Terminal', time: '07:45 AM', status: 'UPCOMING' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <Radio size={13} className="text-primary-600 animate-pulse" /> Live Smart Bus GPS Telemetry
          </div>
          <h1 className="text-2xl font-black text-slate-900">{busRoute}</h1>
          <p className="text-xs text-slate-500">Real-time transit navigation and morning/afternoon stop progression.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <Bus size={16} className="text-amber-600" />
            <span>Driver: Ramesh Patel (+91 9876543299)</span>
          </div>
        </div>
      </div>

      {/* Map Simulated Radar View & Route Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container Mock Radar */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
            {/* Ambient Map Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(var(--theme-primary-500)_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
            
            {/* Route Polyline Simulation */}
            <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-primary-600 via-amber-400 to-slate-300 rounded-full shadow-inner"></div>

            {/* Live Bus Pin */}
            <div className="absolute left-[45%] top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-20">
              <div className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-md mb-1 flex items-center gap-1">
                <Bus size={12} /> Live Bus (32 km/h)
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                <Navigation size={18} className="rotate-45" />
              </div>
            </div>

            {/* My Stop Pin */}
            <div className="absolute left-[58%] top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10">
              <div className="px-2.5 py-1 rounded-full bg-primary-600 text-white font-bold text-[10px] shadow-md mb-1 flex items-center gap-1">
                <MapPin size={10} /> My Child&apos;s Stop
              </div>
              <div className="w-6 h-6 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                #3
              </div>
            </div>

            {/* Floating Glass Status Overlay */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg z-30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Bus size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Approaching {busStop}</h4>
                  <p className="text-[11px] text-primary-600 font-semibold">Estimated Arrival: 4 Minutes (~1.2 km away)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+919876543299"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Phone size={13} /> Call Attendant
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sequenced Route Stops Timeline */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <MapPin size={15} className="text-primary-600" /> Route Stop Sequence
          </h3>
          <div className="space-y-3 relative before:absolute before:inset-y-3 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {stops.map((s) => (
              <div key={s.seq} className="flex items-start space-x-3 relative z-10 text-xs">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                  s.status === 'PASSED' ? 'bg-primary-600 text-white shadow-sm' :
                  s.isMyStop ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse font-black' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {s.seq}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold truncate ${s.isMyStop ? 'text-amber-800 font-black' : 'text-slate-900'}`}>
                      {s.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{s.time}</span>
                  </div>
                  {s.isMyStop && (
                    <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      My Assigned Stop
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
