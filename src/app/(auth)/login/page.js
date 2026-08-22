'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  GraduationCap, 
  ArrowLeft, 
  ShieldCheck, 
  Bus, 
  Radio, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
  KeyRound,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { loginAction } from '@/actions/authActions';
import { loginSchema } from '@/validators/authSchemas';
import { notifySuccess, notifyError } from '@/lib/notify';

/**
 * Dedicated School Portal Login Page
 * Fully adapts dynamically to the School's custom primary theme branding color!
 */
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // 1. Client-side Yup validation
    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errorsObj = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errorsObj[err.path]) {
            errorsObj[err.path] = err.message;
          }
        });
        setFieldErrors(errorsObj);
        notifyError('Please fix the form errors highlighted in red.');
      } else {
        notifyError(yupErr.message);
      }
      setLoading(false);
      return;
    }

    try {
      // 2. Invoke Server Action
      const result = await loginAction({ email, password });

      if (!result.success) {
        if (result.errors) {
          const errs = {};
          Object.entries(result.errors).forEach(([field, msgs]) => {
            errs[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          });
          setFieldErrors(errs);
        }
        notifyError(result.message || 'Invalid email or password.');
        return;
      }

      notifySuccess(`${result.message || 'Authentication successful'}. Redirecting to portal...`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);

    } catch (err) {
      notifyError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-fadeIn">
      {/* LEFT COLUMN: BRANDING & TELEMETRY SHOWCASE (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary-900/40 via-slate-900/90 to-slate-950 p-10 flex-col justify-between border-r border-white/10 relative overflow-hidden">
        {/* Subtle background glow with dynamic school color */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'var(--theme-primary-500, #4f46e5)' }}
        ></div>

        {/* Top Header / Branding */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Edu<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-200">Manage</span>
              </span>
              <span className="block text-[10px] font-semibold text-primary-400 tracking-wider uppercase -mt-1">
                Institutional OS
              </span>
            </div>
          </Link>

          <div className="space-y-2 pt-4">
            <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-primary-300">
              <Sparkles size={13} className="text-primary-400" />
              <span>Campus Management 2.0</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">
              One Unified Gateway for School Operations
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Automated timetable allocation, real-time NFC student attendance, live bus fleet GPS, and instant fee invoicing.
            </p>
          </div>
        </div>

        {/* Simulated Real-Time Activity Card */}
        <div className="my-8 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Radio size={14} className="text-emerald-400" /> Live Campus Stream
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-ping"></div>
              <div className="text-slate-300">
                <span className="font-bold text-white">Route #04</span> • 38 Students Checked In
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300">Dynamic School Brand Active</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Guarantees */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> 256-Bit Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" /> 99.9% Uptime SLA
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">EduManage</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sign In to School Portal
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter your institutional email address and password to continue.
          </p>
        </div>

        {/* Login Form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="admin@school.com"
                className={`w-full bg-slate-950/70 border ${
                  fieldErrors.email ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/30'
                } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition duration-200`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.email}</p>
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
                className="text-xs text-primary-400 hover:text-primary-300 font-semibold transition"
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
                  fieldErrors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/10 focus:border-primary-500 focus:ring-primary-500/30'
                } rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition duration-200`}
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
                className="w-4 h-4 rounded bg-slate-950 border border-white/20 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <span>Remember this browser for 30 days</span>
            </label>
          </div>

          {/* Submit Button with dynamic school primary theme */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 hover:from-primary-500 hover:to-primary-400 shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating Credentials...</span>
              </div>
            ) : (
              <>
                <span>Sign In to School Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Helper */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className="text-primary-400" /> Quick Demo Fill
            </span>
            <span className="text-[10px] text-slate-500">1-Click Auto Fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@school.com', 'admin123')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">School Administrator</span>
              <span className="text-[10px] text-primary-400 font-mono ml-1">Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('principal@school.com', 'password123')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">Principal Desk</span>
              <span className="text-[10px] text-primary-400 font-mono ml-1">Fill</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <Link href="/" className="hover:text-white transition flex items-center gap-1.5 font-medium">
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <span className="text-[11px] text-slate-500">Protected by CloudShield</span>
        </div>
      </div>
    </div>
  );
}
