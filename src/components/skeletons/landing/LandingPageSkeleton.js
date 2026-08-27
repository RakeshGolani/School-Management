'use client';

import React from 'react';

/**
 * LandingPageSkeleton
 * Comprehensive, Pixel-Perfect Pulse Skeleton for the Vidyadmin Landing Page.
 * Accurately mirrors every single visual section of the landing page to eliminate
 * any layout shift or color blinking during initial load.
 */
export default function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden animate-pulse">
      {/* Background Glow Mesh Effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-slate-200/40 blur-3xl opacity-60"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b08_1px,transparent_1px),linear-gradient(to_bottom,#64748b08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* ========================================================= */}
      {/* 1. STICKY HEADER & NAVBAR SKELETON */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <div className="h-6 w-28 sm:w-36 bg-slate-200 rounded-md" />
              <div className="h-3 w-40 sm:w-48 bg-slate-200/70 rounded-md hidden xs:block" />
            </div>
          </div>

          {/* Desktop Navigation Capsule Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1.5 rounded-full border border-slate-200">
            <div className="h-7 w-20 bg-white rounded-full shadow-xs" />
            <div className="h-7 w-24 bg-transparent rounded-full" />
            <div className="h-7 w-28 bg-transparent rounded-full" />
            <div className="h-7 w-20 bg-transparent rounded-full" />
            <div className="h-7 w-18 bg-transparent rounded-full" />
            <div className="h-7 w-14 bg-transparent rounded-full" />
          </div>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="h-10 w-24 bg-slate-100 border border-slate-200 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          </div>

          {/* Mobile Menu Icon Placeholder */}
          <div className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 border border-slate-200" />
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION SKELETON */}
      {/* ========================================================= */}
      <section className="relative pt-12 md:pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Release Badge Pill */}
          <div className="inline-flex items-center justify-center mx-auto h-9 w-80 bg-slate-200/80 rounded-full border border-slate-300/60" />

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-3.5 pt-2">
            <div className="h-10 sm:h-14 lg:h-16 w-11/12 mx-auto bg-slate-200 rounded-2xl" />
            <div className="h-10 sm:h-14 lg:h-16 w-3/4 mx-auto bg-slate-200 rounded-2xl" />
          </div>

          {/* Subtext Paragraph */}
          <div className="max-w-2xl mx-auto space-y-2 pt-2">
            <div className="h-4 w-full bg-slate-200/70 rounded" />
            <div className="h-4 w-4/5 mx-auto bg-slate-200/70 rounded" />
          </div>

          {/* Action CTAs Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div className="h-14 w-full sm:w-56 bg-slate-300 rounded-2xl shadow-sm" />
            <div className="h-14 w-full sm:w-52 bg-white border border-slate-200 rounded-2xl shadow-xs" />
          </div>

          {/* Trust Badges Row */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6">
            <div className="h-4 w-48 bg-slate-200/60 rounded" />
            <div className="h-4 w-44 bg-slate-200/60 rounded" />
            <div className="h-4 w-48 bg-slate-200/60 rounded" />
            <div className="h-4 w-40 bg-slate-200/60 rounded" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. INTERACTIVE SIMULATOR MOCK SKELETON */}
        {/* ========================================================= */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden p-4 sm:p-8 relative space-y-6">
            {/* Window Top Controls & Tab Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-300"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200"></span>
                </div>
                <div className="h-4 w-48 bg-slate-100 rounded hidden md:block" />
              </div>

              {/* View Selector Tabs Placeholder */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto gap-1">
                <div className="h-8 w-28 bg-slate-300 rounded-xl shadow-xs" />
                <div className="h-8 w-28 bg-white/60 rounded-xl" />
                <div className="h-8 w-32 bg-white/60 rounded-xl" />
                <div className="h-8 w-32 bg-white/60 rounded-xl" />
              </div>
            </div>

            {/* Dashboard 4-Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((stat) => (
                <div key={stat} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="w-4 h-4 rounded bg-slate-200" />
                  </div>
                  <div className="h-7 w-24 bg-slate-200 rounded-md" />
                  <div className="h-2.5 w-28 bg-slate-100 rounded" />
                </div>
              ))}
            </div>

            {/* Simulated Live Stream / Events Lower Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-10 bg-white rounded-xl border border-slate-200/80" />
                  <div className="h-10 bg-white rounded-xl border border-slate-200/80" />
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-slate-100 rounded-xl border border-slate-200" />
                  <div className="h-10 bg-slate-100 rounded-xl border border-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. METRICS STRIP SKELETON */}
      {/* ========================================================= */}
      <section className="border-y border-slate-200 bg-slate-50/70 relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[1, 2, 3, 4].map((m) => (
            <div key={m} className="space-y-2">
              <div className="h-10 sm:h-12 w-32 sm:w-40 mx-auto bg-slate-200 rounded-xl" />
              <div className="h-3.5 w-28 mx-auto bg-slate-200/70 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. 6-FEATURE CARDS PILLARS SKELETON */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex h-7 w-48 bg-slate-200 rounded-full mx-auto" />
          <div className="h-10 sm:h-12 w-4/5 mx-auto bg-slate-200 rounded-xl" />
          <div className="h-4 w-3/4 mx-auto bg-slate-200/70 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200" />
                <div className="h-6 w-48 bg-slate-200 rounded-md" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-slate-100 rounded" />
                  <div className="h-3.5 w-11/12 bg-slate-100 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-3.5 w-28 bg-slate-200/80 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. CAPACITY PLANNER & SLIDER SKELETON */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-100/60 rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="h-7 w-48 bg-slate-200 rounded-full" />
              <div className="h-10 w-4/5 bg-slate-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-slate-100 rounded" />
                <div className="h-3.5 w-4/5 bg-slate-100 rounded" />
              </div>

              {/* Slider Track Placeholder */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-8 w-36 bg-slate-200 rounded-xl" />
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-lg" />
                <div className="flex justify-between">
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
              </div>
            </div>

            {/* Calculated Output Metric Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((card) => (
                <div key={card} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 mx-auto" />
                  <div className="h-8 w-16 mx-auto bg-slate-200 rounded-md" />
                  <div className="h-3 w-24 mx-auto bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. TRANSPARENT PRICING TIERS SKELETON */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="h-7 w-44 bg-slate-200 rounded-full mx-auto" />
          <div className="h-10 sm:h-12 w-4/5 mx-auto bg-slate-200 rounded-xl" />
          <div className="h-4 w-3/4 mx-auto bg-slate-200/70 rounded" />

          {/* Billing Switch Placeholder */}
          <div className="pt-4 flex items-center justify-center space-x-4">
            <div className="h-4 w-14 bg-slate-200 rounded" />
            <div className="w-14 h-7 rounded-full bg-slate-200" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        </div>

        {/* 3 Pricing Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {[1, 2, 3].map((pkgIdx) => (
            <div 
              key={pkgIdx} 
              className={`rounded-3xl p-8 bg-white border flex flex-col justify-between space-y-6 ${
                pkgIdx === 2 ? 'border-2 border-slate-300 shadow-xl lg:-translate-y-2' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-6">
                <div>
                  <div className="h-5 w-28 bg-slate-100 rounded-full" />
                  <div className="h-7 w-48 bg-slate-200 rounded-md mt-3" />
                  <div className="h-3.5 w-36 bg-slate-100 rounded mt-2" />
                </div>

                <div className="h-12 w-36 bg-slate-200 rounded-xl" />

                <div className="border-t border-slate-100 pt-6 space-y-3">
                  <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4, 5, 6].map((f) => (
                      <div key={f} className="flex items-center space-x-2.5">
                        <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
                        <div className="h-3 w-full bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <div className="h-12 w-full bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. ROLE-BASED PORTALS GATEWAYS SKELETON */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="h-7 w-44 bg-slate-200 rounded-full mx-auto" />
          <div className="h-9 sm:h-11 w-3/4 mx-auto bg-slate-200 rounded-xl" />
          <div className="h-4 w-1/2 mx-auto bg-slate-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((portal) => (
            <div key={portal} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200" />
                <div className="h-4 w-16 bg-slate-100 rounded-full" />
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-4/5 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-9 w-full bg-slate-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. TESTIMONIALS SKELETON */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="h-8 w-64 mx-auto bg-slate-200 rounded-xl" />
          <div className="h-4 w-80 mx-auto bg-slate-100 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((t) => (
            <div key={t} className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-4 h-4 rounded bg-slate-200" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-slate-100 rounded" />
                  <div className="h-3.5 w-11/12 bg-slate-100 rounded" />
                  <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
                </div>
              </div>

              <div className="flex items-center space-x-3.5 border-t border-slate-100 pt-4">
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. FAQ ACCORDION SKELETON */}
      {/* ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <div className="h-6 w-36 bg-slate-200 rounded-full mx-auto" />
          <div className="h-9 w-72 mx-auto bg-slate-200 rounded-xl" />
          <div className="h-4 w-96 mx-auto bg-slate-100 rounded" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((faq) => (
            <div key={faq} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-xs">
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="w-5 h-5 rounded-full bg-slate-100 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. DEMO REQUEST FORM CARD SKELETON */}
      {/* ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="h-9 w-72 mx-auto bg-slate-200 rounded-xl" />
            <div className="h-4 w-96 mx-auto bg-slate-100 rounded" />
          </div>

          <div className="space-y-4 max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3.5 w-36 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-3.5 w-44 bg-slate-200 rounded" />
              <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <div className="h-3.5 w-48 bg-slate-200 rounded" />
              <div className="h-24 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>

            <div className="h-13 w-full bg-slate-300 rounded-xl mt-4" />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 12. FOOTER SKELETON */}
      {/* ========================================================= */}
      <footer className="border-t border-slate-200 bg-slate-50 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Company Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
              <div className="h-6 w-32 bg-slate-200 rounded-md" />
            </div>
            <div className="space-y-2 max-w-sm">
              <div className="h-3 w-full bg-slate-200/70 rounded" />
              <div className="h-3 w-4/5 bg-slate-200/70 rounded" />
            </div>
            <div className="h-4 w-52 bg-slate-100 rounded" />
          </div>

          {/* Platform Links Column */}
          <div className="md:col-span-3 space-y-4">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="space-y-2.5">
              <div className="h-3 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-36 bg-slate-100 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="space-y-2.5">
              <div className="h-3 w-56 bg-slate-100 rounded" />
              <div className="h-3 w-40 bg-slate-100 rounded" />
              <div className="h-3 w-44 bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="h-3.5 w-64 bg-slate-100 rounded" />
          <div className="flex space-x-6">
            <div className="h-3.5 w-20 bg-slate-100 rounded" />
            <div className="h-3.5 w-20 bg-slate-100 rounded" />
          </div>
        </div>
      </footer>
    </div>
  );
}
