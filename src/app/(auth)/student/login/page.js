'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Smartphone, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Sparkles, 
  BadgeCheck, 
  CheckCircle2, 
  KeyRound, 
  BookOpen, 
  CalendarDays, 
  User, 
  Eye, 
  EyeOff, 
  RefreshCw 
} from 'lucide-react';
import Link from 'next/link';
import { 
  studentLoginAction, 
  studentSendOtpAction, 
  studentVerifyOtpAction, 
  getStudentSessionAction 
} from '@/actions/student/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

/**
 * Dedicated Student Profile Login Page
 * Route: /student/login
 * Primary Flow: Admission Number / Roll Number + Password / DOB
 * Secondary Flow: Mobile Number with OTP Verification
 */
export default function StudentLogin() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState('credentials'); // 'credentials' | 'otp'

  // Credentials State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const session = await getStudentSessionAction();
        if (session?.user?.id) {
          router.replace('/student/dashboard');
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
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!identifier.trim()) errors.identifier = 'Please enter your Admission Number or Roll Number.';
    if (!password) errors.password = 'Please enter your password or Date of Birth.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      notifyError('Please fill required fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await studentLoginAction({ identifier, password });

      if (!result.success) {
        notifyError(result.message || 'Invalid Admission Number or password.');
        return;
      }

      notifySuccess('Student authenticated successfully! Redirecting to student hub...');
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 800);
    } catch (err) {
      notifyError(err.message || 'Student login failed.');
    } finally {
      setLoading(false);
    }
  };

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
      const result = await studentSendOtpAction({ phone: cleanPhone });
      if (!result.success) {
        notifyError(result.message || 'Failed to send OTP.');
        return;
      }

      setOtpSent(true);
      setCountdown(30);
      if (result.dev_otp) {
        setDevOtpHint(result.dev_otp);
      }
      notifySuccess('OTP sent successfully to registered mobile number!');
    } catch (err) {
      notifyError(err.message || 'Error sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!otp.trim()) {
      setFieldErrors({ otp: 'Please enter the 6-digit OTP.' });
      notifyError('Enter 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const result = await studentVerifyOtpAction({ phone: cleanPhone, otp: otp.trim() });

      if (!result.success) {
        notifyError(result.message || 'Invalid or expired OTP.');
        return;
      }

      notifySuccess('Student verified successfully! Redirecting...');
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 800);
    } catch (err) {
      notifyError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (idVal, passVal) => {
    setAuthMode('credentials');
    setIdentifier(idVal);
    setPassword(passVal);
    setFieldErrors({});
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-fadeIn">
      {/* LEFT COLUMN: STUDENT LEARNING SPOTLIGHT */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-cyan-900/50 via-slate-900/90 to-slate-950 p-10 flex-col justify-between border-r border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none bg-cyan-500"></div>

        {/* Top Header / Branding */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Edu<span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-200">Manage</span>
              </span>
              <span className="block text-[10px] font-semibold text-cyan-400 tracking-wider uppercase -mt-1">
                Student Learning Hub
              </span>
            </div>
          </Link>

          <div className="space-y-2 pt-4">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-cyan-300">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Student & Parent Portal</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">
              Timetable, Attendance & Homework Matrix
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Check daily class periods, teacher notes, exam schedules, NFC gate swipes, and Smart Bus live routes.
            </p>
          </div>
        </div>

        {/* Real-time Feature Snapshot */}
        <div className="my-8 space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <BookOpen size={14} className="text-cyan-400" /> Student Profile
              </span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <CalendarDays size={14} className="text-cyan-400 shrink-0" />
              <div className="text-slate-300">
                <span className="font-bold text-white">Daily Class Timetable</span> • Period-wise Room numbers
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300">NFC Gate Attendance Real-time Telemetry</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantees */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> 256-Bit Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <User size={14} className="text-cyan-400" /> Student Gateway
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: STUDENT LOGIN FORM */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center">
              <Smartphone size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">Student Portal</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BadgeCheck size={12} /> Student Access
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Student Sign In
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter your Admission Number (e.g. <span className="text-cyan-300 font-mono">ADM-2026-001</span>) or verify with Mobile OTP.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-950/70 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode('credentials'); setFieldErrors({}); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'credentials'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={14} /> Admission Number
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setFieldErrors({}); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'otp'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={14} /> Mobile OTP
          </button>
        </div>

        {/* ================= MODE 1: ADMISSION NUMBER + PASSWORD ================= */}
        {authMode === 'credentials' && (
          <form noValidate onSubmit={handleCredentialsLogin} className="space-y-4 animate-fadeIn">
            {/* Admission Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admission Number / Roll Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                  }}
                  placeholder="ADM-2026-001 or Roll No."
                  className={`w-full bg-slate-950/70 border ${
                    fieldErrors.identifier ? 'border-rose-500' : 'border-white/10 focus:border-cyan-500'
                  } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-200`}
                />
              </div>
              {fieldErrors.identifier && (
                <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* Password / DOB */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password or DOB <span className="text-rose-500">*</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
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
                  placeholder="•••••••••••• or YYYY-MM-DD"
                  className={`w-full bg-slate-950/70 border ${
                    fieldErrors.password ? 'border-rose-500' : 'border-white/10 focus:border-cyan-500'
                  } rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-200`}
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
              className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-cyan-600 via-cyan-500 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-xl shadow-cyan-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Authenticating Student...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Student Hub</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= MODE 2: MOBILE OTP LOGIN ================= */}
        {authMode === 'otp' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Phone */}
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
                      fieldErrors.phone ? 'border-rose-500' : 'border-white/10 focus:border-cyan-500'
                    } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-200`}
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading || phone.length < 10}
                    className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shrink-0 cursor-pointer"
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

            {/* OTP Input */}
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
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-bold underline"
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
                        fieldErrors.otp ? 'border-rose-500' : 'border-white/10 focus:border-cyan-500'
                      } rounded-xl py-3 pl-11 pr-4 text-center text-lg font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-200`}
                    />
                  </div>
                  {fieldErrors.otp && (
                    <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.otp}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  {countdown > 0 ? (
                    <span>Resend OTP in <span className="text-cyan-400 font-bold">{countdown}s</span></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-cyan-600 via-cyan-500 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-xl shadow-cyan-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying Student OTP...</span>
                    </div>
                  ) : (
                    <>
                      <span>Verify & Open Student Hub</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quick Demo Fill Helper */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className="text-cyan-400" /> Quick Demo Fill
            </span>
            <span className="text-[10px] text-slate-500">1-Click Sign In</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ADM-1001', 'Welcome@123')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">Student (ADM-1001)</span>
              <span className="text-[10px] text-cyan-400 font-mono ml-1">Fill</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setPhone('9876543210');
                setOtpSent(false);
                setDevOtpHint('');
                setOtp('');
                setFieldErrors({});
                handleSendOtp('9876543210');
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <span className="truncate">Mobile OTP Demo</span>
              <span className="text-[10px] text-cyan-400 font-mono ml-1">Auto OTP</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <Link href="/" className="hover:text-white transition flex items-center gap-1.5 font-medium">
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              School Admin
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/parent/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Parent
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
