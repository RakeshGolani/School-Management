'use client';

import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Calendar 
} from 'lucide-react';
import StudentUserDropdown from './StudentUserDropdown';
import NotificationBellDropdown from '@/components/layout/NotificationBellDropdown';

export default function StudentHeader({
  studentName,
  studentPhoto,
  admissionNumber,
  className,
  setMobileOpen,
  profileDropdownOpen,
  setProfileDropdownOpen,
  handleLogout,
  dropdownRef
}) {
  const pathname = usePathname();

  // Determine dynamic page title and subtitle based on current route
  let pageTitle = 'Student Hub';
  let pageSub = 'Academic Progress & Highlights';

  if (pathname === '/student/timetable') {
    pageTitle = 'Weekly Timetable';
    pageSub = 'Class Schedule & Periods';
  } else if (pathname === '/student/attendance') {
    pageTitle = 'Attendance Log';
    pageSub = 'Daily & Monthly Presence';
  } else if (pathname === '/student/transport') {
    pageTitle = 'Smart Bus Fleet';
    pageSub = 'Transit & NFC Attendance';
  } else if (pathname === '/student/leaves') {
    pageTitle = 'Leave Requests';
    pageSub = 'Student Applications & Status';
  } else if (pathname === '/student/notifications') {
    pageTitle = 'Notification Center';
    pageSub = 'Alerts, Broadcasts & Activity Updates';
  } else if (pathname === '/student/profile') {
    pageTitle = 'Student Profile & ID';
    pageSub = 'Digital Identity & Credentials';
  }

  // Format today's date (e.g. Tue, 25 Aug 2026)
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-3.5 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xs shadow-slate-200/60 min-h-[58px] sm:min-h-[64px]">
      
      {/* 🌟 Left Section: Dynamic Page Title Badge & Description */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-50/90 via-white to-primary-100/40 border border-primary-200/60 text-primary-900 font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs shrink-0">
          <Sparkles size={13} className="text-primary-600 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-none">{pageTitle}</span>
        </div>

        <span className="hidden md:inline-block text-slate-300 font-light">•</span>
        <span className="hidden md:inline-block text-xs font-medium text-slate-500 truncate">
          {pageSub}
        </span>
      </div>

      {/* 🌟 Right Section: Live Calendar Date Pill & User Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        
        {/* Today's Live Date Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-semibold shadow-2xs">
          <Calendar size={13} className="text-primary-600 shrink-0" />
          <span>{todayFormatted}</span>
        </div>

        {/* Dynamic Notification Bell */}
        <NotificationBellDropdown role="student" />

        {/* User Profile Dropdown Component */}
        <StudentUserDropdown
          studentName={studentName}
          studentPhoto={studentPhoto}
          admissionNumber={admissionNumber}
          className={className}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          handleLogout={handleLogout}
          dropdownRef={dropdownRef}
        />
      </div>
    </header>
  );
}
