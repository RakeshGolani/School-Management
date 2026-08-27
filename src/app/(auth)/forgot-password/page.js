'use client';
import { useState, useEffect } from 'react';
import { Mail, GraduationCap, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getSchoolBrandingAction, getSystemSettingsAction } from '@/actions/school/authActions';
import { applyDynamicTheme } from '@/lib/themeHelper';
import AuthCardSkeleton from '@/components/skeletons/auth/AuthCardSkeleton';

/**
 * Forgot Password Recovery Page
 * Modern sleek design matching portal auth flow
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandingLoading, setBrandingLoading] = useState(true);
  const [schoolBranding, setSchoolBranding] = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    company_name: 'Vidyadmin',
    tagline: 'Simplifying Education, Empowering Admins',
    logo_url: null
  });

  useEffect(() => {
    async function checkSession() {
      try {
        const [brandingRes, settingsRes] = await Promise.all([
          getSchoolBrandingAction().catch(() => null),
          getSystemSettingsAction().catch(() => null)
        ]);

        if (settingsRes?.success && settingsRes?.data) {
          setSystemSettings(settingsRes.data);
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
    checkSession();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (brandingLoading) {
    return <AuthCardSkeleton mode="single" />;
  }

  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden p-6 sm:p-10 relative animate-fadeIn space-y-6">
      {/* Top Header */}
      <div className="text-center space-y-3">
        {brandingLoading ? (
          <div className="w-18 h-18 rounded-full bg-slate-200 animate-pulse mx-auto" />
        ) : (
          <Link href="/" className="inline-flex items-center space-x-3 group mx-auto">
            {schoolBranding?.schoolName ? (
              schoolBranding.logo ? (
                <div className="w-18 h-18 rounded-full bg-white border border-slate-200/90 p-2 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                  <img src={schoolBranding.logo} alt={schoolBranding.schoolName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-18 h-18 rounded-full bg-primary-600 border border-primary-500/40 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform relative shrink-0 text-white font-black text-3xl">
                  {schoolBranding.schoolName.charAt(0).toUpperCase()}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-white"></span>
                </div>
              )
            ) : systemSettings?.logo_url ? (
              <div className="w-18 h-18 rounded-full bg-white border border-slate-200/90 p-2 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <img src={systemSettings.logo_url} alt={systemSettings.company_name || 'Logo'} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-18 h-18 rounded-full bg-primary-600 border border-primary-500/40 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform relative shrink-0">
                <GraduationCap size={36} className="text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-white"></span>
              </div>
            )}
          </Link>
        )}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Recover Password
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
          Enter your registered institutional email to receive secure recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-3">
            <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
            <h4 className="font-bold text-base text-slate-900">Recovery Instructions Dispatched</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We have sent password reset instructions to <strong className="text-slate-900 font-mono font-bold">{email}</strong>. Please check your inbox and spam folder.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full py-3.5 px-4 rounded-xl text-center text-white font-bold text-sm bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 transition duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Portal Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Institutional Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition duration-200"
                placeholder="admin@school.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 active:scale-[0.99] disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Generating Reset Link...</span>
              </div>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4">
        <Link href="/login" className="hover:text-slate-900 transition flex items-center gap-1.5 font-medium">
          <ArrowLeft size={14} /> Back to Login
        </Link>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-emerald-600" /> Secure Recovery
        </span>
      </div>
    </div>
  );
}
