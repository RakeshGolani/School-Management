'use client';
import { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default function TeacherTimetablePage() {
  const [selectedDay, setSelectedDay] = useState('MONDAY');

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const scheduleData = {
    MONDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Mathematics', class: 'Grade 9 - B', room: 'Room 104', isClassTeacher: false },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'Mathematics Lab', class: 'Grade 10 - A', room: 'Maths Lab 1', isClassTeacher: true },
      { period: 4, time: '11:15 - 12:00 PM', subject: 'Remedial Session', class: 'Grade 8 - A', room: 'Room 201', isClassTeacher: false },
      { period: 5, time: '12:45 - 01:30 PM', subject: 'Class Teacher Period', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
    ],
    TUESDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', class: 'Grade 9 - A', room: 'Room 103', isClassTeacher: false },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Mathematics', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
      { period: 4, time: '11:15 - 12:00 PM', subject: 'Advanced Algebra', class: 'Grade 11 - Sci', room: 'Room 302', isClassTeacher: false },
      { period: 6, time: '01:35 - 02:20 PM', subject: 'Problem Solving', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
    ],
    WEDNESDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'Geometry Workshop', class: 'Grade 9 - B', room: 'Room 104', isClassTeacher: false },
      { period: 5, time: '12:45 - 01:30 PM', subject: 'Mathematics', class: 'Grade 8 - B', room: 'Room 202', isClassTeacher: false },
    ],
    THURSDAY: [
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Mathematics', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'Mathematics Lab', class: 'Grade 9 - A', room: 'Maths Lab 1', isClassTeacher: false },
      { period: 5, time: '12:45 - 01:30 PM', subject: 'Mathematics', class: 'Grade 10 - B', room: 'Room 105', isClassTeacher: false },
    ],
    FRIDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Mathematics', class: 'Grade 9 - B', room: 'Room 104', isClassTeacher: false },
      { period: 4, time: '11:15 - 12:00 PM', subject: 'Weekly Assessment', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
    ],
    SATURDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Faculty Weekly Sync', class: 'Staff Room', room: 'Conference A', isClassTeacher: false },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Parent Consultation', class: 'Grade 10 - A', room: 'Room 102', isClassTeacher: true },
    ],
  };

  const currentSchedule = scheduleData[selectedDay] || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <Sparkles size={13} className="text-primary-600" /> Teaching Schedule
          </div>
          <h1 className="text-2xl font-black text-slate-900">Master Period Allocation Matrix</h1>
          <p className="text-xs text-slate-500">View your assigned classes, section rooms, and daily teaching periods.</p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white border border-slate-200 shadow-2xs rounded-2xl">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedDay === day
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Periods Grid for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSchedule.map((p) => (
          <div 
            key={p.period} 
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-2xs ${
              p.isClassTeacher 
                ? 'bg-gradient-to-br from-primary-50/70 via-white to-slate-50 border-primary-200/80 ring-1 ring-primary-300/30' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center font-black text-xs font-mono">
                P{p.period}
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock size={13} className="text-primary-600" /> {p.time}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-black text-slate-900">{p.subject}</span>
                {p.isClassTeacher && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full border border-primary-200">
                    My Class
                  </span>
                )}
              </div>
              <p className="text-xs text-primary-600 font-bold">{p.class}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" /> {p.room}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Allocated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
