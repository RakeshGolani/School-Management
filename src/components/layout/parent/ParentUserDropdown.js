'use client';
import Link from 'next/link';
import { User, LogOut, ChevronDown } from 'lucide-react';

export default function ParentUserDropdown({
  parentName,
  parentPhone,
  parentEmail,
  profileDropdownOpen,
  setProfileDropdownOpen,
  handleLogout,
  dropdownRef
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setProfileDropdownOpen((prev) => !prev)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-primary-500/40 hover:bg-slate-100/80 transition-all duration-200 cursor-pointer group shadow-2xs"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
          {parentName.charAt(0).toUpperCase()}
        </div>

        {/* User Details (Name & Code) */}
        <div className="hidden sm:block text-left pr-1">
          <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
            {parentName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-mono font-bold text-primary-600">{parentPhone}</span>
            <span className="text-[9px] text-emerald-600 font-bold">• Guardian</span>
          </div>
        </div>

        {/* Centered Chevron */}
        <ChevronDown 
          size={14} 
          className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${
            profileDropdownOpen ? 'rotate-180 text-primary-600' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {profileDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 p-3.5 rounded-2xl space-y-3 shadow-2xl z-[100] animate-fadeIn">
          {/* Header User Preview */}
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-black text-sm shrink-0">
              {parentName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{parentName}</p>
              <p className="text-[11px] font-mono text-primary-600 font-bold truncate">{parentPhone}</p>
              {parentEmail && (
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{parentEmail}</p>
              )}
            </div>
          </div>

          {/* Links: Profile & Logout */}
          <div className="space-y-1 text-xs">
            <Link
              href="/parent/profile"
              onClick={() => setProfileDropdownOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-medium cursor-pointer"
            >
              <User size={15} className="text-primary-600" />
              <span>Parent Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
