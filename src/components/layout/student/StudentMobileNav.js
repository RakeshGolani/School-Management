'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckCircle2, 
  Bus, 
  Menu 
} from 'lucide-react';

export default function StudentMobileNav({ user, navItems, onOpenDrawer }) {
  const pathname = usePathname();

  const mainNavItems = (navItems && navItems.length > 0)
    ? navItems.slice(0, 4)
    : [
        { label: 'Hub', href: '/student/dashboard', icon: LayoutDashboard },
        { label: 'Timetable', href: '/student/timetable', icon: CalendarDays },
        { label: 'Attendance', href: '/student/attendance', icon: CheckCircle2 },
        { label: 'Bus', href: '/student/transport', icon: Bus },
      ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl shadow-[0_-6px_25px_rgba(15,23,42,0.07)] px-2 py-1.5"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 relative group min-w-[56px] ${
                isActive 
                  ? 'text-primary-600 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 scale-110 shadow-xs' 
                  : 'group-hover:bg-slate-100'
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 leading-none ${
                isActive ? 'text-primary-700 font-black' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}

        {/* MORE / APP DRAWER TRIGGER */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 relative group min-w-[56px] text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
        >
          <div className="p-1.5 rounded-xl transition-all duration-200 group-hover:bg-primary-50 group-hover:text-primary-600">
            <Menu size={20} strokeWidth={2} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 leading-none text-slate-500 group-hover:text-primary-700 group-hover:font-bold">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
