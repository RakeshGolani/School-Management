'use client';
import { Menu } from 'lucide-react';
import ParentUserDropdown from './ParentUserDropdown';

export default function ParentHeader({
  parentName,
  parentPhone,
  parentEmail,
  setMobileOpen,
  profileDropdownOpen,
  setProfileDropdownOpen,
  handleLogout,
  dropdownRef
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile trigger & Greeting */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <span className="text-xs font-medium text-slate-500">Guardian Portal •</span>{' '}
          <span className="text-xs font-bold text-slate-900">{parentName}</span>
        </div>
      </div>

      {/* Right: User Profile Dropdown */}
      <ParentUserDropdown
        parentName={parentName}
        parentPhone={parentPhone}
        parentEmail={parentEmail}
        profileDropdownOpen={profileDropdownOpen}
        setProfileDropdownOpen={setProfileDropdownOpen}
        handleLogout={handleLogout}
        dropdownRef={dropdownRef}
      />
    </header>
  );
}
