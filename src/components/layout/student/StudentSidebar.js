'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Smartphone, 
  X, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';

export default function StudentSidebar({
  schoolName,
  schoolLogo,
  schoolCode,
  studentName,
  studentPhoto,
  admissionNumber,
  className,
  navItems,
  mobileOpen,
  setMobileOpen,
  handleLogout
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/95 lg:bg-white border-r border-slate-200/80 flex flex-col justify-between shadow-xs transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand / Logo */}
      <div className="p-5 border-b border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center space-x-3 min-w-0 group">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden group-hover:border-primary-500/40 transition-colors">
              {schoolLogo ? (
                <img src={schoolLogo} alt={schoolName} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white font-black text-sm">
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
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Student Desk Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Smartphone size={13} className="text-primary-600 shrink-0" />
            <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wider">Student Desk</span>
          </div>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-white text-primary-700 border border-primary-200 shadow-2xs truncate max-w-[110px]">
            {className}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Student Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-600 transition-colors'} />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-primary-100" />}
            </Link>
          );
        })}

        {/* Profile Link in Mobile Drawer */}
        <Link
          href="/student/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
            pathname === '/student/profile'
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <GraduationCap size={17} className={pathname === '/student/profile' ? 'text-white' : 'text-slate-400 group-hover:text-primary-600 transition-colors'} />
            <span className="truncate">My Profile & ID Card</span>
          </div>
          {pathname === '/student/profile' && <ChevronRight size={14} className="text-primary-100" />}
        </Link>
      </div>

      {/* User Card & Logout in Sidebar bottom */}
      <div className="p-4 border-t border-slate-200/80 space-y-3">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-black text-sm shrink-0 overflow-hidden relative">
              {studentPhoto ? (
                <img src={studentPhoto} alt={studentName} className="w-full h-full object-cover" />
              ) : (
                <span>{studentName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{studentName}</p>
              <p className="text-[10px] font-mono text-primary-600 font-semibold truncate">{admissionNumber}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition duration-200 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
