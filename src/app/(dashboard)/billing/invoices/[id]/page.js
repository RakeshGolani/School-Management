'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Printer, 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import InvoiceSkeleton from '@/components/skeletons/school/InvoiceSkeleton';
import { getSubscriptionDetailsAction } from '@/actions/school/billingActions';
import { getSessionAction } from '@/actions/school/authActions';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [invoice, setInvoice] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);
  const [school, setSchool] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get school session
      const session = await getSessionAction();
      if (!session || !session.user || !session.user.id) {
        throw new Error('Active session not found.');
      }
      
      const schoolId = session.user.id;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
      const profileResponse = await fetch(`${apiUrl}/profile?schoolId=${schoolId}`, { cache: 'no-store' });
      const profileData = await profileResponse.json();
      let fetchedSchool = {};
      if (profileData.success && profileData.data) {
        fetchedSchool = profileData.data;
      }

      // 3. Fetch billing/subscription details
      const billingRes = await getSubscriptionDetailsAction();
      if (billingRes.success && billingRes.data) {
        const { invoices, transactions, subscription: sub, systemSettings: sysSettings } = billingRes.data;
        
        // Find matching invoice
        const foundInvoice = invoices.find(
          (inv) => String(inv.uuid) === String(id) || String(inv.id) === String(id) || String(inv.invoice_number) === String(id)
        ) || invoices.find(
          (inv) => {
            const txn = transactions.find(t => String(t.uuid) === String(id) || String(t.id) === String(id));
            return txn && txn.id === inv.transaction_id;
          }
        );

        if (foundInvoice) {
          // Find matching transaction
          const foundTxn = transactions.find(
            (t) => t.id === foundInvoice.transaction_id
          );

          setInvoice(foundInvoice);
          setTransaction(foundTxn || {
            gateway_transaction_id: 'TXN-UNKNOWN',
            payment_method: 'Online Gateway',
            amount: foundInvoice.amount_paid,
            status: 'success',
            createdAt: foundInvoice.billing_date
          });
          setSubscription(sub || {});
          setSystemSettings(sysSettings || {});
          setSchool({
            school_name: fetchedSchool.schoolName || fetchedSchool.school_name || fetchedSchool.name || session.user.schoolName || 'N/A',
            code: fetchedSchool.code || 'N/A',
            address: fetchedSchool.address || '',
            email: fetchedSchool.email || '',
            phone: fetchedSchool.phone || ''
          });
        } else {
          setError('Invoice record not found.');
        }
      } else {
        setError(billingRes.message || 'Failed to load invoice details.');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Server connection error while fetching invoice details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const handlePrint = () => {
    window.open(`/billing/invoices/${id}/print`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <InvoiceSkeleton theme="light" showActionBar={true} />;
  }

  if (error || !invoice || !transaction) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle size={48} className="text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Invoice Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested invoice could not be located in our records.'}</p>
        <Link
          href="/billing"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Billing</span>
        </Link>
      </div>
    );
  }

  const invoiceNumber = invoice.invoice_number || `INV-${new Date(transaction.createdAt).getFullYear()}-${String(transaction.id).padStart(4, '0')}`;
  const issueDate = new Date(transaction.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const amountPaid = parseFloat(transaction.amount || 0);
  const taxRate = 18; // 18% GST
  const subtotal = (amountPaid / (1 + taxRate / 100)).toFixed(2);
  const taxAmount = (amountPaid - parseFloat(subtotal)).toFixed(2);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none print:space-y-0 text-xs sm:text-sm animate-fadeIn">
      
      {/* Top Action Bar (Screen Only - Hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center space-x-3">
          <Link
            href="/billing"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>Invoice {invoiceNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250 uppercase tracking-wider">
                {invoice.status || 'paid'}
              </span>
            </h1>
            <p className="text-xs text-slate-500">View and print official tax invoice</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition border border-slate-200 cursor-pointer"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            <span>{copied ? 'Copied Link' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs transition shadow-md cursor-pointer active:scale-95"
            style={{ boxShadow: '0 4px 12px var(--theme-primary-500, #94a3b8)33' }}
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main A4 Styled Sheet Container */}
      <div className="mx-auto w-full max-w-[794px] bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none print:text-slate-900">
        
        {/* Printable Document Body */}
        <div id="invoice-document" className="p-6 sm:p-8 bg-white text-slate-800 flex-1 flex flex-col justify-between print:min-h-[262mm] w-full">
          
          {/* Top Content Group */}
          <div className="space-y-8 print:space-y-5 w-full flex flex-col justify-start pb-8 print:pb-0">
            {/* Company Brand & Invoice Meta Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-200 gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 overflow-hidden">
                    {systemSettings?.logo_url ? (
                      <img src={systemSettings.logo_url.startsWith('http') ? systemSettings.logo_url : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}${systemSettings.logo_url}`} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ShieldCheck size={24} />
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg font-extrabold tracking-tight text-slate-900">{systemSettings?.company_name || 'EduManage Cloud Solutions'}</h1>
                    <p className="text-xs text-primary-600 font-bold">{systemSettings?.tagline || 'Next-Generation School ERP'}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  {systemSettings?.address || 'Tech Park Tower 4, Educational Corridor, Cyber City'} <br />
                  GSTIN: {systemSettings?.gstin || '27AAAAA0000A1Z5'} | Support: {systemSettings?.support_email || 'support@eduschool.io'}
                </p>
              </div>

              <div className="text-left md:text-right space-y-0.5 bg-slate-50 p-3 rounded-xl border border-slate-200 w-full md:w-auto">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-250 uppercase tracking-widest mb-0.5">
                  TAX INVOICE
                </span>
                <h2 className="text-base font-bold text-slate-900 font-mono">{invoiceNumber}</h2>
                <div className="flex items-center md:justify-end space-x-1.5 text-[11px] text-slate-500">
                  <Calendar size={13} />
                  <span>Date: {issueDate}</span>
                </div>
              </div>
            </div>

            {/* Billed To / Payment Meta Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Billed To Customer */}
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">BILLED TO (CUSTOMER)</h4>
                <h3 className="text-sm font-bold text-slate-900">{school.school_name || 'N/A'}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Building2 size={13} className="shrink-0 text-slate-400" />
                  <span>School Code: <strong className="text-slate-800 font-mono">{school.code}</strong></span>
                </p>
                {school.address && (
                  <p className="text-xs text-slate-600 flex items-start gap-2">
                    <MapPin size={13} className="shrink-0 text-slate-400 mt-0.5" />
                    <span>{school.address}</span>
                  </p>
                )}
                {school.email && (
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Mail size={13} className="shrink-0 text-slate-400" />
                    <span>{school.email}</span>
                  </p>
                )}
                {school.phone && (
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-slate-400" />
                    <span>{school.phone}</span>
                  </p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">PAYMENT DETAILS</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-0.5 border-b border-slate-250/60">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-semibold text-emerald-600 uppercase flex items-center gap-1">
                      <CheckCircle2 size={13} /> {invoice.status || 'paid'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-250/60">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-semibold text-slate-800">{transaction.payment_method || 'Online Gateway'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-250/60">
                    <span className="text-slate-500">Transaction Reference:</span>
                    <span className="font-mono text-slate-800 font-semibold">{transaction.gateway_transaction_id}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Line Items Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5">Item Description</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap">Plan / Capacity</th>
                    <th className="py-2.5 px-3.5 text-right">Base Price</th>
                    <th className="py-2.5 px-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">
                        SaaS Subscription Plan ({subscription.plan_type ? subscription.plan_type.toUpperCase() : 'MONTHLY'})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Access to Student Portal, NFC Attendance{subscription.max_buses_limit > 0 ? ', Bus Tracking' : ''} & Admin Dashboard
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-50 print-pill text-slate-700 font-mono text-[11px] whitespace-nowrap border border-slate-200">
                        {subscription.max_students_limit ?? 50} Students
                        {subscription.max_buses_limit > 0 ? ` / ${subscription.max_buses_limit} Buses` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">₹{subtotal}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">₹{subtotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Content Group */}
          <div className="space-y-8 print:space-y-5 w-full pt-8 print:pt-0">
            {/* Calculations & Terms */}
            <div className="flex flex-col md:flex-row justify-between items-start pt-1 gap-4">
              <div className="text-[11px] text-slate-500 space-y-0.5 max-w-sm">
                <p className="font-bold text-slate-700">Terms & Conditions:</p>
                <p>1. This is a computer-generated tax invoice and requires no signature.</p>
                <p>2. Subscription fees are non-refundable once activated.</p>
              </div>

              <div className="w-full md:w-72 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%):</span>
                  <span className="font-mono text-slate-800">₹{taxAmount}</span>
                </div>
                <div className="pt-2 border-t border-slate-250 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-primary-600 text-sm font-extrabold">₹{amountPaid.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Paid Footer Seal */}
            <div className="pt-3 text-center border-t border-slate-200">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                <CheckCircle2 size={15} /> Paid in Full via {transaction.payment_method || 'Online Payment Gateway'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
