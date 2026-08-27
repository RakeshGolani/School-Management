'use client';

import React from 'react';

/**
 * AuthCardSkeleton
 * Zero-FOUC, Anti-Blink Pulse Skeleton for Authentication Pages
 * (/login, /teacher/login, /student/login, /parent/login, /forgot-password)
 *
 * Prevents color blinking/flashing while school branding cookies and
 * dynamic theme custom properties are being resolved and applied.
 */
export default function AuthCardSkeleton({ mode = 'split' }) {
  if (mode === 'single') {
    return (
      <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 p-8 space-y-6 animate-pulse">
        {/* Header & Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-200" />
          <div className="h-6 w-44 bg-slate-200 rounded-lg" />
          <div className="h-4 w-60 bg-slate-100 rounded-md" />
        </div>

        {/* Input Placeholder */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-100 border border-slate-200 rounded-xl" />
          </div>

          {/* Button Placeholder */}
          <div className="h-12 w-full bg-slate-200 rounded-xl mt-4" />
        </div>

        {/* Footer Placeholder */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="h-3.5 w-24 bg-slate-100 rounded" />
          <div className="h-3.5 w-28 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative animate-pulse">
      {/* LEFT COLUMN: SPOTLIGHT PREVIEW SKELETON */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-50/80 p-10 flex-col justify-between border-r border-slate-200">
        {/* Top Header / Branding */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <div className="h-6 w-36 bg-slate-200 rounded-md" />
              <div className="h-3.5 w-24 bg-slate-200/70 rounded-md" />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="h-6 w-32 bg-slate-200 rounded-full" />
            <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-full bg-slate-100 rounded" />
            <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Middle Widget Card Skeleton */}
        <div className="my-8 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-4 w-14 bg-slate-100 rounded-full" />
          </div>
          <div className="h-10 bg-slate-50 rounded-xl border border-slate-100" />
          <div className="h-10 bg-slate-50 rounded-xl border border-slate-100" />
        </div>

        {/* Bottom Trust Guarantees */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
          <div className="h-3.5 w-28 bg-slate-200/60 rounded" />
          <div className="h-3.5 w-24 bg-slate-200/60 rounded" />
        </div>
      </div>

      {/* RIGHT COLUMN: FORM SKELETON */}
      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 bg-white">
        {/* Mobile Header Shimmer */}
        <div className="flex lg:hidden items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-4 w-16 bg-slate-100 rounded-full" />
        </div>

        {/* Form Title & Subtitle */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>

        {/* Mode Switcher Tabs Placeholder */}
        <div className="h-11 w-full bg-slate-100 rounded-xl border border-slate-200/60 p-1 flex gap-1">
          <div className="h-full flex-1 bg-white rounded-lg shadow-xs" />
          <div className="h-full flex-1 bg-transparent rounded-lg" />
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3.5 w-32 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="h-4 w-28 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>

          {/* Submit Button */}
          <div className="h-12 w-full bg-slate-200 rounded-xl mt-2" />
        </div>

        {/* Quick Demo Section */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="h-3 w-28 bg-slate-100 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-9 bg-slate-50 border border-slate-200/70 rounded-lg" />
            <div className="h-9 bg-slate-50 border border-slate-200/70 rounded-lg" />
          </div>
        </div>

        {/* Footer Security */}
        <div className="pt-2 flex items-center justify-center">
          <div className="h-3 w-40 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}
