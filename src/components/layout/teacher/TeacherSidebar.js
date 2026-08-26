'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  X, 
  ChevronRight, 
  LogOut,
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  Users,
  ShieldCheck
} from 'lucide-react';

import TeacherSidebarSkeleton from '@/components/skeletons/teacher/TeacherSidebarSkeleton';

export default function TeacherSidebar({
  schoolName,
  schoolLogo,
  schoolCode,
  teacherName,
  teacherPhoto,
  employeeId,
  classTeacherFor,
  navItems,
  mobileOpen,
  setMobileOpen,
  handleLogout,
  loading = false
}) {
  if (loading) {
    return <TeacherSidebarSkeleton />;
  }
  const pathname = usePathname();

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/95 lg:bg-white flex flex-col justify-between shadow-lg shadow-slate-200/50 transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand / Logo Header */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/teacher/dashboard" className="flex items-center space-x-3 min-w-0 group">
            <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden group-hover:scale-105 transition-all">
              {schoolLogo ? (
                <img src={schoolLogo} alt={schoolName} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
                  {schoolName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-black text-slate-900 tracking-tight truncate leading-tight group-hover:text-primary-600 transition-colors" title={schoolName}>
                {schoolName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-primary-600 uppercase tracking-wider truncate">
                  Code: {schoolCode}
                </span>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Faculty Desk Pill */}
        <div className="px-3 py-2 rounded-2xl bg-gradient-to-r from-primary-50 via-primary-50/60 to-white flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <GraduationCap size={14} className="text-primary-600 shrink-0" />
            <span className="text-[11px] font-extrabold text-primary-800 uppercase tracking-wider">Teacher Desk</span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-white text-primary-700 shadow-2xs truncate max-w-[110px]">
            {classTeacherFor}
          </span>
        </div>
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <div className="px-3.5 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>Main Navigation</span>
          <Sparkles size={11} className="text-primary-500" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/teacher/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100/80 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:scale-105'
                }`}>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="truncate tracking-tight">{item.label}</span>
              </div>

              <div className="shrink-0 flex items-center">
                {isActive ? (
                  <ChevronRight size={15} className="text-white/80" />
                ) : (
                  <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </Link>
          );
        })}

        {/* Section Divider */}
        <div className="pt-4 pb-1.5 px-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Account & Records</span>
        </div>

        {/* Profile & Credentials Menu Item */}
        <Link
          href="/teacher/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
            pathname === '/teacher/profile'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              pathname === '/teacher/profile'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100/80 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:scale-105'
            }`}>
              <GraduationCap size={16} strokeWidth={pathname === '/teacher/profile' ? 2.5 : 2} />
            </div>
            <span className="truncate tracking-tight">Faculty Profile & ID</span>
          </div>

          <div className="shrink-0 flex items-center">
            {pathname === '/teacher/profile' ? (
              <ChevronRight size={15} className="text-white/80" />
            ) : (
              <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </Link>
      </div>

      {/* User Info Card & Sign Out Button */}
      <div className="p-4 border-t border-slate-100 space-y-2.5">
        <div className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm shrink-0 overflow-hidden relative shadow-2xs">
              {teacherPhoto ? (
                <img src={teacherPhoto} alt={teacherName} className="w-full h-full object-cover" />
              ) : (
                <span>{teacherName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{teacherName}</p>
              <p className="text-[10px] font-mono text-primary-600 font-semibold truncate">{employeeId}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            Active
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50/60 transition duration-200 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out Desk</span>
        </button>
      </div>
    </aside>
  );
}
