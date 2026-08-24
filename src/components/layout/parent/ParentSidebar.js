'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  X, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';

export default function ParentSidebar({
  schoolName,
  schoolLogo,
  schoolCode,
  parentName,
  parentPhone,
  childrenList,
  selectedChildIndex,
  setSelectedChildIndex,
  activeChild,
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
      {/* Brand & Child Switcher */}
      <div className="p-5 border-b border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/parent/dashboard" className="flex items-center space-x-3 min-w-0 group">
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

        {/* Multi-Child Selector Switcher */}
        {childrenList.length > 1 ? (
          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Select Ward</span>
              <span className="text-[10px] font-bold text-primary-600">{childrenList.length} Enrolled</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {childrenList.map((child, idx) => (
                <button
                  key={child.id || idx}
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`p-2 rounded-xl text-left transition text-xs font-bold truncate cursor-pointer ${
                    selectedChildIndex === idx
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <p className="truncate">{child.full_name || child.first_name || `Child ${idx + 1}`}</p>
                  <p className={`text-[10px] font-normal truncate ${selectedChildIndex === idx ? 'text-primary-100' : 'text-slate-500'}`}>
                    {child.grade || child.class?.class_name || 'Class 10'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Users size={14} className="text-primary-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-primary-700 truncate block">
                  {activeChild?.full_name || activeChild?.first_name || 'Ward Profile'}
                </span>
                <span className="text-[10px] text-primary-600 block truncate">
                  {activeChild?.class?.class_name ? `${activeChild.class.class_name} - ${activeChild.class.section}` : activeChild?.grade || 'Class 10-A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Guardian Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/parent/dashboard' && pathname.startsWith(item.href));
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
          href="/parent/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
            pathname === '/parent/profile'
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Users size={17} className={pathname === '/parent/profile' ? 'text-white' : 'text-slate-400 group-hover:text-primary-600 transition-colors'} />
            <span className="truncate">Guardian Profile</span>
          </div>
          {pathname === '/parent/profile' && <ChevronRight size={14} className="text-primary-100" />}
        </Link>
      </div>

      {/* User Card & Logout in Sidebar bottom */}
      <div className="p-4 border-t border-slate-200/80 space-y-3">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-black text-sm shrink-0">
              {parentName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{parentName}</p>
              <p className="text-[10px] font-mono text-primary-600 font-semibold truncate">{parentPhone}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Guardian
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
