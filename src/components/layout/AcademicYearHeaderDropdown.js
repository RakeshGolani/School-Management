'use client';
import { useState } from 'react';
import { CalendarDays, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { useClickOutside } from '@/hooks/useClickOutside';

export default function AcademicYearHeaderDropdown() {
  const { academicYears, activeYear, changeActiveYear } = useAcademicYear();
  const [open, setOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setOpen(false));

  if (!academicYears || academicYears.length === 0) {
    return (
      <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
        <span className="text-slate-400">Session:</span>
        <span className="font-semibold text-slate-500">2024-2025</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-primary-500/40 text-xs transition-all duration-200 cursor-pointer shadow-2xs group"
        title="Switch Active Academic Year"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <CalendarDays size={14} className="text-primary-600" />
        <span className="text-slate-500 font-medium">Session:</span>
        <span className="font-extrabold text-slate-900 group-hover:text-primary-600 transition">
          {activeYear ? activeYear.year_name : 'Select Year'}
        </span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-primary-600' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 p-2.5 rounded-2xl shadow-2xl z-[100] animate-fadeIn space-y-1">
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles size={11} className="text-primary-500" /> Academic Sessions
            </span>
            <a
              href="/academic-years"
              onClick={() => setOpen(false)}
              className="text-[10px] font-bold text-primary-600 hover:underline"
            >
              Manage
            </a>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {academicYears.map((year) => {
              const isSelected = activeYear && activeYear.id === year.id;

              return (
                <button
                  key={year.id}
                  onClick={() => {
                    changeActiveYear(year);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-primary-50 text-primary-700 border border-primary-100 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${year.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span className="truncate">{year.year_name}</span>
                    {year.is_active && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold uppercase">Active</span>
                    )}
                  </div>
                  {isSelected && <Check size={14} className="text-primary-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
