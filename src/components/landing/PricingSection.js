'use client';
import { useState } from 'react';
import { Sparkles, Check, ArrowRight, Star, Bus, Layers, BookOpen, ShieldCheck, Zap } from 'lucide-react';

const PLAN_ICONS = {
  TRANSPORT_ONLY: Bus,
  FULL_SUITE: Sparkles,
  SCHOOL_ONLY: BookOpen,
  transport: Bus,
  full_suite: Sparkles,
  academic: BookOpen
};

const FALLBACK_PACKAGES = [
  {
    id: 'transport',
    code: 'TRANSPORT_ONLY',
    name: 'Smart Bus Fleet',
    tagline: 'GPS Telemetry & Transit Safety',
    badge: 'Transport Special',
    badgeColor: 'amber',
    monthlyPrice: 3499,
    annualPrice: 2799,
    currencySymbol: '₹',
    popular: false,
    icon: 'Bus',
    features: [
      'Live GPS Fleet Tracking (OSRM Navigation)',
      'NFC/RFID Bus Boarding & Deboarding Logs',
      'Real-time Parent ETA & Stop Push Alerts',
      'Driver, Vehicle & Fuel Maintenance Logs',
      'Speed Alerts & Safe Route Geo-Fencing',
      'Dedicated Transport Manager Dashboard'
    ]
  },
  {
    id: 'full_suite',
    code: 'FULL_SUITE',
    name: 'Full Institutional Suite',
    tagline: 'Complete School ERP + Smart Bus Fleet',
    badge: 'All-in-One Suite',
    badgeColor: 'indigo',
    monthlyPrice: 9999,
    annualPrice: 7999,
    currencySymbol: '₹',
    popular: true,
    icon: 'Sparkles',
    features: [
      'Everything in Academic ERP + Smart Bus Fleet',
      'Dynamic Multi-Campus & Multi-Role Access',
      'NFC Dual Gateway (Campus Gate & Bus Entry)',
      'Automated Fee Invoicing & Online Gateway (Stripe)',
      'Zero-Conflict Master Timetable Engine',
      'Smart PDF Student & Teacher ID Cards with Barcode',
      'Priority 24/7 SLA Support & Dedicated Training'
    ]
  },
  {
    id: 'academic',
    code: 'SCHOOL_ONLY',
    name: 'Academic Core ERP',
    tagline: 'Academics, Grading & Operations',
    badge: 'ERP Core',
    badgeColor: 'blue',
    monthlyPrice: 5999,
    annualPrice: 4799,
    currencySymbol: '₹',
    popular: false,
    icon: 'BookOpen',
    features: [
      'Class & Section Dynamic Master Management',
      'Class Teacher & Single Assignment Matrix',
      'Attendance Tracking (Period & Daily)',
      'Exams, Grading Scales & Report Cards',
      'Student Profile 360° Hub & Documents',
      'Fee Category & Installment Schedule'
    ]
  }
];

export default function PricingSection({ plans = [], onSelectPlan }) {
  const [billingPeriod, setBillingPeriod] = useState('annual'); // 'monthly' | 'annual'

  // Map dynamic plans from backend or use fallback
  const displayPlans = Array.isArray(plans) && plans.length > 0
    ? plans.map((p) => {
        const isPop = Boolean(p.is_popular);
        const monthlyNum = parseFloat(p.monthly_price) || 0;
        const annualNum = parseFloat(p.annual_price) || 0;
        const sym = p.currency_symbol || '₹';

        const featureList = Array.isArray(p.features)
          ? p.features.map(f => (typeof f === 'string' ? f : f?.feature_text)).filter(Boolean)
          : [];

        // Clean up badge text so it doesn't collide with top recommendation ribbon
        let badgeText = p.badge_text || '';
        if (!badgeText) {
          badgeText = isPop ? 'All-in-One Suite' : (p.code === 'TRANSPORT_ONLY' ? 'Transport Special' : 'ERP Core');
        } else if (isPop && badgeText.toLowerCase().includes('most popular')) {
          badgeText = badgeText.replace(/most popular\s*[•\-–]?\s*/gi, '').trim() || 'All-in-One Suite';
        }

        return {
          id: p.id || p.uuid || p.code,
          code: p.code,
          name: p.name,
          tagline: p.tagline || p.description || '',
          badge: badgeText,
          badgeColor: p.badge_color || (isPop ? 'indigo' : (p.code === 'TRANSPORT_ONLY' ? 'amber' : 'blue')),
          monthlyPrice: monthlyNum,
          annualPrice: annualNum,
          currencySymbol: sym,
          popular: isPop,
          icon: p.icon,
          features: featureList
        };
      })
    : FALLBACK_PACKAGES;

  const handleChoose = (code) => {
    if (onSelectPlan) {
      onSelectPlan(code);
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16 relative z-10 scroll-mt-24">
      {/* Header & Subtitle */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-700 uppercase tracking-wider shadow-xs">
          <Sparkles size={14} className="text-primary-600 animate-pulse" />
          <span>Modular Subscriptions</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Predictable Plans for Every Institution
        </h2>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Choose standalone transport logistics, pure academic ERP, or the full unified suite.
        </p>

        {/* Modern Pill Billing Switch (Monthly vs Yearly) */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm shadow-slate-200 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setBillingPeriod('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                billingPeriod === 'annual'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Yearly</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-emerald-400 text-emerald-950 shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              }`}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
        {displayPlans.map((pkg) => {
          const isAnnual = billingPeriod === 'annual';
          const currentPrice = isAnnual ? pkg.annualPrice : pkg.monthlyPrice;
          const formattedPrice = `${pkg.currencySymbol}${Number(currentPrice).toLocaleString('en-IN')}`;
          const monthlyEquivalent = isAnnual && pkg.annualPrice > 0 ? Math.round(pkg.annualPrice / 12) : null;
          
          const IconComp = PLAN_ICONS[pkg.code] || PLAN_ICONS[pkg.icon] || (pkg.popular ? Sparkles : Layers);

          return (
            <div 
              key={pkg.id} 
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                pkg.popular 
                  ? 'bg-gradient-to-b from-white via-white to-primary-50/30 border-2 border-primary-500 shadow-2xl shadow-primary-500/15 lg:-translate-y-3 ring-4 ring-primary-500/10' 
                  : 'bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1'
              }`}
            >
              {/* Popular Recommendation Ribbon */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-lg shadow-primary-600/30 flex items-center gap-1.5 whitespace-nowrap z-20 border border-white/20">
                  <Star size={12} className="fill-amber-300 text-amber-300" />
                  <span>Institutional Recommendation</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Header Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    pkg.popular
                      ? 'bg-primary-50 text-primary-600 border-primary-200 shadow-sm'
                      : pkg.code === 'TRANSPORT_ONLY'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-blue-50 text-blue-600 border-blue-200'
                  }`}>
                    <IconComp size={22} />
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                    pkg.popular 
                      ? 'bg-primary-50 text-primary-700 border-primary-200/90 font-black' 
                      : pkg.code === 'TRANSPORT_ONLY'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {pkg.badge}
                  </span>
                </div>

                {/* Plan Title & Tagline */}
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{pkg.name}</h3>
                  {pkg.tagline && (
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{pkg.tagline}</p>
                  )}
                </div>

                {/* Price Display */}
                <div className="pt-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ school / mo</span>
                  </div>

                  {isAnnual && monthlyEquivalent && (
                    <div className="mt-2.5">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Save 20% • {pkg.currencySymbol}{monthlyEquivalent.toLocaleString('en-IN')}/mo (Billed annually)
                      </span>
                    </div>
                  )}
                </div>

                {/* Feature Bullet Points */}
                <div className="border-t border-slate-200/80 pt-6 space-y-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Features Included:</p>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-xs text-slate-600 gap-2.5 group/item">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                          pkg.popular
                            ? 'bg-primary-50 text-primary-600 border-primary-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="leading-snug text-slate-700 group-hover/item:text-slate-900 transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {pkg.features.length === 0 && (
                      <li className="text-xs text-slate-400 italic">No feature points specified</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action CTA */}
              <div className="pt-8">
                <button 
                  type="button"
                  onClick={() => handleChoose(pkg.code)}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group ${
                    pkg.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30 hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-slate-50 hover:bg-primary-50 text-slate-800 hover:text-primary-700 border border-slate-200 hover:border-primary-300 hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  <span>Choose {pkg.name}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
