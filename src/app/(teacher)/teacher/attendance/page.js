'use client';
import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Save, 
  Users, 
  Sparkles,
  Search,
  Filter,
  CheckCheck
} from 'lucide-react';
import { getTeacherSessionAction } from '@/actions/teacher/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function TeacherAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [saving, setSaving] = useState(false);

  const initialStudents = [
    { id: 1, roll: '01', name: 'Aarav Sharma', adm: 'ADM-2026-001', gender: 'Male', status: 'PRESENT' },
    { id: 2, roll: '02', name: 'Ananya Patel', adm: 'ADM-2026-002', gender: 'Female', status: 'PRESENT' },
    { id: 3, roll: '03', name: 'Devendra Joshi', adm: 'ADM-2026-003', gender: 'Male', status: 'PRESENT' },
    { id: 4, roll: '04', name: 'Diya Mehta', adm: 'ADM-2026-004', gender: 'Female', status: 'LATE' },
    { id: 5, roll: '05', name: 'Ishaan Verma', adm: 'ADM-2026-005', gender: 'Male', status: 'PRESENT' },
    { id: 6, roll: '06', name: 'Kavya Nair', adm: 'ADM-2026-006', gender: 'Female', status: 'ABSENT' },
    { id: 7, roll: '07', name: 'Manav Gupta', adm: 'ADM-2026-007', gender: 'Male', status: 'PRESENT' },
    { id: 8, roll: '08', name: 'Priya Rathore', adm: 'ADM-2026-008', gender: 'Female', status: 'PRESENT' },
    { id: 9, roll: '09', name: 'Rohan Deshmukh', adm: 'ADM-2026-009', gender: 'Male', status: 'EXCUSED' },
    { id: 10, roll: '10', name: 'Sneha Kulkarni', adm: 'ADM-2026-010', gender: 'Female', status: 'PRESENT' },
  ];

  const [students, setStudents] = useState(initialStudents);

  const handleStatusChange = (id, newStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
    notifySuccess('All students marked as Present!');
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      notifySuccess(`Class attendance for ${selectedDate} saved successfully!`);
    }, 600);
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll.includes(searchTerm) || s.adm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchFilter;
  });

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;
  const lateCount = students.filter(s => s.status === 'LATE').length;
  const excusedCount = students.filter(s => s.status === 'EXCUSED').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <Sparkles size={13} className="text-primary-600" /> Class Teacher Desk
          </div>
          <h1 className="text-2xl font-black text-slate-900">Daily Class Attendance Marker</h1>
          <p className="text-xs text-slate-500">Mark student roll call for your assigned class section.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700">
            <Calendar size={15} className="text-primary-600" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Roll Call'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Present</span>
          <div className="text-2xl font-black text-emerald-600">{presentCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Absent</span>
          <div className="text-2xl font-black text-rose-600">{absentCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Late</span>
          <div className="text-2xl font-black text-amber-600">{lateCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Excused</span>
          <div className="text-2xl font-black text-blue-600">{excusedCount}</div>
        </div>
      </div>

      {/* Control Bar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by student name, roll number, or admission no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <CheckCheck size={15} /> Mark All Present
          </button>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredStudents.map((s) => (
            <div key={s.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center font-mono font-black text-sm text-primary-700 shrink-0">
                  {s.roll}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{s.adm}</span>
                  </div>
                  <p className="text-xs text-slate-500">{s.gender}</p>
                </div>
              </div>

              {/* Status Selector Pills */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleStatusChange(s.id, 'PRESENT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    s.status === 'PRESENT'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 size={13} /> Present
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(s.id, 'ABSENT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    s.status === 'ABSENT'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <XCircle size={13} /> Absent
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(s.id, 'LATE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    s.status === 'LATE'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Clock size={13} /> Late
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(s.id, 'EXCUSED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    s.status === 'EXCUSED'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <AlertCircle size={13} /> Excused
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
