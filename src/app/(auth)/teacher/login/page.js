'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  GraduationCap, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  BadgeCheck, 
  CheckCircle2, 
  KeyRound, 
  BookOpen, 
  CalendarDays,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { teacherLoginAction, getTeacherSessionAction } from '@/actions/teacher/authActions';
import { getSchoolBrandingAction, getSystemSettingsAction } from '@/actions/school/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { applyDynamicTheme } from '@/lib/themeHelper';

/**
 * Dedicated Teacher Portal & Mobile App Login Page
 * Route: /teacher/login
 * Supports login via Employee ID or Email Address + Password.
 */
export default function TeacherLogin() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [brandingLoading, setBrandingLoading] = useState(true);
  const [schoolBranding, setSchoolBranding] = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    company_name: 'Vidyadmin',
    tagline: 'Simplifying Education, Empowering Admins',
    logo_url: null
  });

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const [teacherSession, brandingRes, settingsRes] = await Promise.all([
          getTeacherSessionAction().catch(() => null),
          getSchoolBrandingAction().catch(() => null),
          getSystemSettingsAction().catch(() => null)
        ]);

        if (settingsRes?.success && settingsRes?.data) {
          setSystemSettings(settingsRes.data);
        }

        if (teacherSession?.user?.id) {
          router.replace('/teacher/dashboard');
          return;
        }

        if (brandingRes?.hasSchoolCookie) {
          setSchoolBranding(brandingRes);
          applyDynamicTheme(brandingRes.primaryColor || '#0047AB');
        } else {
          applyDynamicTheme('#0047AB');
        }
      } catch (err) {
        applyDynamicTheme('#0047AB');
      } finally {
        setBrandingLoading(false);
      }
    }
    checkExistingSession();
  }, [router]);

  const handleQuickFill = (idVal, passVal) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Client-side quick check
    if (!identifier.trim()) {
      setFieldErrors(prev => ({ ...prev, identifier: 'Employee ID or Email is required' }));
      setLoading(false);
      return;
    }
    if (!password) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
      setLoading(false);
      return;
    }

    try {
      const res = await teacherLoginAction({ identifier, password, rememberMe });
      if (!res.success) {
        notifyError(res.message || 'Login failed');
        if (res.errors) {
          setFieldErrors(res.errors);
        }
        setLoading(false);
        return;
      }

      notifySuccess('Faculty login successful! Entering Teacher Desk...');

      // Dynamic theme styling
      if (res.user?.school?.primaryColor || res.user?.school?.primary_color) {
        applyDynamicTheme(res.user.school.primaryColor || res.user.school.primary_color);
      }

      setTimeout(() => {
        router.replace('/teacher/dashboard');
      }, 500);

    } catch (err) {
      notifyError('An unexpected connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-fadeIn">
      {/* LEFT COLUMN: TEACHER SPOTLIGHT & INFO (Desktop - Light Theme) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary-50/70 via-slate-50 to-white p-10 flex-col justify-between border-r border-slate-200 relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'var(--theme-primary-500, #0047AB)' }}
        ></div>

        {/* Top Header / Branding */}
        <div className="space-y-6">
          {brandingLoading ? (
            <div className="flex items-center space-x-3.5 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-2 min-w-0">
                <div className="h-6 w-32 bg-slate-200 rounded-md" />
                <div className="h-3.5 w-44 bg-slate-200 rounded-md" />
              </div>
            </div>
          ) : (
            <Link href="/" className="inline-flex items-center space-x-3.5 group">
              {schoolBranding?.schoolName ? (
                schoolBranding.logo ? (
                  <div className="w-16 h-16 rounded-full bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                    <img src={schoolBranding.logo} alt={schoolBranding.schoolName} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform relative shrink-0 text-white font-black text-2xl">
                    {schoolBranding.schoolName.charAt(0).toUpperCase()}
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-white"></span>
                  </div>
                )
              ) : systemSettings?.logo_url ? (
                <div className="w-16 h-16 rounded-full bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                  <img src={systemSettings.logo_url} alt={systemSettings.company_name || 'Logo'} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform relative shrink-0">
                  <GraduationCap size={32} className="text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-white"></span>
                </div>
              )}
              <div className="min-w-0">
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                  {schoolBranding?.schoolName ? (
                    <span className="truncate max-w-[200px]">{schoolBranding.schoolName}</span>
                  ) : (
                    <span>{systemSettings?.company_name || 'Vidyadmin'}</span>
                  )}
                </span>
                <span className="block text-xs font-semibold text-secondary-600 tracking-normal truncate max-w-[240px]">
                  {schoolBranding?.code ? `Faculty • ${schoolBranding.code}` : (systemSettings?.tagline || 'Faculty Workspace')}
                </span>
              </div>
            </Link>
          )}

          <div className="space-y-2 pt-4">
            <div className="inline-flex items-center space-x-2 bg-primary-100/80 border border-primary-200/80 px-3 py-1 rounded-full text-[11px] font-bold text-primary-800">
              <Sparkles size={13} className="text-primary-600" />
              <span>Dedicated Teacher Portal</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              Classroom Management, Grading & Attendance
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              1-click attendance logs, master timetable schedule matrix, student behavior reports, and parent communication.
            </p>
          </div>
        </div>

        {/* Real-time Feature Snapshot */}
        <div className="my-8 space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold flex items-center gap-1.5">
                <BookOpen size={14} className="text-primary-600" /> Class Teacher Desk
              </span>
              <span className="text-[10px] text-accent-700 font-bold bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <CalendarDays size={14} className="text-primary-600 shrink-0" />
              <div className="text-slate-700 font-medium">
                <span className="font-bold text-slate-900">Period Allocation Matrix</span> • Auto-fill rooms
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <CheckCircle2 size={14} className="text-accent-600 shrink-0" />
              <span className="text-slate-700 font-medium">Single Teacher = 1 Class Teacher Rule Enforced</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantees */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accent-600" /> 256-Bit TLS Secured
          </span>
          <span className="flex items-center gap-1.5">
            <UserCheck size={14} className="text-primary-600" /> Faculty Gateway
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: TEACHER LOGIN FORM (Light Theme) */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 bg-white">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between border-b border-slate-200 pb-4">
          {brandingLoading ? (
            <div className="flex items-center space-x-2.5 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
              <div className="h-5 w-32 bg-slate-200 rounded-md" />
            </div>
          ) : (
            <Link href="/" className="flex items-center space-x-2.5">
              {schoolBranding?.schoolName ? (
                schoolBranding.logo ? (
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200/90 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    <img src={schoolBranding.logo} alt={schoolBranding.schoolName} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center relative shrink-0 shadow-xs text-white font-black text-lg">
                    {schoolBranding.schoolName.charAt(0).toUpperCase()}
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary-500 border border-white"></span>
                  </div>
                )
              ) : systemSettings?.logo_url ? (
                <div className="w-12 h-12 rounded-full bg-white border border-slate-200/90 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <img src={systemSettings.logo_url} alt={systemSettings.company_name || 'Logo'} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center relative shrink-0 shadow-xs">
                  <GraduationCap size={20} className="text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary-500 border border-white"></span>
                </div>
              )}
              <span className="text-lg font-black tracking-tight text-slate-900 truncate max-w-[200px]">
                {schoolBranding?.schoolName ? `${schoolBranding.schoolName} Faculty` : `${systemSettings?.company_name || 'Vidyadmin'} Teacher`}
              </span>
            </Link>
          )}
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
            <BadgeCheck size={12} /> Faculty Sign In
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Class Teacher & Faculty Login
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Sign in using your Employee ID (e.g. <span className="text-primary-700 font-mono font-bold">EMP-1001</span>) or institutional email.
          </p>
        </div>

        {/* Form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Field (Employee ID or Email) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Employee ID or Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <UserCheck size={18} />
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                }}
                placeholder="EMP-1001 or teacher@school.com"
                className={`w-full bg-slate-50/70 border ${
                  fieldErrors.identifier ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                } rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition duration-200`}
              />
            </div>
            {fieldErrors.identifier && (
              <p className="text-xs text-rose-500 font-medium pl-1">{fieldErrors.identifier}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password <span className="text-rose-500">*</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-primary-600 hover:text-primary-700 font-bold transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="••••••••••••"
                className={`w-full bg-slate-50/70 border ${
                  fieldErrors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                } rounded-xl py-3 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-500 font-medium pl-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remember Session Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-white border border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span>Remember teacher login session</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating Faculty...</span>
              </div>
            ) : (
              <>
                <span>Sign In as Teacher</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Helper */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className="text-primary-600" /> Quick Demo Fill
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">1-Click Auto Fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('EMP-1001', 'Welcome@123')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center justify-between transition cursor-pointer shadow-xs"
            >
              <span className="truncate">Employee ID (EMP-1001)</span>
              <span className="text-[10px] text-primary-600 font-mono font-bold ml-1">Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('teacher@school.com', 'Welcome@123')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center justify-between transition cursor-pointer shadow-xs"
            >
              <span className="truncate">Email Sign In</span>
              <span className="text-[10px] text-primary-600 font-mono font-bold ml-1">Fill</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4">
          <Link href="/" className="hover:text-slate-900 transition flex items-center gap-1.5 font-medium">
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-bold">
              School Admin
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/parent/login" className="text-primary-600 hover:text-primary-700 font-bold">
              Parent
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/student/login" className="text-primary-600 hover:text-primary-700 font-bold">
              Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
