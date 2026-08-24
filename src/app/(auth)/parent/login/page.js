'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Users, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Sparkles, 
  BadgeCheck, 
  CheckCircle2, 
  KeyRound, 
  Bus, 
  Radio, 
  Smartphone, 
  RefreshCw, 
  Eye, 
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { 
  parentSendOtpAction, 
  parentVerifyOtpAction, 
  parentLoginAction, 
  getParentSessionAction 
} from '@/actions/parent/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

/**
 * Dedicated Parent & Guardian Login Page
 * Route: /parent/login
 * Primary Flow: Mobile Number with OTP Verification
 * Secondary Flow: Email / Phone + Password
 */
export default function ParentLogin() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
  
  // OTP State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');
  
  // Password State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const session = await getParentSessionAction();
        if (session?.user?.id) {
          router.replace('/parent/dashboard');
        }
      } catch (err) {
        // Continue to login
      }
    }
    checkExistingSession();
  }, [router]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (phoneVal = phone) => {
    setFieldErrors({});
    const cleanPhone = phoneVal.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFieldErrors({ phone: 'Please enter a valid 10-digit registered mobile number.' });
      notifyError('Enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const result = await parentSendOtpAction({ phone: cleanPhone });
      if (!result.success) {
        notifyError(result.message || 'Failed to send OTP to mobile number.');
        return;
      }

      setOtpSent(true);
      setCountdown(30);
      if (result.dev_otp) {
        setDevOtpHint(result.dev_otp);
      }
      notifySuccess('OTP sent successfully to registered mobile number!');
    } catch (err) {
      notifyError(err.message || 'An error occurred while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!otp.trim()) {
      setFieldErrors({ otp: 'Please enter the 6-digit verification OTP.' });
      notifyError('Please enter verification OTP.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const result = await parentVerifyOtpAction({ phone: cleanPhone, otp: otp.trim() });

      if (!result.success) {
        notifyError(result.message || 'Invalid or expired OTP.');
        return;
      }

      notifySuccess('Parent authenticated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/parent/dashboard');
      }, 800);
    } catch (err) {
      notifyError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!identifier.trim()) errors.identifier = 'Please enter your registered email or phone.';
    if (!password) errors.password = 'Please enter your password.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      notifyError('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await parentLoginAction({ identifier, password });

      if (!result.success) {
        notifyError(result.message || 'Invalid credentials.');
        return;
      }

      notifySuccess('Parent login successful! Redirecting...');
      setTimeout(() => {
        router.push('/parent/dashboard');
      }, 800);
    } catch (err) {
      notifyError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillDemo = (demoPhone) => {
    setAuthMode('otp');
    setPhone(demoPhone);
    setOtpSent(false);
    setDevOtpHint('');
    setOtp('');
    setFieldErrors({});
    handleSendOtp(demoPhone);
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-fadeIn">
      {/* LEFT COLUMN: PARENT GUARDIAN SPOTLIGHT & SMART BUS */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-900/50 via-slate-900/90 to-slate-950 p-10 flex-col justify-between border-r border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-emerald-500"></div>

        {/* Top Header / Branding */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Edu<span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">Manage</span>
              </span>
              <span className="block text-[10px] font-semibold text-emerald-400 tracking-wider uppercase -mt-1">
                Parent & Guardian Hub
              </span>
            </div>
          </Link>

          <div className="space-y-2 pt-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Smart Bus & Ward Portal</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">
              Live Fleet GPS Tracking & Student Safety
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Track school bus in real-time on road-snapped maps, get instant NFC boarding alerts, fee payment receipts, and academic cards.
            </p>
          </div>
        </div>

        {/* Live Transit Stream Widget */}
        <div className="my-8 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Radio size={14} className="text-emerald-400" /> Live Smart Bus Stream
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ACTIVE GPS
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <Bus size={16} className="text-amber-400 shrink-0" />
              <div className="text-slate-300">
                <span className="font-bold text-white">Route #01 (City Express)</span> • 3 Mins away from stop
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300">Instant SMS & Mobile OTP Verification</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantees */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> AES-256 Secured
          </span>
          <span className="flex items-center gap-1.5">
            <Smartphone size={14} className="text-emerald-400" /> Parent Portal & App
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: PARENT LOGIN FORM */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">Parent Portal</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BadgeCheck size={12} /> Parent & Guardian Gateway
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Parent Secure Sign In
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Access your child&apos;s daily attendance, bus tracking, and fees via verified mobile OTP.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-950/70 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setFieldErrors({}); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'otp'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={14} /> Mobile OTP Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setFieldErrors({}); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'password'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={14} /> Email / Password
          </button>
        </div>

        {/* ================= MODE 1: MOBILE NUMBER WITH OTP ================= */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {/* Step 1: Mobile Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Registered Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^0-9]/g, ''));
                      setFieldErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="9876543210"
                    disabled={otpSent && countdown > 0}
                    className={`w-full bg-slate-950/70 border ${
                      fieldErrors.phone ? 'border-rose-500 focus:border-rose-500' : 'border-white/10 focus:border-emerald-500'
                    } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition duration-200`}
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading || phone.length < 10}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Get OTP'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>
              {fieldErrors.phone && (
                <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Step 2: OTP Input (Appears when OTP is sent) */}
            {otpSent && (
              <form noValidate onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Enter 6-Digit OTP <span className="text-rose-500">*</span>
                    </label>
                    {devOtpHint && (
                      <button
                        type="button"
                        onClick={() => setOtp(devOtpHint)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono font-bold underline"
                      >
                        Auto-Fill ({devOtpHint})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <KeyRound size={18} />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/[^0-9]/g, ''));
                        setFieldErrors((prev) => ({ ...prev, otp: '' }));
                      }}
                      placeholder="123456"
                      className={`w-full bg-slate-950/70 border ${
                        fieldErrors.otp ? 'border-rose-500' : 'border-white/10 focus:border-emerald-500'
                      } rounded-xl py-3 pl-11 pr-4 text-center text-lg font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition duration-200`}
                    />
                  </div>
                  {fieldErrors.otp && (
                    <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.otp}</p>
                  )}
                </div>

                {/* Resend Timer */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  {countdown > 0 ? (
                    <span>Resend OTP in <span className="text-emerald-400 font-bold">{countdown}s</span></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Verify & Access Ward Portal</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= MODE 2: EMAIL / PASSWORD LOGIN ================= */}
        {authMode === 'password' && (
          <form noValidate onSubmit={handlePasswordLogin} className="space-y-4 animate-fadeIn">
            {/* Email/Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Email Address or Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Users size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                  }}
                  placeholder="parent@example.com or 9876543210"
                  className={`w-full bg-slate-950/70 border ${
                    fieldErrors.identifier ? 'border-rose-500' : 'border-white/10 focus:border-emerald-500'
                  } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition duration-200`}
                />
              </div>
              {fieldErrors.identifier && (
                <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
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
                    fieldErrors.password ? 'border-rose-500' : 'border-white/10 focus:border-emerald-500'
                  } rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In as Parent</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Fill Helper */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className="text-emerald-400" /> Quick Demo Fill
            </span>
            <span className="text-[10px] text-slate-500">1-Click Auto OTP</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFillDemo('9876543210')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">Parent (9876543210)</span>
              <span className="text-[10px] text-emerald-400 font-mono ml-1">Auto OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setIdentifier('parent@example.com');
                setPassword('Welcome@123');
                setFieldErrors({});
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">Parent Password</span>
              <span className="text-[10px] text-emerald-400 font-mono ml-1">Fill</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <Link href="/" className="hover:text-white transition flex items-center gap-1.5 font-medium">
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              School Admin
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/student/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              Student
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/teacher/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Teacher
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
