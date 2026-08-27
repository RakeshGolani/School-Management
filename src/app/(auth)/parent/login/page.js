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
import { getSchoolBrandingAction, getSystemSettingsAction } from '@/actions/school/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { applyDynamicTheme } from '@/lib/themeHelper';
import AuthCardSkeleton from '@/components/skeletons/auth/AuthCardSkeleton';

/**
 * Dedicated Parent & Guardian Login Page
 * Route: /parent/login
 * Features dual authentication: Fast Mobile OTP (Default) or Admission ID/Password
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
        const [parentSession, brandingRes, settingsRes] = await Promise.all([
          getParentSessionAction().catch(() => null),
          getSchoolBrandingAction().catch(() => null),
          getSystemSettingsAction().catch(() => null)
        ]);

        if (settingsRes?.success && settingsRes?.data) {
          setSystemSettings(settingsRes.data);
        }

        if (parentSession?.user?.id) {
          router.replace('/parent/dashboard');
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
        setFieldErrors({ phone: result.message || 'Failed to send OTP to mobile number.' });
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

      const schoolColor = result.user?.school?.primary_color || 
                          result.user?.school?.primaryColor || 
                          result.user?.children?.[0]?.school?.primary_color || 
                          result.user?.children?.[0]?.school?.primaryColor;
      if (schoolColor) {
        applyDynamicTheme(schoolColor);
      }

      setTimeout(() => {
        router.push('/parent/dashboard');
      }, 500);
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
        const errMap = result.errors ? { ...result.errors } : {};
        if (result.message) {
          const msg = result.message.toLowerCase();
          if (msg.includes('password')) {
            errMap.password = result.message;
          } else {
            errMap.identifier = result.message;
          }
        }
        setFieldErrors(errMap);
        return;
      }

      notifySuccess('Parent login successful! Redirecting...');

      const schoolColor = result.user?.school?.primary_color || 
                          result.user?.school?.primaryColor || 
                          result.user?.children?.[0]?.school?.primary_color || 
                          result.user?.children?.[0]?.school?.primaryColor;
      if (schoolColor) {
        applyDynamicTheme(schoolColor);
      }

      setTimeout(() => {
        router.push('/parent/dashboard');
      }, 500);
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

  if (brandingLoading) {
    return <AuthCardSkeleton />;
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-fadeIn">
      {/* LEFT COLUMN: PARENT GUARDIAN SPOTLIGHT & SMART BUS (Desktop - Light Theme) */}
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
                  <Users size={32} className="text-white" />
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
                  {schoolBranding?.code ? `Parent • ${schoolBranding.code}` : (systemSettings?.tagline || 'Parent & Guardian Hub')}
                </span>
              </div>
            </Link>
          )}

          <div className="space-y-2 pt-4">
            <div className="inline-flex items-center space-x-2 bg-primary-100/80 border border-primary-200/80 px-3 py-1 rounded-full text-[11px] font-bold text-primary-800">
              <Sparkles size={13} className="text-primary-600" />
              <span>Smart Bus & Ward Portal</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              Live Fleet GPS Tracking & Student Safety
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Track school bus in real-time on road-snapped maps, get instant NFC boarding alerts, fee payment receipts, and academic cards.
            </p>
          </div>
        </div>

        {/* Live Transit Stream Widget */}
        <div className="my-8 space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold flex items-center gap-1.5">
                <Radio size={14} className="text-accent-600" /> Live Smart Bus Stream
              </span>
              <span className="text-[10px] text-accent-700 font-bold bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200">
                ACTIVE GPS
              </span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <Bus size={16} className="text-secondary-600 shrink-0" />
              <div className="text-slate-700 font-medium">
                <span className="font-bold text-slate-900">Route #01 (City Express)</span> • 3 Mins away from stop
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <CheckCircle2 size={14} className="text-accent-600 shrink-0" />
              <span className="text-slate-700 font-medium">Instant SMS & Mobile OTP Verification</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantees */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accent-600" /> AES-256 Secured
          </span>
          <span className="flex items-center gap-1.5">
            <Smartphone size={14} className="text-primary-600" /> Parent Portal & App
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: PARENT LOGIN FORM (Light Theme) */}
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
                  <Users size={20} className="text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary-500 border border-white"></span>
                </div>
              )}
              <span className="text-lg font-black tracking-tight text-slate-900 truncate max-w-[200px]">
                {schoolBranding?.schoolName ? `${schoolBranding.schoolName} Parent` : `${systemSettings?.company_name || 'Vidyadmin'} Parent`}
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
            <BadgeCheck size={12} /> Parent & Guardian Gateway
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Parent Secure Sign In
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Access your child&apos;s daily attendance, bus tracking, and fees via verified mobile OTP.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setFieldErrors({}); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'otp'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone size={14} /> Mobile OTP Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setFieldErrors({}); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'password'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                : 'text-slate-600 hover:text-slate-900'
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                    className={`w-full bg-slate-50/70 border ${
                      fieldErrors.phone ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                    } rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition duration-200`}
                  />
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading || phone.length < 10}
                    className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Get OTP'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>
              {fieldErrors.phone && (
                <p className="text-xs text-rose-500 font-medium pl-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Step 2: OTP Input (Appears when OTP is sent) */}
            {otpSent && (
              <form noValidate onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Enter 6-Digit OTP <span className="text-rose-500">*</span>
                    </label>
                    {devOtpHint && (
                      <button
                        type="button"
                        onClick={() => setOtp(devOtpHint)}
                        className="text-[11px] text-primary-600 hover:text-primary-700 font-mono font-bold underline cursor-pointer"
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
                      className={`w-full bg-slate-50/70 border ${
                        fieldErrors.otp ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                      } rounded-xl py-3 pl-11 pr-4 text-center text-lg font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition duration-200`}
                    />
                  </div>
                  {fieldErrors.otp && (
                    <p className="text-xs text-rose-500 font-medium pl-1">{fieldErrors.otp}</p>
                  )}
                </div>

                {/* Resend Timer */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  {countdown > 0 ? (
                    <span>Resend OTP in <span className="text-primary-600 font-bold">{countdown}s</span></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                  className={`w-full bg-slate-50/70 border ${
                    fieldErrors.identifier ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                  } rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition duration-200`}
                />
              </div>
              {fieldErrors.identifier && (
                <p className="text-xs text-rose-500 font-medium pl-1">{fieldErrors.identifier}</p>
              )}
            </div>

            {/* Password */}
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-500 font-medium pl-1">{fieldErrors.password}</p>
              )}
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
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className="text-primary-600" /> Quick Demo Fill
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">1-Click Auto OTP</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFillDemo('9876543210')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center justify-between transition cursor-pointer shadow-xs"
            >
              <span className="truncate">Parent (9876543210)</span>
              <span className="text-[10px] text-primary-600 font-mono font-bold ml-1">Auto OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setIdentifier('parent@example.com');
                setPassword('Welcome@123');
                setFieldErrors({});
              }}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center justify-between transition cursor-pointer shadow-xs"
            >
              <span className="truncate">Parent Password</span>
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
            <Link href="/student/login" className="text-primary-600 hover:text-primary-700 font-bold">
              Student
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/teacher/login" className="text-primary-600 hover:text-primary-700 font-bold">
              Teacher
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
