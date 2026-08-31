'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BillingPageSkeleton from '@/components/skeletons/school/BillingPageSkeleton';
import { 
  CreditCard, 
  Users, 
  Bus, 
  Calendar, 
  ArrowUpRight, 
  Sparkles,
  IndianRupee,
  ShieldCheck,
  RefreshCw,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  Check,
  Boxes,
  BookOpen
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Tooltip from '@/components/ui/Tooltip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SubscriptionRenewalModal from '@/components/modals/SubscriptionRenewalModal';
import { 
  getSubscriptionDetailsAction, 
  checkoutSubscriptionAction, 
  triggerMockPaymentAction 
} from '@/actions/school/billingActions';
import { openRazorpayCheckout } from '@/lib/razorpayHelper';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);

  // Upgrade form state
  const [planType, setPlanType] = useState('monthly');
  const [studentsLimit, setStudentsLimit] = useState(50);
  const [busesLimit, setBusesLimit] = useState(5);

  // Upgrade Confirm Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(null);

  // Invoices pagination state (default 5 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getSubscriptionDetailsAction();
      if (res.success && res.data) {
        setData(res.data);
        const sub = res.data.subscription;
        if (sub?.plan_type) setPlanType(sub.plan_type);
        if (sub?.max_students_limit) setStudentsLimit(Math.max(sub.max_students_limit, 50));
        if (sub?.max_buses_limit !== undefined) setBusesLimit(Math.max(sub.max_buses_limit, 5));
      } else {
        setErrorMsg(res.message || 'Failed to retrieve subscription details.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BillingPageSkeleton />;
  }

  const { 
    subscription = { status: 'active', plan_type: 'monthly', starts_at: new Date().toISOString(), ends_at: new Date().toISOString() }, 
    currentPackage,
    schoolInfo = {},
    usage = { students: { current: 0, limit: 50 }, buses: { current: 0, limit: 5 } }, 
    transactions = [], 
    invoices = [], 
    billingConfig = {}
  } = data || {};

  const config = billingConfig || {};
  const activePkg = currentPackage || {
    name: 'Full Institutional Suite',
    code: 'FULL_SUITE',
    monthly_price: '9999.00',
    annual_price: '7999.00'
  };

  // Pricing Calculator
  const isYearly = planType === 'yearly';
  const rawMonthlyPrice = Number(activePkg.monthly_price || config.base_fee_monthly || 9999);
  const rawAnnualPrice = Number(activePkg.annual_price || config.base_fee_yearly || 7999);

  // For Yearly, annual base is 12 months
  const baseAnnualPrice = rawAnnualPrice < 15000 ? rawAnnualPrice * 12 : rawAnnualPrice;
  const baseFee = isYearly ? baseAnnualPrice : rawMonthlyPrice;

  const monthlyStudentFee = Number(config.student_fee_monthly || 10);
  const monthlyBusFee = Number(config.bus_fee_monthly || 100);

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
  const busesCost = extraBuses * busFee;
  const subtotal = baseFee + studentsCost + busesCost;

  let discountAmount = 0;
  if (isYearly && !activePkg.annual_price) {
    discountAmount = (subtotal * Number(config.yearly_discount_percent || 15)) / 100;
  }

  const preTaxTotal = Math.max(0, subtotal - discountAmount);
  const taxRate = Number(config.tax_rate_percent || 18);
  const taxAmount = (preTaxTotal * taxRate) / 100;
  const finalPrice = Math.round(preTaxTotal + taxAmount);

  // Safe Progress calculations
  const sLimit = usage.students?.limit || 50;
  const sCurrent = usage.students?.current || 0;
  const sPct = sLimit > 0 ? Math.round((sCurrent / sLimit) * 100) : 0;

  const bLimit = usage.buses?.limit || 5;
  const bCurrent = usage.buses?.current || 0;
  const bPct = bLimit > 0 ? Math.round((bCurrent / bLimit) * 100) : 0;

  const isExpired = subscription.status === 'expired' || new Date(subscription.ends_at) < new Date();
  const subStatus = isExpired ? 'expired' : (subscription.status || 'active');

  // Invoices & Transactions Table Columns definition
  const tableDataList = transactions.length > 0 ? transactions : invoices;
  const totalRecords = tableDataList.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = tableDataList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const invoiceColumns = [
    {
      header: 'Transaction / Invoice Ref',
      accessor: 'gateway_transaction_id',
      render: (row) => {
        const invNum = row.invoice?.invoice_number || row.invoice_number;
        const payId = row.reference_number || (row.gateway_transaction_id?.startsWith('pay_') ? row.gateway_transaction_id : null) || row.gateway_transaction_id;

        return (
          <div className="space-y-0.5">
            <span className="font-mono font-bold text-slate-800 text-xs block">
              {invNum || payId || `TXN-${row.id}`}
            </span>
            {payId && invNum && (
              <span className="text-[11px] font-mono text-slate-500 font-medium block">
                {payId}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Plan',
      accessor: 'plan_type',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wide border border-slate-200">
          {row.subscription?.plan_type || row.plan_type || 'Monthly'}
        </span>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="font-extrabold text-slate-800 text-xs">
          ₹{Number(row.amount || row.amount_paid || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Payment Method',
      accessor: 'payment_method',
      render: (row) => (
        <span className="text-slate-600 text-xs font-medium">
          {row.payment_method || (row.payment_mode === 'offline' ? 'Offline Payment' : 'Online Gateway')}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const isSuccess = row.status === 'success' || row.status === 'paid';
        return (
          <Badge variant={isSuccess ? 'success' : 'slate'} size="sm">
            {String(row.status || 'PAID').toUpperCase()}
          </Badge>
        );
      }
    },
    {
      header: 'Billing Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-slate-500 text-xs font-medium">
          {new Date(row.createdAt || row.billing_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const invId = row.invoice?.id || row.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip content="Download / Print PDF Tax Invoice" position="left">
              <Link
                href={`/billing/invoices/${invId}/print`}
                target="_blank"
                className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
              >
                <Download size={15} />
              </Link>
            </Tooltip>
            <Tooltip content="View Invoice Details" position="left">
              <Link
                href={`/billing/invoices/${invId}`}
                className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
              >
                <Eye size={15} />
              </Link>
            </Tooltip>
          </div>
        );
      }
    }
  ];

  // Initiate Upgrade with Razorpay Checkout
  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await checkoutSubscriptionAction({
        plan_type: planType,
        max_students_limit: studentsLimit,
        max_buses_limit: busesLimit,
        package_code: activePkg.code
      });

      if (!res.success || !res.data) {
        setErrorMsg(res.message || 'Failed to initiate checkout session.');
        notifyError(res.message || 'Failed to initiate checkout session.');
        setProcessing(false);
        return;
      }

      // Open official Razorpay Checkout modal
      await openRazorpayCheckout({
        checkoutResponse: res.data,
        planType,
        packageCode: activePkg.code,
        studentsLimit,
        busesLimit,
        onSuccess: async () => {
          notifySuccess('Subscription upgraded / renewed successfully!');
          setSuccessMsg(`Subscription upgraded successfully! Active capacity updated to ${studentsLimit} students & ${busesLimit} buses.`);
          await fetchBillingData();
          setTimeout(() => setSuccessMsg(''), 8000);
          setProcessing(false);
        },
        onError: (errMsg) => {
          setErrorMsg(errMsg || 'Payment failed.');
          notifyError(errMsg || 'Payment failed.');
          setProcessing(false);
        },
        onDismiss: () => {
          setProcessing(false);
        }
      });
    } catch (err) {
      console.error('Error during upgrade:', err);
      setErrorMsg('Failed to process upgrade request');
      notifyError('Failed to process upgrade request');
      setProcessing(false);
    }
  };

  // Confirm and Execute Upgrade
  const handleConfirmPayment = async () => {
    if (!pendingCheckout) return;
    setProcessing(true);
    setConfirmModalOpen(false);

    try {
      const paymentRes = await triggerMockPaymentAction({
        gateway_transaction_id: pendingCheckout.transaction?.gateway_transaction_id || pendingCheckout.checkoutDetails?.order_id,
        max_students_limit: studentsLimit,
        max_buses_limit: busesLimit,
        plan_type: planType,
        package_code: activePkg.code,
        status: 'success'
      });

      if (paymentRes.success) {
        notifySuccess('Subscription capacity upgraded successfully!');
        setSuccessMsg(`Subscription upgraded successfully! Active capacity updated to ${studentsLimit} students & ${busesLimit} buses.`);
        await fetchBillingData();
        setTimeout(() => setSuccessMsg(''), 8000);
      } else {
        notifyError(paymentRes.message || 'Payment simulation failed.');
        setErrorMsg(paymentRes.message || 'Payment processing failed.');
      }
    } catch (err) {
      notifyError('Failed to execute payment');
    } finally {
      setProcessing(false);
    }
  };

  // Package details helper
  const getPackageDetails = (pkg) => {
    const code = pkg?.code || 'FULL_SUITE';
    if (code === 'TRANSPORT_ONLY' || code === 'transport') {
      return {
        label: 'Transport Only (Smart Bus Fleet)',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        icon: Bus,
        iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
        description: 'Smart Bus Live GPS Tracking, Route Management, Parent Alerts & Driver NFC Logs.',
        modulesText: 'Smart Bus Fleet & GPS Tracking Active'
      };
    }
    if (code === 'SCHOOL_ONLY' || code === 'academic') {
      return {
        label: 'School ERP Only (Academics & Operations)',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: BookOpen,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        description: 'Classrooms, Teacher Allocations, Timetable Grid, Student Hub & Fee Accounts.',
        modulesText: 'Academics & Operations ERP Active'
      };
    }
    return {
      label: 'Full Institutional Suite (ERP + Smart Bus Fleet)',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Sparkles,
      iconBg: 'bg-gradient-to-tr from-amber-500/10 to-primary-500/10 text-primary-600 border-primary-200',
      description: 'Complete all-in-one institutional ERP integrated with real-time GPS Fleet Telemetry & NFC Gateways.',
      modulesText: 'All 8 System Modules Active (All-In-One)'
    };
  };

  const pkgInfo = getPackageDetails(activePkg);
  const PkgIcon = pkgInfo.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 🌟 Standard Header Banner with Active Plan Edition Badge */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs relative overflow-hidden">
        
        {/* Left Side: Title & Status */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={subStatus === 'active' ? 'emerald' : 'danger'} dot>
              {subStatus === 'active' ? 'Active SaaS License' : 'License Inactive'}
            </Badge>
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${pkgInfo.badgeColor}`}>
              {activePkg.code || 'FULL_SUITE'}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase">
              {subscription.plan_type === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-primary-600" size={26} /> 
            Subscription &amp; Billing Portal
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl leading-relaxed">
            {pkgInfo.description}
          </p>
        </div>

        {/* Right Side: Active Plan Quick Details Widget & Refresh Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 w-full lg:w-auto">
          {/* Active Plan Detail Box */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5 w-full sm:w-auto">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${pkgInfo.iconBg}`}>
              <PkgIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">{activePkg.name}</span>
              </div>
              <p className="text-[11px] font-bold text-primary-600 mt-0.5">
                {pkgInfo.label}
              </p>
              {subscription?.ends_at && (
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Calendar size={10} />
                  Valid till {new Date(subscription.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {subStatus !== 'active' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setRenewalModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 shrink-0"
              >
                <Sparkles size={14} className="mr-1.5" />
                Renew License Now
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBillingData}
              icon={RefreshCw}
              className="shrink-0"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* 🌟 Active Plan Inclusion & Quota Information Strip */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Boxes size={15} className="text-primary-400" />
            <span>Active Package Tier:</span>
            <span className="text-emerald-400 font-extrabold">{pkgInfo.label}</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <div className="text-xs text-slate-300">
            Base Quota: <strong className="text-white">{baseStudentsQuota} Students</strong>
            {baseBusesQuota > 0 ? (
              <> + <strong className="text-white">{baseBusesQuota} Smart Buses</strong> Included</>
            ) : (
              <span className="text-slate-400 font-normal"> Included (ERP Only • No Bus Fleet)</span>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 shrink-0">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>{pkgInfo.modulesText}</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Stats and Invoices (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Limits Progress Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Limit Card */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-200 ${!activePkg.modules?.includes('transport') && activePkg.code === 'SCHOOL_ONLY' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Student Seats</p>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    {sCurrent} <span className="text-xs font-semibold text-slate-400">/ {sLimit} seats</span>
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
                  <Users size={20} />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-400 to-primary-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sPct)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-medium">
                <span>{Math.max(0, sLimit - sCurrent)} seats remaining</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">
                  {sPct}% Used
                </span>
              </div>
            </div>

            {/* Bus Limit Card (Only for Plans with Transport) */}
            {(activePkg.modules?.includes('transport') || activePkg.code !== 'SCHOOL_ONLY') && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bus Route Licenses</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">
                      {bCurrent} <span className="text-xs font-semibold text-slate-400">/ {bLimit} buses</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                    <Bus size={20} />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sky-400 to-sky-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, bPct)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-medium">
                  <span>{Math.max(0, bLimit - bCurrent)} routes remaining</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">
                    {bPct}% Used
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Invoices History Table */}
          <Card
            title="Payment &amp; Billing Invoices History"
            subtitle="Download past subscription renewal statements and tax invoices"
            icon={CreditCard}
          >
            <DataTable
              columns={invoiceColumns}
              data={paginatedData}
              emptyMessage="No invoice statements found"
              pagination={{
                currentPage,
                pageSize,
                totalRecords,
                totalPages,
                onPageChange: setCurrentPage,
                onPageSizeChange: (newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }
              }}
            />
          </Card>

        </div>

        {/* Right Side: Upgrade / Plan Simulator Form (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6 space-y-6">
            
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={18} /> Upgrade / Renew Plan
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                  {activePkg.code}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Choose billing cycle and adjust student &amp; bus capacities.
              </p>
            </div>

            <form onSubmit={handleUpgradeSubmit} className="space-y-5">
              
              {/* Billing Cycle Switch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Billing Cycle
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPlanType('monthly')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      planType === 'monthly'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType('yearly')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      planType === 'yearly'
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Yearly</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-400 text-slate-950 font-black">
                      SAVE 15%
                    </span>
                  </button>
                </div>
              </div>

              {/* Student Capacity Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Student Seats
                  </label>
                  <span className="font-mono font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100 text-xs">
                    {studentsLimit} Seats
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.max(50, sCurrent)}
                  max="2500"
                  step="10"
                  value={studentsLimit}
                  onChange={(e) => setStudentsLimit(Number(e.target.value))}
                  className="w-full accent-primary-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>Included: {baseStudentsQuota}</span>
                  <span>₹{studentFee}/extra seat (+10 step)</span>
                  <span>Max: 2,500</span>
                </div>
              </div>

              {/* Bus Capacity Selector (Only for plans with transport) */}
              {(activePkg.modules?.includes('transport') || activePkg.code !== 'SCHOOL_ONLY') && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Bus Fleet Licenses
                    </label>
                    <span className="font-mono font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 text-xs">
                      {busesLimit} Buses
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={busesLimit}
                    onChange={(e) => setBusesLimit(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                    <span>Included: {baseBusesQuota}</span>
                    <span>₹{busFee}/extra bus (+1 step)</span>
                    <span>Max: 50</span>
                  </div>
                </div>
              )}

              {/* Price Breakdown Calculation Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Plan Fee ({activePkg.name}):</span>
                  <span className="font-bold text-slate-800">₹{baseFee.toLocaleString()}</span>
                </div>

                {extraStudents > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Extra Students ({extraStudents} × ₹{studentFee}):</span>
                    <span className="font-bold text-slate-800">+₹{studentsCost.toLocaleString()}</span>
                  </div>
                )}

                {extraBuses > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Extra Buses ({extraBuses} × ₹{busFee}):</span>
                    <span className="font-bold text-slate-800">+₹{busesCost.toLocaleString()}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Annual Discount:</span>
                    <span>-₹{Math.round(discountAmount).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Tax / GST ({taxRate}%):</span>
                  <span className="font-bold text-slate-800">₹{Math.round(taxAmount).toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline">
                  <span className="font-black text-slate-900 text-sm">Total Billed:</span>
                  <div className="text-right">
                    <span className="font-black text-primary-600 text-lg font-mono">
                      ₹{Math.round(finalPrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-medium text-slate-500 ml-1">/{isYearly ? 'yr' : 'mo'}</span>
                  </div>
                </div>
              </div>

              {/* Submit Upgrade Button */}
              <Button
                type="submit"
                variant="primary"
                loading={processing}
                className="w-full justify-center py-3 text-sm font-black shadow-md shadow-primary-600/20"
                icon={ArrowUpRight}
              >
                Proceed to Upgrade / Pay
              </Button>

              <div className="space-y-1.5 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Check size={13} strokeWidth={3} /> Instant limit &amp; capacity activation
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Check size={13} strokeWidth={3} /> Official GST Tax Receipt generated
                </div>
              </div>

            </form>

          </div>

        </div>

      </div>

      {/* Upgrade Order Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmPayment}
        title="Confirm Plan Upgrade &amp; Renewal"
        message={`You are upgrading capacity to ${studentsLimit} Student Seats and ${busesLimit} Bus Licenses on "${activePkg.name}" for a total billed amount of ₹${Math.round(finalPrice).toLocaleString('en-IN')}. Would you like to activate this upgrade now?`}
        confirmText="Confirm &amp; Activate License"
        cancelText="Cancel"
        type="primary"
      />

      {/* Subscription Renewal Modal for Expired / Inactive School */}
      <SubscriptionRenewalModal
        isOpen={renewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        subscription={subscription}
        currentPackage={activePkg}
        billingConfig={config}
        onSuccess={async () => {
          await fetchBillingData();
        }}
      />

    </div>
  );
}
