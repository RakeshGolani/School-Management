'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, 
  ChevronRight, 
  LogOut, 
  GraduationCap, 
  LayoutDashboard, 
  CalendarDays, 
  CheckCircle2, 
  Bus,
  Sparkles,
  BookOpen,
  FileText
} from 'lucide-react';

export default function StudentMobileDrawer({
  isOpen,
  onClose,
  navItems,
  studentName,
  studentPhoto,
  admissionNumber,
  className,
  schoolName,
  schoolCode,
  handleLogout
}) {
  const pathname = usePathname();

  // Prevent background scrolling when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const quickLinks = (navItems && navItems.length > 0)
    ? [
        ...navItems.map(item => ({
          label: item.label,
          href: item.href,
          icon: item.icon,
          desc: item.desc || (item.href === '/student/leaves' ? 'Apply leave & track status' : item.label)
        })),
        { label: 'My Profile & ID Card', href: '/student/profile', icon: GraduationCap, desc: 'Official digital student ID' }
      ]
    : [
        { label: 'Student Hub', href: '/student/dashboard', icon: LayoutDashboard, desc: 'Overview & quick metrics' },
        { label: 'Weekly Timetable', href: '/student/timetable', icon: CalendarDays, desc: 'Daily period schedule & subjects' },
        { label: 'Attendance Meter', href: '/student/attendance', icon: CheckCircle2, desc: 'Attendance stats & gate log' },
        { label: 'Smart Bus & Stops', href: '/student/transport', icon: Bus, desc: 'Assigned route & stop timings' },
        { label: 'Leave Requests', href: '/student/leaves', icon: FileText, desc: 'Apply leave & track teacher approvals' },
        { label: 'My Profile & ID Card', href: '/student/profile', icon: GraduationCap, desc: 'Official digital student ID' },
      ];

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet Drawer */}
      <div className="relative z-10 w-full max-h-[88vh] bg-white rounded-t-[2rem] border-t border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Top Handle Bar */}
        <div className="pt-3 pb-2 flex flex-col items-center justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header with Title & Close */}
        <div className="px-6 py-2 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary-600" />
            <span className="text-sm font-black text-slate-900">Student Menu & Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* User Profile Banner Card */}
          <Link
            href="/student/profile"
            onClick={onClose}
            className="p-4 rounded-2xl bg-gradient-to-r from-primary-50/80 via-white to-slate-50 border border-primary-200/80 flex items-center justify-between gap-3 shadow-xs hover:border-primary-500 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 border border-primary-300 flex items-center justify-center text-primary-700 font-black text-lg shrink-0 overflow-hidden relative shadow-xs">
                {studentPhoto ? (
                  <img src={studentPhoto} alt={studentName} className="w-full h-full object-cover" />
                ) : (
                  <span>{studentName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-900 truncate group-hover:text-primary-600 transition-colors">{studentName}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">Enrolled</span>
                </div>
                <p className="text-xs font-mono text-primary-600 font-bold">{admissionNumber}</p>
                <p className="text-[11px] text-slate-500 truncate">{className}</p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-primary-500 group-hover:bg-primary-50 text-slate-400 group-hover:text-primary-600 transition shrink-0">
              <ChevronRight size={16} />
            </div>
          </Link>

          {/* Quick Navigation Items */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Menu Navigation</p>
            <div className="grid grid-cols-1 gap-1.5">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20'
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white font-black' : 'text-slate-900'}`}>{item.label}</p>
                        <p className={`text-[10px] truncate ${isActive ? 'text-white/90 font-medium' : 'text-slate-400'}`}>{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-white' : 'text-slate-300'} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Institution Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900 truncate leading-snug">{schoolName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">Code: {schoolCode}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-primary-600">Student Portal</span>
              </div>
            </div>
          </div>

          {/* Sign Out Action Button */}
          <button
            onClick={() => {
              onClose();
              handleLogout();
            }}
            className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-2xs"
          >
            <LogOut size={16} />
            <span>Sign Out Account</span>
          </button>

        </div>
      </div>
    </div>
  );
}
