'use client';
import { useState } from 'react';
import { 
  Users, 
  Search, 
  Sparkles, 
  Phone, 
  Radio, 
  GraduationCap, 
  Bus, 
  ShieldCheck 
} from 'lucide-react';

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const students = [
    { id: 1, roll: '01', name: 'Aarav Sharma', adm: 'ADM-2026-001', gender: 'Male', guardian: 'Rajesh Sharma', phone: '+91 9876543210', nfc: 'NFC-8921-A', bus: 'Route #01', status: 'ACTIVE' },
    { id: 2, roll: '02', name: 'Ananya Patel', adm: 'ADM-2026-002', gender: 'Female', guardian: 'Suresh Patel', phone: '+91 9876543211', nfc: 'NFC-8922-B', bus: 'Route #02', status: 'ACTIVE' },
    { id: 3, roll: '03', name: 'Devendra Joshi', adm: 'ADM-2026-003', gender: 'Male', guardian: 'Manoj Joshi', phone: '+91 9876543212', nfc: 'NFC-8923-C', bus: null, status: 'ACTIVE' },
    { id: 4, roll: '04', name: 'Diya Mehta', adm: 'ADM-2026-004', gender: 'Female', guardian: 'Prakash Mehta', phone: '+91 9876543213', nfc: 'NFC-8924-D', bus: 'Route #01', status: 'ACTIVE' },
    { id: 5, roll: '05', name: 'Ishaan Verma', adm: 'ADM-2026-005', gender: 'Male', guardian: 'Sunil Verma', phone: '+91 9876543214', nfc: 'NFC-8925-E', bus: 'Route #03', status: 'ACTIVE' },
    { id: 6, roll: '06', name: 'Kavya Nair', adm: 'ADM-2026-006', gender: 'Female', guardian: 'Vinod Nair', phone: '+91 9876543215', nfc: 'NFC-8926-F', bus: null, status: 'ACTIVE' },
    { id: 7, roll: '07', name: 'Manav Gupta', adm: 'ADM-2026-007', gender: 'Male', guardian: 'Rakesh Gupta', phone: '+91 9876543216', nfc: 'NFC-8927-G', bus: 'Route #02', status: 'ACTIVE' },
    { id: 8, roll: '08', name: 'Priya Rathore', adm: 'ADM-2026-008', gender: 'Female', guardian: 'Vikram Rathore', phone: '+91 9876543217', nfc: 'NFC-8928-H', bus: 'Route #01', status: 'ACTIVE' },
  ];

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.adm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <Sparkles size={13} className="text-primary-600" /> Class Roster
          </div>
          <h1 className="text-2xl font-black text-slate-900">Assigned Class Students</h1>
          <p className="text-xs text-slate-500">Student enrollment list, guardian contact info, and NFC card telemetry.</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-primary-600">{students.length} Students</div>
          <p className="text-[11px] text-slate-500 font-semibold">Grade 10 - Section A</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search by student name, roll number, admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
          />
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Roll #</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Admission No</th>
                <th className="py-3.5 px-6">Guardian / Parent</th>
                <th className="py-3.5 px-6">Phone</th>
                <th className="py-3.5 px-6">Transit / NFC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-mono font-bold text-primary-600">{s.roll}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    <span className="text-[10px] text-slate-500">{s.gender}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-500">{s.adm}</td>
                  <td className="py-4 px-6 text-slate-900 font-semibold">{s.guardian}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-slate-600 font-mono">
                      <Phone size={12} className="text-primary-600" /> {s.phone}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {s.bus ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          <Bus size={10} /> {s.bus}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Self</span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">{s.nfc}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
