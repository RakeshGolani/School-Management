'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  Users, 
  GraduationCap, 
  Bus, 
  Calendar, 
  CalendarDays,
  Settings, 
  LogOut, 
  BookOpen, 
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
  ChevronsLeft,
  ChevronsRight,
  Landmark,
  Clock
} from 'lucide-react';

import { logoutAction, getSessionAction } from '@/actions/authActions';
import { getStudentsAction } from '@/actions/studentActions';
import { getTeachersAction } from '@/actions/teacherActions';
import SidebarNavPopover from '@/components/ui/SidebarNavPopover';
import { useAcademicYear } from '@/context/AcademicYearContext';

/**
 * Dynamic Sidebar Component with Collapsible Icon-Only Mode
 */
export default function Sidebar({ 
  mobileOpen = false, 
  onClose, 
  collapsed = false, 
  onToggleCollapse 
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeYear } = useAcademicYear();
  const [studentCount, setStudentCount] = useState(null);
  const [teacherCount, setTeacherCount] = useState(null);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Pass active academic year so counts are session-scoped
        const params = { limit: 1 };
        if (activeYear?.id) params.academic_year_id = activeYear.id;

        const studentRes = await getStudentsAction(params);
        if (studentRes?.success && studentRes.meta?.total !== undefined) {
          setStudentCount(studentRes.meta.total);
        }

        const teacherRes = await getTeachersAction(params);
        if (teacherRes?.success && teacherRes.meta?.total !== undefined) {
          setTeacherCount(teacherRes.meta.total);
        }
      } catch (err) {
        console.error('Failed to fetch menu counts', err);
      }
    };

    const fetchSession = async () => {
      try {
        const sessionData = await getSessionAction();
        if (sessionData && sessionData.user) {
          setUserSession(sessionData.user);

          if (sessionData.user.id) {
            const res = await fetch(`http://localhost:5000/api/school/profile?schoolId=${sessionData.user.id}`, { cache: 'no-store' });
            const profileRes = await res.json();
            if (profileRes.success && profileRes.data) {
              setUserSession(profileRes.data);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch session data in Sidebar:', err);
      }
    };

    fetchCounts();
    fetchSession();

    window.addEventListener('sessionUpdated', fetchSession);
    return () => window.removeEventListener('sessionUpdated', fetchSession);
  }, [activeYear?.id]); // re-fetch counts whenever active academic year changes

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity },
    { label: 'Classes & Sections', href: '/classes', icon: BookOpen },
    { label: 'Students', href: '/students', icon: Users, badge: studentCount !== null ? studentCount.toString() : null },
    { label: 'Teachers', href: '/teachers', icon: GraduationCap, badge: teacherCount !== null ? teacherCount.toString() : null },
    { label: 'Smart Bus', href: '/transport', icon: Bus, badge: 'Active' },
    { label: 'Attendance', href: '/attendance', icon: Calendar },
    { label: 'Timetable & Periods', href: '/timetable', icon: Clock },
    { label: 'Student Fees', href: '/fees', icon: Landmark },
    { label: 'Academic Year', href: '/academic-years', icon: CalendarDays },
    { label: 'Billing & Plans', href: '/billing', icon: CreditCard },
    { label: 'Settings', href: '/settings', icon: Settings }
  ];


  const sidebarContent = (
    <div className="relative flex flex-col h-full glass-sidebar">
      {/* Floating Toggle Button centered directly on the border line (Like Admin) */}
      {!mobileOpen && onToggleCollapse && (
        <button 
          onClick={onToggleCollapse}
          className="absolute -right-3.5 top-[26px] z-40 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:bg-slate-50 flex items-center justify-center shadow-md cursor-pointer transition-all duration-200 active:scale-90"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronsRight size={14} className="text-primary-500" /> : <ChevronsLeft size={14} />}
        </button>
      )}

      {/* Brand Header */}
      <div className={`h-20 flex items-center border-b border-slate-200/80 ${
        collapsed ? 'justify-center px-2' : 'px-4 justify-between'
      }`}>
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden p-0.5" title={userSession?.schoolName || 'EduManage'}>
            {userSession?.logo ? (
              <img src={userSession.logo} alt={userSession?.schoolName || 'Logo'} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={20} className="text-primary-600" />
            )}
          </div>
          
          {!collapsed && (
            <div className="relative group/tooltip min-w-0 flex-1">
              <h1 className="text-sm font-black tracking-tight text-slate-900 truncate cursor-pointer">
                {userSession?.schoolName || 'EduManage'}
              </h1>
              <span className="text-[10px] text-primary-600 font-bold uppercase tracking-widest block truncate">
                {userSession?.code ? `ID: ${userSession.code}` : 'School ERP'}
              </span>

              {/* Floating Popper Tooltip */}
              <div className="absolute left-0 top-full mt-2 hidden group-hover/tooltip:block z-50 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap animate-fadeIn pointer-events-none">
                {userSession?.schoolName || 'EduManage'}
                <div className="w-2 h-2 bg-slate-900 border-t border-l border-white/10 rotate-45 absolute -top-1 left-4"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 py-6 space-y-1.5 overflow-y-auto ${
        collapsed ? 'px-2' : 'px-4'
      }`}>
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          const linkEl = (
            <Link
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center ${
                collapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-3'
              } rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border border-primary-100 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} className={`transition-colors shrink-0 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {!collapsed && <span className="text-sm truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {item.badge}
                </span>
              )}

              {collapsed && item.badge && (
                <span className="w-2 h-2 rounded-full bg-primary-500 absolute top-2 right-2"></span>
              )}
            </Link>
          );

          return (
            <div key={item.label} className="relative">
              {collapsed ? (
                <SidebarNavPopover icon={Icon} label={item.label} badge={item.badge} isActive={isActive}>
                  {linkEl}
                </SidebarNavPopover>
              ) : linkEl}
            </div>
          );
        })}
      </nav>

      {/* Logout Action Footer */}
      <div className={`p-4 border-t border-slate-200 ${collapsed ? 'px-2' : 'px-4'}`}>
        {collapsed ? (
          <SidebarNavPopover icon={LogOut} label="Sign Out" isActive={false}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-2 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 border border-transparent transition-all duration-200 cursor-pointer"
            >
              <LogOut size={20} className="shrink-0" />
            </button>
          </SidebarNavPopover>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 border border-transparent transition-all duration-200 cursor-pointer"
          >
            <LogOut size={20} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar with Dynamic Width */}
      <aside className={`${
        collapsed ? 'w-20' : 'w-64'
      } hidden md:block shrink-0 h-screen sticky top-0 z-50 transition-all duration-300 ease-in-out`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
          <div className="relative w-64 max-w-xs h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
