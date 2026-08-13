'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InvoiceSkeleton from '@/components/skeletons/InvoiceSkeleton';
import { 
  Building2, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin
} from 'lucide-react';
import { getSubscriptionDetailsAction } from '@/actions/billingActions';
import { getSessionAction } from '@/actions/authActions';

export default function StandalonePrintInvoicePage() {
  const params = useParams();
  const id = params?.id;

  const [invoice, setInvoice] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // 1. Get school session
        const session = await getSessionAction();
        if (!session || !session.user || !session.user.id) {
          throw new Error('Active session not found.');
        }

        const schoolId = session.user.id;

        // 2. Fetch school profile for billed to details
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const profileResponse = await fetch(`${apiUrl}/school/profile?schoolId=${schoolId}`, { cache: 'no-store' });
        const profileData = await profileResponse.json();
        let fetchedSchool = {};
        if (profileData.success && profileData.data) {
          fetchedSchool = profileData.data;
        }

        // 3. Fetch billing/subscription details
        const billingRes = await getSubscriptionDetailsAction();
        if (billingRes.success && billingRes.data) {
          const { invoices, transactions, subscription: sub } = billingRes.data;

          const foundInvoice = invoices.find(
            (inv) => String(inv.id) === String(id) || String(inv.invoice_number) === String(id)
          );

          if (foundInvoice) {
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
            setSchool({
              school_name: fetchedSchool.schoolName || fetchedSchool.school_name || fetchedSchool.name || session.user.schoolName || 'N/A',
              code: fetchedSchool.code || 'N/A',
              address: fetchedSchool.address || '',
              email: fetchedSchool.email || '',
              phone: fetchedSchool.phone || ''
            });
          }
        }
      } catch (err) {
        console.error('Print invoice fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  useEffect(() => {
    let timer;
    if (transaction && !loading) {
      timer = setTimeout(() => {
        window.print();
      }, 500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [transaction, loading]);

  if (loading || !invoice || !transaction) {
    return <InvoiceSkeleton theme="light" showActionBar={true} />;
  }

  const invoiceNumber = invoice.invoice_number || `INV-${new Date(transaction.createdAt).getFullYear()}-${String(transaction.id).padStart(4, '0')}`;
  const issueDate = new Date(transaction.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const amountPaid = parseFloat(transaction.amount || 0);
  const taxRate = 18;
  const subtotal = (amountPaid / (1 + taxRate / 100)).toFixed(2);
  const taxAmount = (amountPaid - parseFloat(subtotal)).toFixed(2);

  return (
    <div className="bg-white min-h-screen text-zinc-900 font-sans p-8 max-w-[800px] mx-auto print:p-0 print:m-0 print:max-w-none">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body, html {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside, nav, header, button, .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen action buttons */}
      <div className="mb-6 flex justify-end items-center gap-2.5 no-print">
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 border border-zinc-250 font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition"
        >
          Close
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition"
        >
          Print Document
        </button>
      </div>

      <div id="invoice-document" className="border border-zinc-200 rounded-2xl p-8 bg-white shadow-sm print:border-none print:shadow-none print:p-0 flex flex-col justify-between min-h-[780px] print:min-h-[262mm] w-full">
        
        {/* Top Content Group */}
        <div className="space-y-6 print:space-y-5 w-full">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-zinc-200 gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center font-black text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-black text-zinc-900 tracking-tight">EduSchool SaaS Cloud</h1>
                  <p className="text-xs text-primary-600 font-bold">Enterprise School Management Suite</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-650 pt-1.5 leading-relaxed">
                Tech Park Tower 4, Educational Corridor, Cyber City <br />
                GSTIN: 27AAAAA0000A1Z5 | Support: support@eduschool.io
              </p>
            </div>

            <div className="text-right space-y-1 bg-zinc-50 p-4 rounded-xl border border-zinc-200 min-w-[200px]">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-widest mb-1">
                TAX INVOICE
              </span>
              <h2 className="text-base font-bold text-zinc-900 font-mono">{invoiceNumber}</h2>
              <div className="flex items-center justify-end space-x-1.5 text-[11px] text-zinc-650">
                <Calendar size={13} />
                <span>Date: {issueDate}</span>
              </div>
            </div>
          </div>

          {/* Customer & Payment Meta Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">BILLED TO (CUSTOMER)</h4>
              <h3 className="text-sm font-bold text-zinc-900">{school.school_name || 'N/A'}</h3>
              <p className="text-xs text-zinc-750 flex items-center gap-2">
                <Building2 size={13} className="shrink-0 text-zinc-400" />
                <span>School Code: <strong className="text-zinc-900 font-mono">{school.code}</strong></span>
              </p>
              {school.address && (
                <p className="text-xs text-zinc-755 flex items-start gap-2">
                  <MapPin size={13} className="shrink-0 text-zinc-400 mt-0.5" />
                  <span>{school.address}</span>
                </p>
              )}
              {school.email && (
                <p className="text-xs text-zinc-750 flex items-center gap-2">
                  <Mail size={13} className="shrink-0 text-zinc-400" />
                  <span>{school.email}</span>
                </p>
              )}
              {school.phone && (
                <p className="text-xs text-zinc-750 flex items-center gap-2">
                  <Phone size={13} className="shrink-0 text-zinc-400" />
                  <span>{school.phone}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">PAYMENT DETAILS</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-0.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Payment Status:</span>
                  <span className="font-bold text-emerald-700 uppercase flex items-center gap-1">
                    <CheckCircle2 size={13} /> {invoice.status || 'paid'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Payment Method:</span>
                  <span className="font-semibold text-zinc-900">{transaction.payment_method || 'Online Gateway'}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Transaction Reference:</span>
                  <span className="font-mono text-zinc-900 font-bold">{transaction.gateway_transaction_id}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-zinc-800 font-bold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3.5">Item Description</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Plan / Capacity</th>
                  <th className="py-2.5 px-3.5 text-right">Base Price</th>
                  <th className="py-2.5 px-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-zinc-900">
                      SaaS Subscription Plan ({subscription.plan_type ? subscription.plan_type.toUpperCase() : 'MONTHLY'})
                    </div>
                    <div className="text-[11px] text-zinc-650 mt-0.5">
                      Access to Student Portal, NFC Attendance, Bus Tracking & Admin Dashboard
                    </div>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 font-mono text-[11px] font-medium whitespace-nowrap">
                      {subscription.max_students_limit || 50} Students / {subscription.max_buses_limit || 5} Buses
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono">₹{subtotal}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-zinc-900">₹{subtotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Content Group */}
        <div className="space-y-6 print:space-y-5 w-full pt-6 print:pt-0">
          {/* Calculations & Terms */}
          <div className="flex justify-between items-start pt-1 gap-4">
            <div className="text-[11px] text-zinc-650 space-y-0.5 max-w-sm">
              <p className="font-bold text-zinc-800">Terms & Conditions:</p>
              <p>1. This is a computer-generated tax invoice and requires no signature.</p>
              <p>2. Subscription fees are non-refundable once activated.</p>
            </div>

            <div className="w-72 bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>GST (18%):</span>
                <span className="font-mono text-zinc-900">₹{taxAmount}</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-sm text-zinc-900">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-zinc-900 text-base font-black">₹{amountPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Paid Footer Seal */}
          <div className="pt-4 text-center border-t border-zinc-200">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
              <CheckCircle2 size={15} /> Paid in Full via {transaction.payment_method || 'Online Payment Gateway'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
