'use client';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bus, 
  CalendarCheck, 
  CreditCard, 
  CalendarDays 
} from 'lucide-react';
import { parentLogoutAction } from '@/actions/parent/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { applyDynamicTheme } from '@/lib/themeHelper';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ParentSidebar from './ParentSidebar';
import ParentHeader from './ParentHeader';
import ParentFooter from './ParentFooter';
import ParentMobileNav from './ParentMobileNav';

// Context for sharing selected child across parent portal pages
export const ParentChildContext = createContext(null);
export const useParentChild = () => useContext(ParentChildContext);

export default function ParentLayout({ user, children }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  
  const childrenList = user?.children || [];
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const activeChild = childrenList[selectedChildIndex] || null;

  // Derive school information from active child or parent session
  const schoolInfo = activeChild?.school || 
                     user?.school || 
                     user?.children?.[0]?.school || 
                     null;

  const schoolName = schoolInfo?.name || schoolInfo?.school_name || 'EduManage Academy';
  const schoolLogo = schoolInfo?.logo_url || schoolInfo?.logo;
  const schoolCode = schoolInfo?.code || schoolInfo?.school_code || 'SCH-2026';

  // Apply school's dynamic primary theme
  useEffect(() => {
    const schoolColor = schoolInfo?.primary_color || 
                        schoolInfo?.primaryColor || 
                        user?.children?.[0]?.school?.primary_color;
    if (schoolColor) {
      applyDynamicTheme(schoolColor);
    }
  }, [schoolInfo, user]);

  // Handle outside clicks for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const navItems = [
    { label: 'Parent Hub', href: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'Live Bus Tracking', href: '/parent/bus-tracking', icon: Bus },
    { label: 'Attendance & Gate Logs', href: '/parent/attendance', icon: CalendarCheck },
    { label: 'Fees & Invoices', href: '/parent/fees', icon: CreditCard },
    { label: 'Ward Timetable', href: '/parent/timetable', icon: CalendarDays },
  ];

  const handleLogoutTrigger = () => {
    setProfileDropdownOpen(false);
    setMobileOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await parentLogoutAction();
      notifySuccess('Logged out successfully');
      router.push('/parent/login');
    } catch (err) {
      notifyError(err.message || 'Logout failed');
      setLoggingOut(false);
    }
  };

  const parentName = user?.name || 'Guardian';
  const parentPhone = user?.phone || '+91 9876543210';
  const parentEmail = user?.email || '';

  return (
    <ParentChildContext.Provider value={{ activeChild, childrenList, setSelectedChildIndex, selectedChildIndex }}>
      <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-primary-500 selection:text-white">
        {/* Mobile Drawer Backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* MODULAR PARENT SIDEBAR */}
        <ParentSidebar
          schoolName={schoolName}
          schoolLogo={schoolLogo}
          schoolCode={schoolCode}
          parentName={parentName}
          parentPhone={parentPhone}
          childrenList={childrenList}
          selectedChildIndex={selectedChildIndex}
          setSelectedChildIndex={setSelectedChildIndex}
          activeChild={activeChild}
          navItems={navItems}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogoutTrigger}
        />

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* MODULAR PARENT HEADER */}
          <ParentHeader
            parentName={parentName}
            parentPhone={parentPhone}
            parentEmail={parentEmail}
            setMobileOpen={setMobileOpen}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            handleLogout={handleLogoutTrigger}
            dropdownRef={dropdownRef}
          />

          {/* Page Content View */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-24 lg:pb-8">
            {children}
          </main>

          {/* MODULAR PARENT FOOTER (Hidden on mobile to avoid bottom overlap) */}
          <div className="hidden lg:block">
            <ParentFooter schoolName={schoolName} />
          </div>
        </div>

        {/* MOBILE / TABLET NATIVE APP BOTTOM NAVIGATION BAR */}
        <ParentMobileNav user={user} onOpenDrawer={() => setMobileOpen(true)} />

        {/* REUSABLE LOGOUT CONFIRMATION MODAL */}
        <ConfirmModal
          isOpen={logoutModalOpen}
          onClose={() => !loggingOut && setLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
          title="Sign Out Guardian Portal"
          message={`Are you sure you want to sign out from ${parentName}'s parent account?`}
          confirmText="Yes, Sign Out"
          cancelText="Cancel"
          type="danger"
          loading={loggingOut}
        />
      </div>
    </ParentChildContext.Provider>
  );
}
