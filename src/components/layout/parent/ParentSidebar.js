'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  X, 
  ChevronRight, 
  LogOut,
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  Bus,
  CreditCard,
  User,
  Heart,
  ChevronsUpDown,
  Check
} from 'lucide-react';

import ParentSidebarSkeleton from '@/components/skeletons/parent/ParentSidebarSkeleton';

export default function ParentSidebar({
  schoolName,
  schoolLogo,
  schoolCode,
  parentName,
  parentPhone,
  childrenList = [],
  selectedChildIndex = 0,
  setSelectedChildIndex,
  activeChild,
  navItems,
  mobileOpen,
  setMobileOpen,
  handleLogout,
  loading = false
}) {
  if (loading) {
    return <ParentSidebarSkeleton />;
  }
  const pathname = usePathname();
  const [wardMenuOpen, setWardMenuOpen] = useState(false);
  const wardMenuRef = useRef(null);

  // Close ward switcher menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wardMenuRef.current && !wardMenuRef.current.contains(event.target)) {
        setWardMenuOpen(false);
      }
    }
    if (wardMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wardMenuOpen]);

  const currentChild = activeChild || childrenList[selectedChildIndex];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/95 lg:bg-white flex flex-col justify-between shadow-lg shadow-slate-200/50 transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand & Child Switcher Header */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/parent/dashboard" className="flex items-center space-x-3 min-w-0 group">
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

        {/* Scalable Active Ward Card & Switcher Dropdown */}
        {currentChild && (
          <div className="relative pt-0.5" ref={wardMenuRef}>
            <div className="flex items-center justify-between px-1 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span>Active Ward</span>
              {childrenList.length > 1 && (
                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200/60">
                  {childrenList.length} Wards
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => childrenList.length > 1 && setWardMenuOpen(!wardMenuOpen)}
              className={`w-full p-2.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-2.5 shadow-2xs ${
                childrenList.length > 1
                  ? 'bg-gradient-to-r from-primary-50/70 via-white to-primary-50/30 border-primary-200/80 hover:border-primary-400 hover:shadow-xs cursor-pointer'
                  : 'bg-gradient-to-r from-primary-50 via-primary-50/60 to-white border-primary-100 cursor-default'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white border border-primary-200/80 text-primary-600 font-black text-sm flex items-center justify-center shadow-2xs shrink-0 overflow-hidden relative">
                  {(currentChild.photo || currentChild.image_url) ? (
                    <img 
                      src={currentChild.image_url || currentChild.photo} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover rounded-[inherit]"
                    />
                  ) : (
                    <span>{(currentChild.first_name || currentChild.name || 'W').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate leading-tight">
                    {currentChild.first_name ? `${currentChild.first_name} ${currentChild.last_name || ''}`.trim() : currentChild.name}
                  </p>
                  <p className="text-[10px] text-primary-700 font-bold truncate mt-0.5">
                    {currentChild.schoolClass ? `${currentChild.schoolClass.name || currentChild.schoolClass.grade} (${currentChild.schoolClass.section || 'A'})` : `${currentChild.grade || ''} - ${currentChild.section || ''}`}
                    {currentChild.roll_number ? ` • #${currentChild.roll_number}` : ''}
                  </p>
                </div>
              </div>

              {childrenList.length > 1 && (
                <div className="p-1.5 rounded-lg bg-white border border-primary-200/80 text-primary-600 shadow-2xs shrink-0">
                  <ChevronsUpDown size={14} className={wardMenuOpen ? 'text-primary-700 rotate-180 transition-transform' : 'transition-transform'} />
                </div>
              )}
            </button>

            {/* Dropdown Floating Popover for 2, 3, 4, 5+ Children */}
            {wardMenuOpen && childrenList.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 animate-fadeIn space-y-1 max-h-64 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Switch Ward Profile</span>
                  <span>{childrenList.length} Total</span>
                </div>
                {childrenList.map((c, idx) => {
                  const isSelected = selectedChildIndex === idx;
                  const childFullName = c.first_name ? `${c.first_name} ${c.last_name || ''}`.trim() : (c.name || `Child #${idx+1}`);
                  const classText = c.schoolClass ? `${c.schoolClass.name || c.schoolClass.grade} (${c.schoolClass.section || 'A'})` : `${c.grade || ''} - ${c.section || ''}`;

                  return (
                    <button
                      key={c.id || idx}
                      type="button"
                      onClick={() => {
                        setSelectedChildIndex && setSelectedChildIndex(idx);
                        setWardMenuOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-primary-50/90 text-primary-900 font-bold border border-primary-200/80 shadow-2xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {(c.first_name || c.name || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate leading-tight">{childFullName}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate">{classText}{c.roll_number ? ` • Roll #${c.roll_number}` : ''}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        <div className="px-3.5 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>Guardian Menu</span>
          <Sparkles size={11} className="text-primary-500" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/parent/dashboard' && pathname.startsWith(item.href));
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
          <span>Guardian Profile</span>
        </div>

        {/* Profile Link */}
        <Link
          href="/parent/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative ${
            pathname === '/parent/profile'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              pathname === '/parent/profile'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100/80 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:scale-105'
            }`}>
              <User size={16} strokeWidth={pathname === '/parent/profile' ? 2.5 : 2} />
            </div>
            <span className="truncate tracking-tight">Guardian Profile</span>
          </div>

          <div className="shrink-0 flex items-center">
            {pathname === '/parent/profile' ? (
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
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm shrink-0 shadow-2xs">
              {parentName ? parentName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{parentName}</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">Authorized Parent</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            Linked
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50/60 transition duration-200 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out Parent</span>
        </button>
      </div>
    </aside>
  );
}
