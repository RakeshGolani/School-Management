'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Menu, 
  Settings, 
  Shield, 
  LogOut, 
  ChevronDown, 
  CheckCircle,
  Building2,
  Sparkles,
  Command
} from 'lucide-react';
import { getSessionAction, logoutAction } from '@/actions/school/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { applyDynamicTheme } from '@/lib/themeHelper';
import { usePathname } from 'next/navigation';
import AcademicYearHeaderDropdown from '@/components/layout/AcademicYearHeaderDropdown';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useClickOutside } from '@/hooks/useClickOutside';


/**
 * Ultra-Premium Top Header Bar Component
 */
export default function Header({ 
  onMobileMenuToggle, 
  title
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  let pageTitle = title || 'Overview';
  if (pathname === '/profile') pageTitle = 'My School Profile';
  else if (pathname === '/students') pageTitle = 'Students Directory';
  else if (pathname === '/teachers') pageTitle = 'Teachers Directory';
  else if (pathname === '/billing') pageTitle = 'Billing & Plans';
  else if (pathname === '/dashboard') pageTitle = 'Overview';
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);

  const notifRef = useClickOutside(() => setNotificationsOpen(false));
  const profileRef = useClickOutside(() => setProfileOpen(false));

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSessionAction();
        if (!sessionData || !sessionData.user) {
          await logoutAction();
          router.push('/login');
          return;
        }

        setUserSession(sessionData.user);
        applyDynamicTheme(sessionData.user.primaryColor);

        if (sessionData.user.id) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
          const res = await fetch(`${apiUrl}/profile?schoolId=${sessionData.user.id}`, { cache: 'no-store' });
          if (res.status === 401 || res.status === 403) {
            await logoutAction();
            router.push('/login');
            return;
          }
          const profileRes = await res.json();
          if (profileRes.success && profileRes.data) {
            setUserSession(profileRes.data);
            applyDynamicTheme(profileRes.data.primaryColor || profileRes.data.primary_color);
          }
        }
      } catch (err) {
        console.warn('Could not fetch session data in Header:', err);
      }
    };

    fetchSession();

    window.addEventListener('sessionUpdated', fetchSession);
    return () => window.removeEventListener('sessionUpdated', fetchSession);
  }, []);

  const getInitials = () => {
    const nameStr = userSession?.schoolName || userSession?.name || 'Greenwood Intl';
    const words = nameStr.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const getLogoUrl = () => {
    return userSession?.logo_url || userSession?.logo || null;
  };

  const displayName = userSession?.schoolName || userSession?.name || 'Greenwood Intl';
  const displayEmail = userSession?.email || 'school@gmail.com';
  const displayCode = userSession?.code || 'SCH-1001';

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutTrigger = () => {
    setProfileOpen(false);
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

  return (
    <header className="h-20 shrink-0 min-h-[80px] bg-white/95 backdrop-blur-md flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-xs shadow-slate-200/60 transition-all duration-250">
      
      {/* 🌟 Left Section: Mobile Toggle & Desktop Page Title */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMobileMenuToggle} 
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        >
          <Menu size={22} />
        </button>
        {/* Desktop Page Title */}
        <span className="hidden md:inline-block text-xs font-black text-slate-800 uppercase tracking-widest bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-xl">
          {pageTitle}
        </span>
      </div>

      {/* 🔍 Center Search Bar with Keyboard Badge */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6 relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Quick search students, NFC card UID, faculty..."
          className="w-full bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-xl py-2 pl-10 pr-12 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 shadow-2xs"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5 pointer-events-none">
          <Command size={10} /> K
        </span>
      </div>

      {/* ⚡ Right Controls: Quick Pill, Notifications, User Profile */}
      <div className="flex items-center space-x-3.5">
        
        {/* Quick Academic Year Dropdown Selector */}
        <AcademicYearHeaderDropdown />


        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer relative shadow-2xs"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white absolute top-2 right-2 animate-pulse"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200/90 p-4 rounded-2xl space-y-3 shadow-2xl z-[100] animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-1.5">
                  <Bell size={14} className="text-primary-600" />
                  <span className="text-xs font-bold text-slate-900">System Notifications</span>
                </div>
                <span className="text-[10px] bg-primary-50 border border-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-bold">2 NEW</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-slate-700">
                  <p className="font-bold text-slate-900 flex items-center justify-between">
                    <span>NFC Bus Route #12 Active</span>
                    <span className="text-[9px] text-slate-400 font-normal">10m ago</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">324 students scanned & checked in today</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition text-slate-700">
                  <p className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Faculty Attendance Ready</span>
                    <span className="text-[9px] text-slate-400 font-normal">1h ago</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Grade 10 teachers submitted morning logs</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic User Profile Pill & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-3 pl-3 pr-2 py-1.5 rounded-2xl border border-slate-200/80 hover:border-primary-500/50 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs group-hover:border-primary-500 transition overflow-hidden p-0.5 shrink-0">
              {getLogoUrl() ? (
                <img src={getLogoUrl()} alt="School Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-black text-slate-800">{getInitials()}</span>
              )}
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                <span className="truncate max-w-[140px]">{displayName}</span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-primary-600' : ''}`} />
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center mt-0.5">
                <CheckCircle size={10} className="mr-1 text-emerald-500" /> Verified Campus
              </span>
            </div>
          </button>

          {/* Profile Dropdown Panel */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-200/90 p-4 rounded-2xl space-y-4 shadow-2xl z-[100] animate-fadeIn">
              {/* Profile Card Header */}
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden p-0.5">
                  {getLogoUrl() ? (
                    <img src={getLogoUrl()} alt="School Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-slate-800">{getInitials()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                  <span className="inline-block mt-1.5 bg-slate-100 border border-slate-200 text-primary-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Code: {displayCode}
                  </span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-1 text-xs">
                <a
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-medium"
                >
                  <Building2 size={16} className="text-primary-600" />
                  <span>My School Profile</span>
                </a>
                <a
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-medium"
                >
                  <Settings size={16} className="text-primary-600" />
                  <span>Account Settings</span>
                </a>
                <a
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-medium"
                >
                  <Shield size={16} className="text-primary-600" />
                  <span>System & Security</span>
                </a>
              </div>

              {/* Logout Action */}
              <div className="border-t border-slate-100 pt-2">
                <button
                  onClick={handleLogoutTrigger}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </header>
  );
}
