'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  X, 
  ChevronRight, 
  LogOut, 
  Users, 
  LayoutDashboard, 
  Bus, 
  CalendarCheck, 
  CreditCard, 
  CalendarDays,
  Sparkles,
  UserCheck,
  Check
} from 'lucide-react';

export default function ParentMobileDrawer({
  isOpen,
  onClose,
  navItems,
  parentName,
  parentPhone,
  childrenList,
  selectedChildIndex,
  setSelectedChildIndex,
  activeChild,
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
          desc: item.desc || item.label
        })),
        { label: 'Guardian Profile', href: '/parent/profile', icon: Users, desc: 'Parent info & enrolled wards' }
      ]
    : [
        { label: 'Parent Hub', href: '/parent/dashboard', icon: LayoutDashboard, desc: 'Ward safety & summary' },
        { label: 'Live Bus Tracking', href: '/parent/bus-tracking', icon: Bus, desc: 'GPS road telemetry & stops' },
        { label: 'Attendance & Gate Logs', href: '/parent/attendance', icon: CalendarCheck, desc: 'NFC swipe & attendance history' },
        { label: 'Fees & Invoices', href: '/parent/fees', icon: CreditCard, desc: 'Allocations & fee receipts' },
        { label: 'Ward Timetable', href: '/parent/timetable', icon: CalendarDays, desc: 'Weekly period schedule' },
        { label: 'Guardian Profile', href: '/parent/profile', icon: Users, desc: 'Parent info & enrolled wards' },
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
            <span className="text-sm font-black text-slate-900">Guardian Menu & Shortcuts</span>
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
            href="/parent/profile"
            onClick={onClose}
            className="p-4 rounded-2xl bg-gradient-to-r from-primary-50/80 via-white to-slate-50 border border-primary-200/80 flex items-center justify-between gap-3 shadow-xs hover:border-primary-500 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-xs">
                {parentName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-900 truncate group-hover:text-primary-600 transition-colors">{parentName}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">Guardian</span>
                </div>
                <p className="text-xs font-mono text-primary-600 font-bold">{parentPhone}</p>
                <p className="text-[11px] text-slate-500 truncate">{childrenList.length} Ward{childrenList.length > 1 ? 's' : ''} Linked</p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-primary-500 group-hover:bg-primary-50 text-slate-400 group-hover:text-primary-600 transition shrink-0">
              <ChevronRight size={16} />
            </div>
          </Link>

          {/* Multi-Child Switcher (Supports 1, 2, 3, 4, 5+ Children seamlessly) */}
          {childrenList && childrenList.length > 1 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-primary-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Switch Active Ward
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200/60">
                  {childrenList.length} Enrolled
                </span>
              </div>

              {/* Scalable List of Wards (Single-column full width, scrollable if > 3) */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                {childrenList.map((child, idx) => {
                  const isSelected = selectedChildIndex === idx;
                  const childFullName = child.full_name || (child.first_name ? `${child.first_name} ${child.last_name || ''}`.trim() : (child.name || `Child #${idx + 1}`));
                  const classLabel = child.schoolClass 
                    ? `${child.schoolClass.name || child.schoolClass.grade} (${child.schoolClass.section || 'A'})`
                    : (child.grade ? `${child.grade} - ${child.section || 'A'}` : 'Class Student');

                  return (
                    <button
                      key={child.id || idx}
                      type="button"
                      onClick={() => setSelectedChildIndex(idx)}
                      className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-primary-600 text-white shadow-xs font-bold ring-2 ring-primary-600/20'
                          : 'bg-white text-slate-800 hover:bg-slate-100/80 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600'
                        }`}>
                          {(child.first_name || child.name || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black truncate leading-tight">
                            {childFullName}
                          </p>
                          <p className={`text-[10px] font-medium truncate mt-0.5 ${
                            isSelected ? 'text-primary-100' : 'text-slate-500'
                          }`}>
                            {classLabel} {child.roll_number ? `• Roll #${child.roll_number}` : ''}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Navigation Items */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Menu Navigation</p>
            <div className="grid grid-cols-1 gap-1.5">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/parent/dashboard' && pathname.startsWith(item.href));

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
                <span className="text-[10px] font-bold text-primary-600">Guardian Portal</span>
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
