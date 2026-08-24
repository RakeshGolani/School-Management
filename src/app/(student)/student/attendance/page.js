'use client';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CalendarCheck, 
  Sparkles, 
  Award,
  Radio
} from 'lucide-react';

export default function StudentAttendancePage() {
  const logs = [
    { date: 'Today (24 Aug 2026)', status: 'PRESENT', inTime: '07:42 AM', gate: 'Gate 1 NFC Reader' },
    { date: '23 Aug 2026', status: 'PRESENT', inTime: '07:40 AM', gate: 'Gate 1 NFC Reader' },
    { date: '22 Aug 2026', status: 'PRESENT', inTime: '07:45 AM', gate: 'Gate 1 NFC Reader' },
    { date: '21 Aug 2026', status: 'PRESENT', inTime: '07:38 AM', gate: 'Gate 1 NFC Reader' },
    { date: '20 Aug 2026', status: 'LATE', inTime: '08:15 AM', gate: 'Gate 2 Late Desk' },
    { date: '19 Aug 2026', status: 'PRESENT', inTime: '07:41 AM', gate: 'Gate 1 NFC Reader' },
    { date: '18 Aug 2026', status: 'ABSENT', inTime: '--', gate: 'Medical Leave' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <CalendarCheck size={13} className="text-primary-600" /> Attendance Telemetry
          </div>
          <h1 className="text-2xl font-black text-slate-900">My Attendance Meter</h1>
          <p className="text-xs text-slate-500">Classroll & automated NFC gate verification logs.</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-primary-600">96.2%</div>
          <p className="text-[11px] text-slate-500 font-semibold">Excellent Attendance Tier</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Present</span>
          <div className="text-2xl font-black text-emerald-600">25</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-rose-700 uppercase">Absent</span>
          <div className="text-2xl font-black text-rose-600">1</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Late</span>
          <div className="text-2xl font-black text-amber-600">1</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-primary-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-primary-700 uppercase">Total Days</span>
          <div className="text-2xl font-black text-primary-600">27</div>
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Attendance Log History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Gate In Time</th>
                <th className="py-3.5 px-6">Scan Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-bold text-slate-900">{log.date}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      log.status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {log.status === 'PRESENT' && <CheckCircle2 size={11} />}
                      {log.status === 'LATE' && <Clock size={11} />}
                      {log.status === 'ABSENT' && <XCircle size={11} />}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-primary-600">{log.inTime}</td>
                  <td className="py-4 px-6 text-slate-500">{log.gate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
