'use client';
import { useState } from 'react';
import { Mail, BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * Forgot Password Recovery Page
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <BookOpen size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide">Recover Password</h2>
        <p className="text-slate-400 text-xs">Enter your registered email to receive reset instructions</p>
      </div>

      {submitted ? (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl text-center space-y-2">
            <CheckCircle size={32} className="mx-auto text-emerald-400" />
            <p className="font-semibold text-sm">Recovery Email Sent</p>
            <p className="text-slate-300">
              We have sent password reset instructions to <strong className="text-white">{email}</strong>. Please check your inbox.
            </p>
          </div>
          
          <Link
            href="/login"
            className="block w-full py-3.5 text-center rounded-xl text-white font-semibold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition duration-300 shadow-lg text-sm"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Registered Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300"
                placeholder="admin@school.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition duration-300 cursor-pointer shadow-lg shadow-primary-500/10 text-sm active:scale-95 mt-2"
          >
            Send Recovery Instructions
          </button>
        </form>
      )}

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
