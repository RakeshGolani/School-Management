'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckCircle2, 
  Bus,
  FileText,
  Bell
} from 'lucide-react';
import { studentLogoutAction } from '@/actions/student/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { applyDynamicTheme } from '@/lib/themeHelper';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import StudentFooter from './StudentFooter';
import StudentMobileNav from './StudentMobileNav';
import StudentMobileDrawer from './StudentMobileDrawer';

export default function StudentLayout({ user, children }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  // Apply school's dynamic primary theme
  useEffect(() => {
    const schoolColor = user?.school?.primary_color || user?.school?.primaryColor;
    if (schoolColor) {
      applyDynamicTheme(schoolColor);
    }
  }, [user]);

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

  const schoolPackage = user?.school?.package;
  const packageModules = Array.isArray(schoolPackage?.modules) ? schoolPackage.modules : [];
  const packageCode = typeof schoolPackage === 'string' ? schoolPackage : schoolPackage?.code;

  const hasModule = (moduleKey) => {
    if (!moduleKey || moduleKey === 'always') return true;
    if (!schoolPackage) return true;
    if (packageCode === 'SCHOOL_ONLY' && moduleKey === 'transport') return false;
    if (packageCode === 'TRANSPORT_ONLY') {
      return moduleKey === 'transport' || moduleKey === 'students';
    }
    if (packageModules.length > 0) return packageModules.includes(moduleKey);
    return true;
  };

  const allNavItems = [
    { label: 'Student Hub', href: '/student/dashboard', icon: LayoutDashboard, moduleKey: 'always' },
    { label: 'Weekly Timetable', href: '/student/timetable', icon: CalendarDays, moduleKey: 'timetable' },
    { label: 'Attendance Meter', href: '/student/attendance', icon: CheckCircle2, moduleKey: 'attendance' },
    { label: 'Smart Bus & Stops', href: '/student/transport', icon: Bus, moduleKey: 'transport' },
    { label: 'Leave Requests', href: '/student/leaves', icon: FileText, moduleKey: 'attendance' },
    { label: 'Notifications', href: '/student/notifications', icon: Bell, moduleKey: 'always' },
  ];

  const navItems = allNavItems.filter(item => hasModule(item.moduleKey));

  const handleLogoutTrigger = () => {
    setProfileDropdownOpen(false);
    setMobileOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await studentLogoutAction();
      notifySuccess('Logged out successfully');
      router.push('/student/login');
    } catch (err) {
      notifyError(err.message || 'Logout failed');
      setLoggingOut(false);
    }
  };

  const schoolName = user?.school?.name || user?.school?.school_name || 'Vidyadmin Academy';
  const schoolLogo = user?.school?.logo_url || user?.school?.logo;
  const schoolCode = user?.school?.code || user?.school?.school_code || 'SCH-2026';

  const studentName = user?.full_name || user?.first_name || 'Student';
  const studentPhoto = user?.image_url || user?.photo;
  const admissionNumber = user?.admission_number || 'ADM-001';
  const className = user?.class?.class_name 
    ? `${user.class.class_name} - ${user.class.section}`
    : user?.grade || 'Class Student';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-primary-500 selection:text-white">
      {/* DESKTOP STUDENT SIDEBAR */}
      <div className="hidden lg:flex shrink-0">
        <StudentSidebar
          schoolName={schoolName}
          schoolLogo={schoolLogo}
          schoolCode={schoolCode}
          studentName={studentName}
          studentPhoto={studentPhoto}
          admissionNumber={admissionNumber}
          className={className}
          navItems={navItems}
          mobileOpen={false}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogoutTrigger}
        />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* MODULAR STUDENT HEADER */}
        <StudentHeader
          studentName={studentName}
          studentPhoto={studentPhoto}
          admissionNumber={admissionNumber}
          className={className}
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

        {/* MODULAR STUDENT FOOTER (Hidden on mobile to avoid bottom overlap) */}
        <div className="hidden lg:block">
          <StudentFooter schoolName={schoolName} />
        </div>
      </div>

      {/* MOBILE / TABLET NATIVE APP BOTTOM NAVIGATION BAR */}
      <StudentMobileNav user={user} navItems={navItems} onOpenDrawer={() => setMobileOpen(true)} />

      {/* MOBILE / TABLET BOTTOM SHEET SLIDE-UP DRAWER */}
      <StudentMobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        studentName={studentName}
        studentPhoto={studentPhoto}
        admissionNumber={admissionNumber}
        className={className}
        schoolName={schoolName}
        schoolCode={schoolCode}
        handleLogout={handleLogoutTrigger}
      />

      {/* REUSABLE LOGOUT CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => !loggingOut && setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out Student Portal"
        message={`Are you sure you want to sign out from ${studentName}'s student account?`}
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        type="danger"
        loading={loggingOut}
      />
    </div>
  );
}
