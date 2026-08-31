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
  Clock,
  FileText,
  Bell
} from 'lucide-react';

import { getSessionAction, logoutAction } from '@/actions/school/authActions';
import { getSchoolProfileAction } from '@/actions/school/profileActions';
import { getDashboardCountsAction } from '@/actions/school/dashboardActions';
import { getStudentsAction } from '@/actions/school/studentActions';
import { getTeachersAction } from '@/actions/school/teacherActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import SidebarNavPopover from '@/components/ui/SidebarNavPopover';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { usePackage } from '@/context/PackageContext';

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
  const { hasModule, packageInfo, loading: packageLoading } = usePackage();
  const [mounted, setMounted] = useState(false);
  const [studentCount, setStudentCount] = useState(null);
  const [teacherCount, setTeacherCount] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        setSessionLoading(true);
        const sessionData = await getSessionAction();
        if (sessionData && sessionData.user) {
          setUserSession(sessionData.user);

          if (sessionData.user.id) {
            const profileRes = await getSchoolProfileAction();
            if (profileRes?.success && profileRes?.data) {
              setUserSession(profileRes.data);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch session data in Sidebar:', err);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchCounts();
    fetchSession();

    window.addEventListener('sessionUpdated', fetchSession);
    return () => window.removeEventListener('sessionUpdated', fetchSession);
  }, [activeYear?.id]); // re-fetch counts whenever active academic year changes

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutTrigger = () => {
    if (onClose) onClose();
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutAction();
      notifySuccess('Logged out successfully');
      router.push('/login');
    } catch (err) {
      notifyError(err.message || 'Logout failed');
      setLoggingOut(false);
    }
  };

  const allNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity, moduleKey: 'always' },
    { label: 'Classes & Sections', href: '/classes', icon: BookOpen, moduleKey: 'academics' },
    { label: 'Students', href: '/students', icon: Users, badge: studentCount !== null ? studentCount.toString() : null, moduleKey: 'students' },
    { label: 'Teachers', href: '/teachers', icon: GraduationCap, badge: teacherCount !== null ? teacherCount.toString() : null, moduleKey: 'teachers' },
    { label: 'Smart Bus', href: '/transport', icon: Bus, badge: 'Live', moduleKey: 'transport' },
    { label: 'Attendance', href: '/attendance', icon: Calendar, moduleKey: 'attendance' },
    { label: 'Leave Requests', href: '/leaves', icon: FileText, moduleKey: 'attendance' },
    { label: 'Timetable & Periods', href: '/timetable', icon: Clock, moduleKey: 'timetable' },
    { label: 'Student Fees', href: '/fees', icon: Landmark, moduleKey: 'fees' },
    { label: 'Notifications', href: '/notifications', icon: Bell, moduleKey: 'always' },
    { label: 'Academic Year', href: '/academic-years', icon: CalendarDays, moduleKey: 'academic_years' },
    { label: 'Billing & Plans', href: '/billing', icon: CreditCard, moduleKey: 'always' },
    { label: 'Settings', href: '/settings', icon: Settings, moduleKey: 'always' }
  ];

  const navItems = allNavItems.filter(item => hasModule(item.moduleKey));


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
          {collapsed ? (
            <SidebarNavPopover label={userSession?.schoolName || 'Vidyadmin'} badge={userSession?.code ? `ID: ${userSession.code}` : undefined} isActive={false}>
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center shadow-xs overflow-hidden p-1 cursor-pointer hover:border-primary-400 transition-colors">
                {userSession?.logo ? (
                  <img src={userSession.logo} alt={userSession?.schoolName || 'Logo'} className="w-full h-full object-contain" />
                ) : (!mounted || (sessionLoading && !userSession)) ? (
                  <div className="w-full h-full bg-slate-200 rounded-xl animate-pulse" />
                ) : (
                  <BookOpen size={20} className="text-primary-600" />
                )}
              </div>
            </SidebarNavPopover>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200/90 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden p-0.5" title={userSession?.schoolName || 'Vidyadmin'}>
              {userSession?.logo ? (
                <img src={userSession.logo} alt={userSession?.schoolName || 'Logo'} className="w-full h-full object-contain" />
              ) : (!mounted || (sessionLoading && !userSession)) ? (
                <div className="w-full h-full bg-slate-200 rounded-full animate-pulse" />
              ) : (
                <BookOpen size={20} className="text-primary-600" />
              )}
            </div>
          )}
          
          {!collapsed && (
            (!mounted || (sessionLoading && !userSession)) ? (
              <div className="space-y-1.5 min-w-0 flex-1 animate-pulse">
                <div className="h-4 w-28 bg-slate-200 rounded-md" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            ) : (
              <div className="relative group/tooltip min-w-0 flex-1">
                <h1 className="text-sm font-black tracking-tight text-slate-900 truncate cursor-pointer">
                  {userSession?.schoolName || 'Vidyadmin'}
                </h1>
                <span className="text-[10px] text-primary-600 font-bold uppercase tracking-widest block truncate">
                  {userSession?.code ? `ID: ${userSession.code}` : 'Vidyadmin ERP'}
                </span>

                {/* Floating Popper Tooltip */}
                <div className="absolute left-0 top-full mt-2 hidden group-hover/tooltip:block z-50 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap animate-fadeIn pointer-events-none">
                  {userSession?.schoolName || 'Vidyadmin'}
                  <div className="w-2 h-2 bg-slate-900 border-t border-l border-white/10 rotate-45 absolute -top-1 left-4"></div>
                </div>
              </div>
            )
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

        {!mounted || (packageLoading && !packageInfo) ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              collapsed ? (
                <div key={i} className="flex justify-center py-0.5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-200/80 animate-pulse" />
                </div>
              ) : (
                <div
                  key={i}
                  className="flex items-center px-3 py-2 rounded-2xl animate-pulse gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-200/80 shrink-0" />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div
                      className="h-3.5 bg-slate-200/80 rounded-md"
                      style={{ width: `${i % 3 === 0 ? 65 : i % 2 === 0 ? 80 : 55}%` }}
                    />
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            if (collapsed) {
              return (
                <div key={item.label} className="flex justify-center py-0.5">
                  <SidebarNavPopover icon={Icon} label={item.label} badge={item.badge} isActive={isActive}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 scale-105 ring-2 ring-primary-500/20'
                          : 'text-slate-500 hover:text-primary-600 hover:bg-slate-100/90 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                      {item.badge && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 ring-2 ring-white absolute top-1 right-1 animate-pulse" />
                      )}
                    </Link>
                  </SidebarNavPopover>
                </div>
              );
            }

            return (
              <div key={item.label} className="relative">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-2xl transition-all duration-200 group text-xs font-bold ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-100/80 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:scale-105'
                    }`}>
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className="truncate tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })
        )}
      </nav>

      {/* Logout Action Footer */}
      <div className={`p-4 border-t border-slate-100 ${collapsed ? 'px-2 flex justify-center' : 'px-4'}`}>
        {collapsed ? (
          <SidebarNavPopover icon={LogOut} label="Sign Out" isActive={false}>
            <button
              onClick={handleLogoutTrigger}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-200 cursor-pointer bg-rose-50/70 hover:scale-105 active:scale-95 shadow-2xs"
            >
              <LogOut size={18} className="shrink-0" />
            </button>
          </SidebarNavPopover>
        ) : (
          <button
            onClick={handleLogoutTrigger}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-200 cursor-pointer bg-rose-50/60"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100/70 text-rose-600 group-hover:bg-white/20 flex items-center justify-center shrink-0">
              <LogOut size={16} className="shrink-0" />
            </div>
            <span>Sign Out Desk</span>
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

      {/* REUSABLE LOGOUT CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => !loggingOut && setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out from the School Administration portal?"
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        type="danger"
        loading={loggingOut}
      />
    </>
  );
}
