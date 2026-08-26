'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Printer, 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Landmark, 
  Mail, 
  Phone, 
  MapPin, 
  Copy,
  Check,
  Receipt,
  User,
  GraduationCap
} from 'lucide-react';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { getParentFeesAction } from '@/actions/parent/feeActions';
import InvoiceSkeleton from '@/components/skeletons/school/InvoiceSkeleton';
import { notifySuccess } from '@/lib/notify';

export default function ParentInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { activeChild } = useParentChild();

  const [invoice, setInvoice] = useState(null);
  const [school, setSchool] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getParentFeesAction({
        studentId: activeChild?.id
      });

      if (res?.success && res.data) {
        const { invoices, school: sch, student_info: stu } = res.data;
        const found = invoices.find(
          (inv) => String(inv.id) === String(id) || String(inv.invoice_number) === String(id)
        );

        if (found) {
          setInvoice(found);
          setSchool(sch || {});
          setStudent(stu || activeChild || {});
        } else {
          setError('Fee receipt record not found.');
        }
      } else {
        setError(res?.message || 'Failed to load fee receipt details.');
      }
    } catch (err) {
      console.error('Error fetching parent fee invoice:', err);
      setError('Server connection error while fetching fee receipt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id, activeChild?.id]);

  const handlePrint = () => {
    window.open(`/parent/fees/invoices/${id}/print`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    notifySuccess('Receipt link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <InvoiceSkeleton theme="light" showActionBar={true} />;
  }

  if (error || !invoice) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle size={48} className="text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Receipt Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested fee receipt could not be located in institutional records.'}</p>
        <Link
          href="/parent/fees"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Fee Accounts</span>
        </Link>
      </div>
    );
  }

  const receiptNumber = invoice.latest_payment?.receipt_number || invoice.invoice_number || `REC-${id}`;
  const issueDate = invoice.latest_payment?.payment_date 
    ? new Date(invoice.latest_payment.payment_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : (invoice.due_date 
        ? new Date(invoice.due_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
      );

  const amountPaid = parseFloat(invoice.paid_amount || invoice.latest_payment?.amount || invoice.amount || 0);
  const allocatedAmount = parseFloat(invoice.amount || 0);
  const previousPaid = Math.max(0, parseFloat(invoice.paid_amount || 0) - amountPaid);
  const discountAmount = parseFloat(invoice.discount_amount || 0);
  const remainingBalance = parseFloat(invoice.remaining_amount || 0);

  const schoolName = school?.name || school?.school_name || 'Greenwood International School';
  const studentName = student?.name || 
    (student?.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Rahul Gupta');
  const studentClass = student?.class || student?.grade || 'Grade 10-A';
  const admissionNumber = student?.admission_number || 'ADM-1001';

  const isPaid = invoice.status === 'PAID' || remainingBalance === 0;
  const hasPaidAmount = parseFloat(invoice.paid_amount || 0) > 0 || isPaid;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto print:p-0 print:m-0 print:max-w-none print:space-y-0 text-xs sm:text-sm animate-fadeIn">
      
      {/* Top Action Bar (Screen Only - Hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center space-x-3">
          <Link
            href="/parent/fees"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>{isPaid ? `Receipt ${receiptNumber}` : `Invoice ${invoice.invoice_number || receiptNumber}`}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPaid 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                  : (invoice.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 border border-amber-250' : 'bg-rose-50 text-rose-700 border border-rose-250')
              }`}>
                {isPaid ? 'SETTLE / SUCCESS' : invoice.status}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {isPaid ? 'Official institutional fee payment receipt' : 'Institutional fee allocation & invoice record'}
            </p>
          </div>
        </div>

        {hasPaidAmount && (
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition shadow-md cursor-pointer active:scale-95"
              style={{ boxShadow: '0 4px 12px var(--theme-primary-500, #4f46e5)33' }}
            >
              <Printer size={16} />
              <span>Print Document</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Sheet Container */}
      <div className="mx-auto w-full max-w-[800px] bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden p-8 flex flex-col justify-between min-h-[780px]">
        
        {/* Top Content Group */}
        <div className="space-y-6 w-full">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-zinc-200 gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center font-black text-white shrink-0 overflow-hidden">
                  {school?.logo_url || school?.logo ? (
                    <img src={school.logo_url || school.logo} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <Landmark size={24} />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-black text-zinc-900 tracking-tight">{schoolName}</h1>
                  <p className="text-xs text-primary-600 font-bold">Institution Fee Receipt</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-650 pt-1.5 leading-relaxed">
                {school?.address || 'Greenwood Campus, Main Highway Road, Andheri West, Mumbai'} <br />
                School Code: {school?.code || 'SCH-1001'} | Support: {school?.email || 'school@gmail.com'}
              </p>
            </div>

            <div className="text-right space-y-1 bg-zinc-50 p-4 rounded-xl border border-zinc-200 min-w-[200px]">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1 ${
                isPaid 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : (invoice.status === 'PARTIALLY_PAID' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-rose-100 text-rose-800 border border-rose-300')
              }`}>
                {isPaid ? 'FEE RECEIPT' : 'FEE INVOICE'}
              </span>
              <h2 className="text-base font-bold text-zinc-900 font-mono">
                {isPaid ? (invoice.latest_payment?.receipt_number || receiptNumber) : (invoice.invoice_number || `INV-${invoice.id}`)}
              </h2>
              <div className="flex items-center justify-end space-x-1.5 text-[11px] text-zinc-650">
                <Calendar size={13} />
                <span>{isPaid ? 'Payment Date' : 'Due Date'}: {issueDate}</span>
              </div>
            </div>
          </div>

          {/* Student & Payment Meta Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">STUDENT DETAILS</h4>
              <h3 className="text-sm font-bold text-zinc-900">{studentName}</h3>
              <p className="text-xs text-zinc-750 flex items-center gap-2">
                <GraduationCap size={13} className="shrink-0 text-zinc-400" />
                <span>Class / Grade: <strong className="text-zinc-900">{studentClass}</strong></span>
              </p>
              <p className="text-xs text-zinc-755 flex items-center gap-2">
                <User size={13} className="shrink-0 text-zinc-400" />
                <span>Admission No: <strong className="text-zinc-900 font-mono">{admissionNumber}</strong></span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                {hasPaidAmount ? 'TRANSACTION INFO' : 'SETTLEMENT STATUS'}
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-0.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Payment Status:</span>
                  <span className={`font-bold uppercase flex items-center gap-1 ${
                    isPaid 
                      ? 'text-emerald-700' 
                      : (invoice.status === 'PARTIALLY_PAID' ? 'text-amber-700' : 'text-rose-700')
                  }`}>
                    {isPaid ? (
                      <>
                        <CheckCircle2 size={13} /> SETTLE / SUCCESS
                      </>
                    ) : (
                      <>
                        <AlertCircle size={13} /> {invoice.status || 'UNPAID'}
                      </>
                    )}
                  </span>
                </div>
                {hasPaidAmount ? (
                  <>
                    <div className="flex justify-between py-0.5 border-b border-zinc-200">
                      <span className="text-zinc-600">Payment Channel:</span>
                      <span className="font-semibold text-zinc-900 capitalize">
                        {invoice.latest_payment?.payment_mode || 'Online'}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-200">
                      <span className="text-zinc-600">Transaction Reference:</span>
                      <span className="font-mono text-zinc-900 font-bold">
                        {invoice.latest_payment?.reference_number || '-'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-0.5 border-b border-zinc-200">
                      <span className="text-zinc-600">Payment Channel:</span>
                      <span className="font-semibold text-slate-400 italic">Pending Settlement</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-200">
                      <span className="text-zinc-600">Transaction Reference:</span>
                      <span className="font-mono text-slate-400 italic">Not Generated</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-zinc-800 font-bold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3.5">Fee Item Description</th>
                  <th className="py-2.5 px-3.5 text-right">Allocated Amount</th>
                  <th className="py-2.5 px-3.5 text-right">Paid Amount</th>
                  <th className="py-2.5 px-3.5 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-zinc-900">{invoice.term || invoice.category_name || 'Monthly Tuition Fee'}</div>
                    {invoice.latest_payment?.remarks ? (
                      <div className="text-[10px] text-zinc-500 mt-1 font-medium">Remarks: {invoice.latest_payment.remarks}</div>
                    ) : (
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {invoice.description || 'Institutional Tuition, Smart Bus & Campus Facility Assessment'}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-zinc-900">₹{allocatedAmount.toFixed(2)}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">₹{amountPaid.toFixed(2)}</td>
                  <td className={`py-3 px-3.5 text-right font-mono font-bold ${remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    ₹{remainingBalance.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Content Group */}
        <div className="space-y-6 w-full pt-6">
          {/* Calculations & Signatures */}
          <div className="flex justify-between items-start pt-1 gap-4">
            <div className="text-[11px] text-zinc-650 space-y-0.5 max-w-sm">
              <p className="font-bold text-zinc-800">Terms & Acknowledgments:</p>
              <p>1. This document is computer-generated from official institutional ERP records.</p>
              <p>2. Fees once paid are subject to institutional refund policies.</p>
              <p>3. Please preserve this record for final academic year clearance.</p>
            </div>

            <div className="w-80 space-y-4">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Gross Allocation:</span>
                  <span className="font-mono text-zinc-900 font-bold">₹{allocatedAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Applied Discounts:</span>
                    <span className="font-mono text-emerald-600">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Total Paid Amount:</span>
                  <span className="font-mono text-emerald-700 font-bold">₹{amountPaid.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between font-bold text-sm text-zinc-900">
                  <span>Net Balance Due:</span>
                  <span className={`font-mono text-base font-black ${remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    ₹{remainingBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Signature Line */}
              <div className="flex justify-end pt-4">
                <div className="text-center w-40 border-t border-zinc-300 pt-1.5">
                  <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider">Authorized Officer</p>
                  <p className="text-[9px] text-zinc-500">Accounts Department</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Seal */}
          <div className="pt-4 text-center border-t border-zinc-200">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${
              isPaid ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {isPaid ? (
                <>
                  <CheckCircle2 size={15} /> PAYMENT SETTLE - ACCOUNTS ERP VERIFIED
                </>
              ) : (
                <>
                  <AlertCircle size={15} /> PENDING SETTLEMENT - INSTITUTIONAL ACCOUNTS ERP
                </>
              )}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
