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
import { notifySuccess, notifyError } from '@/lib/notify';

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

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const session = await getTeacherSessionAction();
        if (session?.user?.id) {
          router.replace('/teacher/dashboard');
        }
      } catch (err) {
        // Continue to login
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

    const errors = {};
    if (!identifier.trim()) {
      errors.identifier = 'Please enter your Employee ID or registered email.';
    }
    if (!password) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      notifyError('Please fix the highlighted fields.');
      setLoading(false);
      return;
    }

    try {
      const result = await teacherLoginAction({ email: identifier, password });

      if (!result.success) {
        if (result.errors) {
          const errs = {};
          Object.entries(result.errors).forEach(([field, msgs]) => {
            errs[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          });
          setFieldErrors(errs);
        }
        notifyError(result.message || 'Invalid Teacher ID or password.');
        return;
      }

      notifySuccess(`${result.message || 'Welcome Teacher!'}. Redirecting to portal...`);
      setTimeout(() => {
        router.push('/teacher/dashboard');
      }, 800);

    } catch (err) {
      notifyError(err.message || 'An unexpected error occurred during teacher sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-fadeIn">
      {/* LEFT COLUMN: TEACHER BRANDING & WORKSPACE SPOTLIGHT */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-purple-900/50 via-slate-900/90 to-slate-950 p-10 flex-col justify-between border-r border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-purple-500"></div>

        {/* Top Header / Branding */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Edu<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-200">Manage</span>
              </span>
              <span className="block text-[10px] font-semibold text-purple-400 tracking-wider uppercase -mt-1">
                Faculty Workspace
              </span>
            </div>
          </Link>

          <div className="space-y-2 pt-4">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-purple-300">
              <Sparkles size={13} className="text-purple-400" />
              <span>Dedicated Teacher Portal</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">
              Classroom Management, Grading & Attendance
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              1-click attendance logs, master timetable schedule matrix, student behavior reports, and parent communication.
            </p>
          </div>
        </div>

        {/* Real-time Feature Snapshot */}
        <div className="my-8 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <BookOpen size={14} className="text-purple-400" /> Class Teacher Desk
              </span>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <CalendarDays size={14} className="text-purple-400 shrink-0" />
              <div className="text-slate-300">
                <span className="font-bold text-white">Period Allocation Matrix</span> • Auto-fill rooms
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300">Single Teacher = 1 Class Teacher Rule Enforced</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantees */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> 256-Bit TLS Secured
          </span>
          <span className="flex items-center gap-1.5">
            <UserCheck size={14} className="text-purple-400" /> Faculty Gateway
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: TEACHER LOGIN FORM */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">Teacher Portal</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BadgeCheck size={12} /> Faculty Sign In
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Class Teacher & Faculty Login
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Sign in using your Employee ID (e.g. <span className="text-purple-300 font-mono">EMP-001</span>) or institutional email.
          </p>
        </div>

        {/* Form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Field (Employee ID or Email) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                placeholder="EMP-001 or teacher@school.com"
                className={`w-full bg-slate-950/70 border ${
                  fieldErrors.identifier ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/30'
                } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition duration-200`}
              />
            </div>
            {fieldErrors.identifier && (
              <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.identifier}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password <span className="text-rose-500">*</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition"
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
                className={`w-full bg-slate-950/70 border ${
                  fieldErrors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/30'
                } rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remember Session Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border border-white/20 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span>Remember teacher login session</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
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
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className="text-purple-400" /> Quick Demo Fill
            </span>
            <span className="text-[10px] text-slate-500">1-Click Auto Fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('EMP-1001', 'Welcome@123')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">Employee ID (EMP-1001)</span>
              <span className="text-[10px] text-purple-400 font-mono ml-1">Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('teacher@school.com', 'Welcome@123')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">Email Sign In</span>
              <span className="text-[10px] text-purple-400 font-mono ml-1">Fill</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <Link href="/" className="hover:text-white transition flex items-center gap-1.5 font-medium">
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              School Admin
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/parent/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Parent
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/student/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
