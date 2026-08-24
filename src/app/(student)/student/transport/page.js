'use client';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Radio
} from 'lucide-react';

export default function StudentTransportPage() {
  const busRoute = 'Route #01 - North City Express';
  const busStop = 'Greenwood Crossing Stop #3';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <Bus size={13} className="text-primary-600" /> Transit & Smart Bus Details
          </div>
          <h1 className="text-2xl font-black text-slate-900">{busRoute}</h1>
          <p className="text-xs text-slate-500">Assigned bus stops, pickup/drop times, and emergency vehicle contacts.</p>
        </div>
      </div>

      {/* Transit Card Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <MapPin size={16} className="text-primary-600" /> Assigned Stop Details
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Route Name</span>
              <span className="text-slate-900 font-bold">{busRoute}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Assigned Stop</span>
              <span className="text-amber-700 font-bold">{busStop}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Morning Pickup</span>
              <span className="text-emerald-700 font-bold font-mono">07:15 AM</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Afternoon Drop</span>
              <span className="text-amber-700 font-bold font-mono">02:45 PM</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Phone size={16} className="text-amber-600" /> Bus Crew Contact
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Vehicle Number</span>
              <span className="text-slate-900 font-mono font-bold">GJ-01-SB-4402</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Driver</span>
              <span className="text-slate-900 font-semibold">Mr. Ramesh Patel (+91 9876543299)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Attendant</span>
              <span className="text-slate-900 font-semibold">Mr. Sanjay Kumar (+91 9876543298)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Transport Desk</span>
              <span className="text-primary-700 font-mono font-bold">079-2658-9900</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
