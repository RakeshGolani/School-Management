'use client';
import { useState } from 'react';
import { Mail, GraduationCap, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Forgot Password Recovery Page
 * Modern sleek design matching portal auth flow
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 sm:p-10 relative animate-fadeIn space-y-6">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex items-center space-x-3 group mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <GraduationCap size={26} className="text-white" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Recover Password
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
          Enter your registered institutional email to receive secure recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-center space-y-3">
            <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
            <h4 className="font-bold text-base text-white">Recovery Instructions Dispatched</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have sent password reset instructions to <strong className="text-white font-mono">{email}</strong>. Please check your inbox and spam folder.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full py-3.5 px-4 rounded-xl text-center text-white font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Portal Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
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
                className="w-full bg-slate-950/70 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition duration-200"
                placeholder="admin@school.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.99] disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
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
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
        <Link href="/login" className="hover:text-white transition flex items-center gap-1.5 font-medium">
          <ArrowLeft size={14} /> Back to Login
        </Link>
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck size={13} className="text-emerald-400" /> Secure Recovery
        </span>
      </div>
    </div>
  );
}
