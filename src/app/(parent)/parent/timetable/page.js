'use client';
import { useState } from 'react';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  GraduationCap
} from 'lucide-react';

export default function ParentTimetablePage() {
  const { activeChild } = useParentChild();
  const [selectedDay, setSelectedDay] = useState('MONDAY');

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const scheduleData = {
    MONDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Mr. Rajesh Verma', room: 'Room 102' },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Science Physics', teacher: 'Mrs. Neha Singh', room: 'Science Lab 2' },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'English Literature', teacher: 'Ms. Clara D’Souza', room: 'Room 102' },
      { period: 4, time: '11:15 - 12:00 PM', subject: 'Social Studies', teacher: 'Mr. Arvind Dave', room: 'Room 102' },
      { period: 5, time: '12:45 - 01:30 PM', subject: 'Physical Education / Sports', teacher: 'Coach Sandeep', room: 'Sports Ground' },
    ],
    TUESDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Hindi Language', teacher: 'Mrs. Anita Dixit', room: 'Room 102' },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Mathematics', teacher: 'Mr. Rajesh Verma', room: 'Room 102' },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'Computer Science & Coding', teacher: 'Mr. Pranav Shah', room: 'Computer Lab' },
      { period: 4, time: '11:15 - 12:00 PM', subject: 'Chemistry Lab', teacher: 'Mrs. Neha Singh', room: 'Science Lab 1' },
    ],
    WEDNESDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Mr. Rajesh Verma', room: 'Room 102' },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'English Grammar', teacher: 'Ms. Clara D’Souza', room: 'Room 102' },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'Biology & Botany', teacher: 'Dr. Sunita Rao', room: 'Bio Lab' },
      { period: 4, time: '11:15 - 12:00 PM', subject: 'Geography & Map Work', teacher: 'Mr. Arvind Dave', room: 'Room 102' },
    ],
    THURSDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Science Physics', teacher: 'Mrs. Neha Singh', room: 'Room 102' },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Mathematics Problem Solving', teacher: 'Mr. Rajesh Verma', room: 'Room 102' },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'Art & Craft', teacher: 'Mrs. Suman Lata', room: 'Art Studio' },
      { period: 4, time: '11:15 - 12:00 PM', subject: 'Library & Reading', teacher: 'Ms. Clara D’Souza', room: 'Central Library' },
    ],
    FRIDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Mathematics Weekly Quiz', teacher: 'Mr. Rajesh Verma', room: 'Room 102' },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Social Studies Seminar', teacher: 'Mr. Arvind Dave', room: 'Room 102' },
      { period: 3, time: '10:10 - 10:55 AM', subject: 'Music & Performing Arts', teacher: 'Mr. Rahul Roy', room: 'Auditorium' },
    ],
    SATURDAY: [
      { period: 1, time: '08:30 - 09:15 AM', subject: 'Co-Curricular Club Activity', teacher: 'House Mentors', room: 'Activity Hall' },
      { period: 2, time: '09:20 - 10:05 AM', subject: 'Value Education & Assembly', teacher: 'Class Teacher', room: 'Room 102' },
    ],
  };

  const childName = activeChild?.full_name || activeChild?.first_name || 'Ward';
  const childClass = activeChild?.class?.class_name 
    ? `${activeChild.class.class_name} - ${activeChild.class.section}` 
    : activeChild?.grade || 'Class 10-A';
  const currentSchedule = scheduleData[selectedDay] || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <Sparkles size={13} className="text-primary-600" /> Academic Class Timetable
          </div>
          <h1 className="text-2xl font-black text-slate-900">{childName}&apos;s Weekly Schedule</h1>
          <p className="text-xs text-slate-500">Class: <span className="font-bold text-slate-900">{childClass}</span> • Room 102</p>
        </div>
      </div>

      {/* Day Selector */}
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSchedule.map((p) => (
          <div key={p.period} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 flex items-center justify-center font-black text-xs font-mono">
                P{p.period}
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock size={13} className="text-primary-600" /> {p.time}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900">{p.subject}</h4>
              <p className="text-xs text-primary-600 font-bold mt-0.5">Faculty: {p.teacher}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" /> {p.room}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
