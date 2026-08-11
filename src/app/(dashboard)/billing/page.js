'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BillingPageSkeleton from '@/components/skeletons/BillingPageSkeleton';
import { 
  CreditCard, 
  Users, 
  Bus, 
  Calendar, 
  ArrowUpRight, 
  History, 
  Sparkles,
  IndianRupee,
  ShieldCheck,
  RefreshCw,
  Download,
  AlertCircle,
  Eye
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  getSubscriptionDetailsAction, 
  checkoutSubscriptionAction, 
  triggerMockPaymentAction 
} from '@/actions/billingActions';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Upgrade form state
  const [planType, setPlanType] = useState('monthly');
  const [studentsLimit, setStudentsLimit] = useState(50);
  const [busesLimit, setBusesLimit] = useState(5);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await getSubscriptionDetailsAction();
    if (res.success && res.data) {
      setData(res.data);
      const sub = res.data.subscription;
      setPlanType(sub.plan_type);
      setStudentsLimit(sub.max_students_limit);
      setBusesLimit(sub.max_buses_limit);
    } else {
      setErrorMsg(res.message || 'Failed to retrieve subscription details.');
    }
    setLoading(false);
  };

  if (loading) {
    return <BillingPageSkeleton />;
  }

  const { 
    subscription = { status: 'inactive', plan_type: 'monthly', starts_at: new Date().toISOString(), ends_at: new Date().toISOString() }, 
    usage = { students: { current: 0, limit: 0 }, buses: { current: 0, limit: 0 } }, 
    transactions = [], 
    invoices = [], 
    billingConfig 
  } = data || {};
  const config = billingConfig || {};

  // Calculator
  const isYearly = planType === 'yearly';
  const baseFee = isYearly ? (config.base_fee_yearly || 0) : (config.base_fee_monthly || 0);
  const studentFee = isYearly ? (config.student_fee_yearly || 0) : (config.student_fee_monthly || 0);
  const busFee = isYearly ? (config.bus_fee_yearly || 0) : (config.bus_fee_monthly || 0);

  const subtotal = Number(baseFee) + (Number(studentFee) * studentsLimit) + (Number(busFee) * busesLimit);
  let discountAmount = 0;
  if (isYearly) {
    discountAmount = (subtotal * Number(config.yearly_discount_percent || 0)) / 100;
  }
  const preTaxTotal = subtotal - discountAmount;
  const taxAmount = (preTaxTotal * Number(config.tax_rate_percent || 0)) / 100;
  const finalPrice = preTaxTotal + taxAmount;

  // Checkout process simulation
  const handleUpgrade = async () => {
    setProcessing(true);
    setSuccessMsg('');
    setErrorMsg('');

    const checkoutRes = await checkoutSubscriptionAction({
      plan_type: planType,
      max_students_limit: studentsLimit,
      max_buses_limit: busesLimit
    });

    if (!checkoutRes.success || !checkoutRes.data) {
      setErrorMsg(checkoutRes.message || 'Checkout failed.');
      setProcessing(false);
      return;
    }

    const { transaction } = checkoutRes.data;

    const paymentRes = await triggerMockPaymentAction({
      gateway_transaction_id: transaction.gateway_transaction_id,
      max_students_limit: studentsLimit,
      max_buses_limit: busesLimit,
      plan_type: planType
    });

    if (paymentRes.success) {
      setSuccessMsg('Payment Successful! Your subscription plan has been upgraded instantly.');
      await fetchBillingData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      setErrorMsg(paymentRes.message || 'Payment capture failed.');
    }
    setProcessing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'trialing': return 'warning';
      case 'past_due': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 🌟 Standard Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-primary-50/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="emerald" dot>Active SaaS License</Badge>
            <Badge variant="primary">Billing &amp; Resource Limits</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <CreditCard className="text-primary-600" size={24} /> Subscription &amp; Billing Portal
          </h1>
          <p className="text-slate-500 text-xs">
            Manage student seats, smart bus fleet licenses, and dynamic billing transactions.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={RefreshCw}
          disabled={processing}
          onClick={fetchBillingData}
        >
          {processing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm shadow-sm animate-fadeIn">
          <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm shadow-sm">
          <AlertCircle size={20} className="text-rose-500 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Stats and Invoices */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Limits Progress Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Limit Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Student Seats</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    {usage.students.current} <span className="text-xs font-semibold text-slate-400">/ {usage.students.limit} seats</span>
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
                  <Users size={20} />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-400 to-primary-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (usage.students.current / usage.students.limit) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-medium">
                <span>{usage.students.limit - usage.students.current} seats remaining</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">
                  {Math.round((usage.students.current / usage.students.limit) * 100)}% Used
                </span>
              </div>
            </div>

            {/* Bus Limit Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bus Route Licenses</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    {usage.buses.current} <span className="text-xs font-semibold text-slate-400">/ {usage.buses.limit} buses</span>
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                  <Bus size={20} />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sky-400 to-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (usage.buses.current / usage.buses.limit) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-medium">
                <span>{usage.buses.limit - usage.buses.current} routes remaining</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">
                  {Math.round((usage.buses.current / usage.buses.limit) * 100)}% Used
                </span>
              </div>
            </div>

          </div>

          {/* Plan Info Card */}
          <div className="bg-white rounded-2xl border-l-4 border-l-primary-500 border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-primary-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Active Plan Settings</h4>
                  <p className="text-[10px] text-slate-400">Next renewal billing details</p>
                </div>
              </div>
              <Badge variant={getStatusColor(subscription.status)} className="capitalize px-3 py-1 font-bold">
                {subscription.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-slate-600 font-medium">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Billing Interval</span>
                <span className="text-slate-800 font-extrabold capitalize">{subscription.plan_type} cycle</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Started On</span>
                <span className="text-slate-800 font-extrabold">{new Date(subscription.starts_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Expires On</span>
                <span className="text-slate-800 font-extrabold">{new Date(subscription.ends_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Auto Renew</span>
                <span className="text-primary-600 font-extrabold">Active</span>
              </div>
            </div>
          </div>

          {/* Invoice History Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-4">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                <History size={16} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Payment Invoice Statements</h4>
                <p className="text-[10px] text-slate-400">Download past transaction logs and billing statements</p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                No billing invoice statements found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4">Invoice Number</th>
                      <th className="p-4">Date Billed</th>
                      <th className="p-4">Amount Due</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-800">
                          <Link href={`/billing/invoices/${inv.id}`} className="hover:text-primary-600 transition-colors">
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="p-4 text-slate-500 font-semibold">{new Date(inv.billing_date).toLocaleDateString()}</td>
                        <td className="p-4 font-extrabold text-slate-800">₹{Number(inv.amount_paid).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] bg-primary-50 text-primary-700 border border-primary-200 font-extrabold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            Paid
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            href={`/billing/invoices/${inv.id}`} 
                            className="text-primary-600 hover:text-primary-700 font-bold inline-flex items-center gap-1 cursor-pointer transition active:scale-95"
                          >
                            <Eye size={14} /> View Invoice
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Pricing Simulator Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
            
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5 text-primary-600">
                <Sparkles size={18} className="animate-pulse" />
                <h4 className="font-extrabold text-slate-800 text-sm">Plan Simulator</h4>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Upgrade student seats or bus fleet dynamically.</p>
            </div>

            {/* Plan Selector buttons */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Billing Plan</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlanType('monthly')}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition ${
                    planType === 'monthly'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setPlanType('yearly')}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1 ${
                    planType === 'yearly'
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Yearly
                  <span className="bg-primary-100 text-primary-800 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold">
                    -{Number(config.yearly_discount_percent || 0)}%
                  </span>
                </button>
              </div>
            </div>

            {/* Students Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Student Seats</span>
                <span className="font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{studentsLimit} seats</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={studentsLimit}
                onChange={(e) => setStudentsLimit(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg cursor-pointer transition"
                style={{ accentColor: 'var(--theme-primary-500, #94a3b8)' }}
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Min: 50</span>
                <span>Max: 1000</span>
              </div>
            </div>

            {/* Buses Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Bus Fleet Seats</span>
                <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">{busesLimit} Buses</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={busesLimit}
                onChange={(e) => setBusesLimit(Number(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg cursor-pointer transition"
                style={{ accentColor: 'var(--theme-primary-500, #94a3b8)' }}
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Min: 2</span>
                <span>Max: 50</span>
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-100 space-y-4 text-xs text-slate-600 font-semibold shadow-inner">
              <div className="flex justify-between">
                <span className="text-slate-400">Base License Fee</span>
                <span className="font-bold text-slate-700">₹{Number(baseFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Students ({studentsLimit} x ₹{studentFee})</span>
                <span className="font-bold text-slate-700">₹{(studentsLimit * studentFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Buses ({busesLimit} x ₹{busFee})</span>
                <span className="font-bold text-slate-700">₹{(busesLimit * busFee).toLocaleString()}</span>
              </div>
              {isYearly && (
                <div className="flex justify-between text-emerald-600">
                  <span>Yearly Discount ({Number(config.yearly_discount_percent || 0)}%)</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Tax / GST ({Number(config.tax_rate_percent || 0)}%)</span>
                <span className="font-bold text-slate-700">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-4 text-xs font-black text-slate-800">
                <span className="text-primary-700">Total Billed Price</span>
                <span className="text-primary-700 text-sm font-black tracking-tight">
                  ₹{finalPrice.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ {planType === 'yearly' ? 'yr' : 'mo'}</span>
                </span>
              </div>
            </div>

            <button
              disabled={processing}
              onClick={handleUpgrade}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-2xl transition-all shadow-md cursor-pointer"
              style={{ boxShadow: '0 4px 14px var(--theme-primary-500, #94a3b8)33' }}
            >
              {processing ? 'Processing Securely...' : 'Upgrade & Apply Limits'}
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
