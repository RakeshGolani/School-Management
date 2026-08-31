'use client';
import { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  CreditCard, 
  Clock, 
  Users, 
  Bus, 
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Building2,
  AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  checkoutSubscriptionAction, 
  triggerMockPaymentAction 
} from '@/actions/school/billingActions';
import { openRazorpayCheckout } from '@/lib/razorpayHelper';

/**
 * SubscriptionRenewalModal
 * Clean, modern renewal modal styled with the School's primary dynamic theme color.
 * Non-closable when subscription is expired (mandatory renewal).
 */
export default function SubscriptionRenewalModal({
  isOpen,
  onClose,
  isMandatory = true, // By default non-closable on expired state
  subscription,
  currentPackage,
  billingConfig = {},
  onSuccess
}) {
  const [planType, setPlanType] = useState('monthly');
  const [studentsLimit, setStudentsLimit] = useState(50);
  const [busesLimit, setBusesLimit] = useState(5);
  const [processing, setProcessing] = useState(false);

  const config = billingConfig || {};
  const activePkg = currentPackage || {
    name: 'Full Institutional Suite',
    code: 'FULL_SUITE',
    monthly_price: '2000.00',
    annual_price: '20000.00',
    base_students_limit: 50,
    base_buses_limit: 5
  };

  // Sync initial limits from current subscription
  useEffect(() => {
    if (subscription) {
      if (subscription.plan_type) setPlanType(subscription.plan_type);
      if (subscription.max_students_limit && Number(subscription.max_students_limit) > 0) {
        setStudentsLimit(Number(subscription.max_students_limit));
      }
      if (subscription.max_buses_limit && Number(subscription.max_buses_limit) > 0) {
        setBusesLimit(Number(subscription.max_buses_limit));
      }
    }
  }, [subscription, isOpen]);

  if (!isOpen) return null;

  const isTransportOnly = activePkg.code === 'TRANSPORT_ONLY';
  const isSchoolOnly = activePkg.code === 'SCHOOL_ONLY';

  // Reliable pricing calculations with robust fallbacks
  const isYearly = planType === 'yearly';

  const rawMonthlyPrice = Number(activePkg.monthly_price || config.base_fee_monthly || 0);
  const rawAnnualPrice = Number(activePkg.annual_price || config.base_fee_yearly || 0);

  const baseMonthlyPrice = rawMonthlyPrice > 0 ? rawMonthlyPrice : 9999;
  const annualMonthlyRate = rawAnnualPrice > 0 ? rawAnnualPrice : 7999;

  // For Yearly (365 days), annual base fee is 12 months of annual rate (e.g. ₹7,999 × 12 = ₹95,988)
  const baseAnnualPrice = (annualMonthlyRate < 15000) ? (annualMonthlyRate * 12) : annualMonthlyRate;
  const baseFee = isYearly ? baseAnnualPrice : baseMonthlyPrice;

  const monthlyStudentFee = Number(config.student_fee_monthly) > 0 ? Number(config.student_fee_monthly) : 10;
  const monthlyBusFee = Number(config.bus_fee_monthly) > 0 ? Number(config.bus_fee_monthly) : 100;

  // Extra student and bus fee (₹10/mo × 12 = ₹120/yr per student, ₹100/mo × 12 = ₹1,200/yr per bus)
  const studentFee = isYearly 
    ? (Number(config.student_fee_yearly) > 0 ? Number(config.student_fee_yearly) : monthlyStudentFee * 12)
    : monthlyStudentFee;

  const busFee = isYearly 
    ? (Number(config.bus_fee_yearly) > 0 ? Number(config.bus_fee_yearly) : monthlyBusFee * 12)
    : monthlyBusFee;

  const baseStudentsQuota = activePkg.base_students_limit !== undefined ? Number(activePkg.base_students_limit) : 50;
  const baseBusesQuota = activePkg.base_buses_limit !== undefined ? Number(activePkg.base_buses_limit) : 5;

  const extraStudents = Math.max(0, studentsLimit - baseStudentsQuota);
  const extraBuses = Math.max(0, busesLimit - baseBusesQuota);

  const studentsCost = extraStudents * studentFee;
  const busesCost = isSchoolOnly ? 0 : extraBuses * busFee;
  const subtotal = baseFee + studentsCost + busesCost;

  // 1. Regular 12-month cost if paid monthly
  const standardMonthlySubtotal = baseMonthlyPrice + (extraStudents * monthlyStudentFee) + (isSchoolOnly ? 0 : extraBuses * monthlyBusFee);
  const regular12MonthCostPreTax = standardMonthlySubtotal * 12;

  // 2. Annual 12-month cost if paid yearly
  const yearlyTotalPreTax = baseAnnualPrice + (extraStudents * studentFee) + (isSchoolOnly ? 0 : extraBuses * busFee);

  let discountAmount = 0;
  if (isYearly && !activePkg.annual_price) {
    discountAmount = (subtotal * Number(config.yearly_discount_percent || 15)) / 100;
  }

  const preTaxTotal = Math.max(0, subtotal - discountAmount);
  const taxRate = Number(config.tax_rate_percent !== undefined ? config.tax_rate_percent : 18);
  const taxAmount = (preTaxTotal * taxRate) / 100;
  const finalPrice = Math.round(preTaxTotal + taxAmount);

  // 3. Exact annual savings amount and percentage (Consistent regardless of active toggle!)
  const yearlySavingsPreTax = Math.max(0, regular12MonthCostPreTax - yearlyTotalPreTax);
  const yearlySavingsTotalWithGst = Math.round(yearlySavingsPreTax * (1 + taxRate / 100));
  const yearlySavingsPercent = regular12MonthCostPreTax > 0 
    ? Math.round((yearlySavingsPreTax / regular12MonthCostPreTax) * 100) 
    : 20;

  // Format expiry date
  const expiryDate = subscription?.ends_at 
    ? new Date(subscription.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  // Load Razorpay Checkout SDK script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleInstantRenew = async () => {
    setProcessing(true);
    try {
      // 1. Checkout session to generate Razorpay order ID
      const res = await checkoutSubscriptionAction({
        plan_type: planType,
        max_students_limit: studentsLimit,
        max_buses_limit: isSchoolOnly ? 0 : busesLimit,
        package_code: activePkg.code
      });

      if (!res.success || !res.data) {
        notifyError(res.message || 'Failed to initiate checkout session');
        setProcessing(false);
        return;
      }

      // 2. Open official Razorpay Checkout modal
      await openRazorpayCheckout({
        checkoutResponse: res.data,
        planType,
        packageCode: activePkg.code,
        studentsLimit,
        busesLimit: isSchoolOnly ? 0 : busesLimit,
        onSuccess: async () => {
          notifySuccess(`Subscription renewed successfully! Plan is active for next ${isYearly ? '365 days' : '30 days'}.`);
          if (onSuccess) await onSuccess();
          if (!isMandatory && onClose) onClose();
          setProcessing(false);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        onError: (errMsg) => {
          notifyError(errMsg || 'Payment failed');
          setProcessing(false);
        },
        onDismiss: () => {
          setProcessing(false);
        }
      });
    } catch (err) {
      console.error('Error during renewal:', err);
      notifyError('Failed to complete renewal payment');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scaleIn">
        
        {/* Clean, Soft Light Theme Header with School Primary Branding */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-primary-50/40 px-6 py-5 flex items-start justify-between border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-200/70 flex items-center justify-center text-primary-600 shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-slate-900">Renew School Subscription</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                  License Inactive
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Your previous term expired on <span className="font-bold text-slate-800 underline">{expiryDate}</span>. Select your renewal preferences below.
              </p>
            </div>
          </div>

          {/* Close button ONLY if not mandatory */}
          {!isMandatory && onClose && (
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Active Package Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary-50/50 border border-primary-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-primary-700 font-bold uppercase tracking-wider">Active Package Tier</p>
                <p className="text-sm font-black text-slate-900">{activePkg.name}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-black bg-white text-primary-700 border border-primary-200 shadow-2xs">
              {activePkg.code || 'FULL_SUITE'}
            </span>
          </div>

          {/* Billing Cycle Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Choose Billing Cycle
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlanType('monthly')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  planType === 'monthly'
                    ? 'border-primary-600 bg-primary-50/60 text-primary-950 shadow-xs ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <span className="text-sm font-black">Monthly Renewal</span>
                <span className="text-xs text-slate-500 mt-0.5">Billed every 30 days</span>
              </button>

              <button
                type="button"
                onClick={() => setPlanType('yearly')}
                className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  planType === 'yearly'
                    ? 'border-primary-600 bg-primary-50/60 text-primary-950 shadow-xs ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                  Save ₹{yearlySavingsPreTax.toLocaleString('en-IN')}/yr ({yearlySavingsPercent}% OFF)
                </span>
                <span className="text-sm font-black">Yearly Renewal</span>
                <span className="text-xs text-slate-500 mt-0.5">365 days access</span>
              </button>
            </div>
          </div>

          {/* Capacity Range Controls */}
          <div className="space-y-4 pt-1">
            {/* Student Capacity */}
            <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Student Capacity Limit</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md font-mono font-black text-sm bg-white border border-primary-200 text-primary-700 shadow-2xs">
                  {studentsLimit} Seats
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="10"
                value={studentsLimit}
                onChange={(e) => setStudentsLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Base: {baseStudentsQuota} seats included</span>
                <span>₹{studentFee}/extra seat</span>
                <span>Max 2,500</span>
              </div>
            </div>

            {/* Bus Fleet Licenses (if not School-Only) */}
            {!isSchoolOnly && (
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Bus className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Smart Bus Fleet Licenses</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md font-mono font-black text-sm bg-white border border-primary-200 text-primary-700 shadow-2xs">
                    {busesLimit} Buses
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={busesLimit}
                  onChange={(e) => setBusesLimit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Base: {baseBusesQuota} buses included</span>
                  <span>₹{busFee}/extra bus</span>
                  <span>Max 50</span>
                </div>
              </div>
            )}
          </div>

          {/* Clean Soft Light Theme Pricing Calculation Summary Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-2xs">
            
            {/* Annual Savings Green Banner */}
            {isYearly && yearlySavingsPreTax > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-950">
                      Annual Plan Savings ({yearlySavingsPercent}% OFF)
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      You save <strong className="text-emerald-950 font-bold font-mono">₹{yearlySavingsTotalWithGst.toLocaleString('en-IN')}</strong> total per year over monthly payments!
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 text-white shadow-xs font-mono shrink-0">
                  -₹{yearlySavingsPreTax.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {isYearly && yearlySavingsPreTax > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Standard 12-Month Price (₹{standardMonthlySubtotal.toLocaleString('en-IN')}/mo × 12):</span>
                <del className="font-mono text-slate-400 font-medium">₹{regular12MonthCostPreTax.toLocaleString('en-IN')}</del>
              </div>
            )}

            <div className="flex justify-between text-xs text-slate-600">
              <span>Base {isYearly ? `Annual Plan (₹${annualMonthlyRate.toLocaleString('en-IN')}/mo × 12 mos)` : 'Monthly Plan'} ({activePkg.name}):</span>
              <span className="font-mono font-bold text-slate-800">₹{baseFee.toLocaleString('en-IN')}</span>
            </div>

            {isYearly && yearlySavingsPreTax > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 font-medium">
                <span>Annual Commitment Discount Savings:</span>
                <span className="font-mono font-bold text-emerald-600">-₹{yearlySavingsPreTax.toLocaleString('en-IN')}</span>
              </div>
            )}

            {extraStudents > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Extra Students ({extraStudents} × ₹{studentFee}):</span>
                <span className="font-mono font-bold text-primary-600">+₹{studentsCost.toLocaleString('en-IN')}</span>
              </div>
            )}
            {!isSchoolOnly && extraBuses > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Extra Bus Licenses ({extraBuses} × ₹{busFee}):</span>
                <span className="font-mono font-bold text-primary-600">+₹{busesCost.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-slate-500">
              <span>GST ({taxRate}%):</span>
              <span className="font-mono font-medium text-slate-700">₹{Math.round(taxAmount).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Total Amount to Pay:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-primary-600 font-mono">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 block font-sans font-medium">
                  /{isYearly ? 'yr' : 'mo'} (All Inclusive)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted 256-Bit Payment Gateway</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Only show 'Later' if NOT mandatory */}
            {!isMandatory && onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={processing}
              >
                Later
              </Button>
            )}
            <Button
              variant="primary"
              icon={Zap}
              onClick={handleInstantRenew}
              loading={processing}
              className="font-bold shadow-md shadow-primary-600/25 px-6 whitespace-nowrap cursor-pointer"
            >
              Pay &amp; Instant Activate License
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
