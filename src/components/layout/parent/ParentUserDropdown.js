'use client';

import Link from 'next/link';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Bus, 
  CalendarCheck, 
  CreditCard 
} from 'lucide-react';

export default function ParentUserDropdown({
  parentName,
  parentPhone,
  parentEmail,
  studentName,
  profileDropdownOpen,
  setProfileDropdownOpen,
  handleLogout,
  dropdownRef
}) {
  const initialChar = (parentName || 'P').trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button Capsule */}
      <button
        onClick={() => setProfileDropdownOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-primary-500/40 transition-all duration-200 cursor-pointer group shadow-2xs"
      >
        {/* User Avatar Wrapper with non-clipped Status Dot */}
        <div className="relative shrink-0 group-hover:scale-105 transition-transform">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary-50 border border-primary-500/25 flex items-center justify-center text-primary-700 font-black text-xs overflow-hidden relative shadow-2xs">
            <span>{initialChar}</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5 z-20 shadow-2xs" />
        </div>

        {/* User Details (Name & Code - Desktop) */}
        <div className="hidden sm:block text-left pr-1">
          <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
            {parentName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-mono font-bold text-primary-600">{parentPhone || 'Guardian'}</span>
            <span className="text-[9px] text-emerald-600 font-bold">• Guardian</span>
          </div>
        </div>

        {/* Chevron Indicator (Visible on all screen sizes) */}
        <ChevronDown 
          size={13} 
          className={`text-slate-400 group-hover:text-slate-700 transition-transform duration-200 shrink-0 ${
            profileDropdownOpen ? 'rotate-180 text-primary-600' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {profileDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white p-3.5 rounded-3xl space-y-3 shadow-2xl z-[100] animate-fadeIn border border-slate-100">
          {/* Header User Preview */}
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-500/25 flex items-center justify-center text-primary-700 font-black text-base shrink-0 overflow-hidden shadow-2xs relative">
              <span>{initialChar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-900 truncate">{parentName}</p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <p className="text-[11px] font-mono text-primary-600 font-bold truncate">{parentPhone}</p>
              {studentName && (
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Ward: {studentName}</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-1 text-xs">
            <Link
              href="/parent/profile"
              onClick={() => setProfileDropdownOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-bold cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User size={14} />
              </div>
              <span>Guardian Profile & Ward</span>
            </Link>

            <Link
              href="/parent/bus-tracking"
              onClick={() => setProfileDropdownOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-bold cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bus size={14} />
              </div>
              <span>Live Smart Bus Radar</span>
            </Link>

            <Link
              href="/parent/attendance"
              onClick={() => setProfileDropdownOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-bold cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CalendarCheck size={14} />
              </div>
              <span>Ward Attendance Logs</span>
            </Link>

            <Link
              href="/parent/fees"
              onClick={() => setProfileDropdownOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-bold cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CreditCard size={14} />
              </div>
              <span>Fee Invoices & Payments</span>
            </Link>

            <div className="pt-1.5 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition duration-200 cursor-pointer bg-rose-50/60"
              >
                <LogOut size={14} className="shrink-0" />
                <span>Sign Out Parent</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
