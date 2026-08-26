'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  X, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Copy,
  Check,
  Receipt,
  Download,
  GraduationCap,
  Bus
} from 'lucide-react';
import { notifySuccess } from '@/lib/notify';

/**
 * Full A4 Printable Fee Invoice & Official Receipt Modal for Parent Portal
 * Replicates the school/billing standard format with institutional seal & ledger.
 */
export default function ParentFeeInvoiceModal({
  isOpen,
  onClose,
  invoice,
  school,
  student
}) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !invoice || !mounted) return null;

  const invoiceNumber = invoice.invoice_number || `INV-${new Date().getFullYear()}-${String(invoice.id).padStart(4, '0')}`;
  
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

  const amount = parseFloat(invoice.amount || 0);
  const paidAmount = parseFloat(invoice.paid_amount || 0);
  const discountAmount = parseFloat(invoice.discount_amount || 0);
  const remainingAmount = parseFloat(invoice.remaining_amount || 0);

  const isPaid = invoice.status === 'PAID' || remainingAmount === 0;

  const schoolName = school?.name || school?.school_name || 'Greenwood International School';
  const schoolLogo = school?.logo_url || school?.logo;
  const schoolPhone = school?.phone || '079-2658-9900';
  const schoolEmail = school?.email || 'accounts@greenwood.edu';
  const schoolAddress = school?.address || 'Main Institutional Campus, Sector 12';

  const studentName = student?.name || 
    (student?.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Ward');

  const studentClass = student?.class || student?.grade || 'Class 10-A';
  const admissionNumber = student?.admission_number || 'ADM-2026-089';
  const rollNumber = student?.roll_number ? `#${student.roll_number}` : '';

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Invoice ${invoiceNumber} - ${invoice.term} for ${studentName} (Amount: ₹${amount.toLocaleString('en-IN')})`);
    setCopied(true);
    notifySuccess('Invoice summary copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn print:p-0 print:bg-white print:static print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:h-auto print:max-w-none print:shadow-none print:rounded-none print:bg-white print:border-none print:m-0 print:p-0">
        
        {/* Top Floating Action Bar (Screen Only - Hidden during print) */}
        <div className="flex items-center justify-between p-4 px-6 bg-white border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-200/80 flex items-center justify-center text-primary-700 font-black">
              <Receipt size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">{invoiceNumber}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Official Institutional Fee Receipt</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer shadow-2xs"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs transition shadow-md shadow-primary-600/25 cursor-pointer"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable A4 Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 print:p-0 print:bg-white print:overflow-visible flex justify-center">
          
          {/* Main A4 Styled Sheet Container */}
          <div 
            id="parent-invoice-sheet" 
            className="w-full max-w-[794px] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10 flex flex-col justify-between space-y-8 print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none print:text-slate-900"
          >
            {/* Header: School Brand & Invoice Meta */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-200/80 p-1 flex items-center justify-center text-primary-700 shrink-0 overflow-hidden shadow-2xs">
                    {schoolLogo ? (
                      <img src={schoolLogo} alt={schoolName} className="w-full h-full object-contain rounded-xl" />
                    ) : (
                      <span className="font-black text-xl text-primary-600">{schoolName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{schoolName}</h1>
                    <p className="text-xs text-primary-600 font-bold">Institutional Accounts & Finance Department</p>
                    <p className="text-[11px] text-slate-400 pt-0.5">{schoolAddress} • Ph: {schoolPhone} • {schoolEmail}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right p-3 rounded-2xl bg-slate-50 border border-slate-200 w-full sm:w-auto shrink-0 space-y-0.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary-100 text-primary-800 border border-primary-200 uppercase tracking-widest">
                    OFFICIAL FEE RECEIPT
                  </span>
                  <div className="text-base font-black text-slate-900 font-mono">{invoiceNumber}</div>
                  <div className="flex items-center sm:justify-end space-x-1 text-[11px] text-slate-500 font-medium">
                    <Calendar size={12} />
                    <span>Issue Date: <strong>{issueDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Billed To / Student Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Student Info Card */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-1.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">STUDENT & WARD PARTICULARS</h4>
                  <h3 className="text-sm font-black text-slate-900">{studentName}</h3>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={13} className="text-primary-600 shrink-0" />
                      <span>Class & Section: <strong className="text-slate-900">{studentClass}</strong> {rollNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={13} className="text-primary-600 shrink-0" />
                      <span>Admission No: <strong className="text-slate-900 font-mono">{admissionNumber}</strong></span>
                    </div>
                    {invoice.academic_year && (
                      <div className="text-[11px] text-slate-500 font-semibold pt-0.5">
                        Academic Session: {invoice.academic_year}
                      </div>
                    )}
                  </div>
                </div>

                {/* Settlement & Status Card */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PAYMENT SUMMARY</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-0.5 border-b border-slate-200">
                      <span className="text-slate-500">Settlement Status:</span>
                      <span className={`font-black uppercase flex items-center gap-1 ${
                        isPaid ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPaid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-bold text-slate-800">
                        {invoice.latest_payment?.payment_mode || 'Online Banking / UPI'}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-200">
                      <span className="text-slate-500">Receipt Ref:</span>
                      <span className="font-mono text-slate-800 font-bold">
                        {invoice.latest_payment?.receipt_number || `REC-${invoice.id}`}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Line Items Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Fee Item / Particulars</th>
                      <th className="py-3 px-4 whitespace-nowrap">Academic Term</th>
                      <th className="py-3 px-4 text-right">Allocated Amount</th>
                      <th className="py-3 px-4 text-right">Paid Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="py-4 px-4">
                        <div className="font-black text-slate-900 text-sm">
                          {invoice.term}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {invoice.description || 'Institutional Tuition, Smart Bus & Campus Facility Assessment'}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200/80">
                          {invoice.academic_year || '2026-2027'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        ₹ {amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                        ₹ {paidAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations & Footer */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
                <div className="text-[11px] text-slate-500 space-y-1 max-w-sm">
                  <p className="font-bold text-slate-800 uppercase tracking-wider">Terms & Notes:</p>
                  <p>1. This is an electronically verified institutional fee receipt and requires no physical seal.</p>
                  <p>2. Keep this receipt for official academic and tax compliance records.</p>
                </div>

                <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Gross Allocated Fee:</span>
                    <span className="font-mono font-bold text-slate-900">₹ {amount.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-amber-700 font-medium">
                      <span>Concession / Discount:</span>
                      <span className="font-mono font-bold text-amber-700">- ₹ {discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Total Amount Cleared:</span>
                    <span className="font-mono font-bold text-emerald-700">₹ {paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-base text-slate-900">
                    <span>Net Balance Due:</span>
                    <span className={`font-mono ${remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹ {remainingAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Paid Footer Seal */}
              <div className="pt-4 text-center border-t border-slate-200">
                <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${
                  isPaid ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {isPaid ? (
                    <>
                      <CheckCircle2 size={16} /> Verified Official Fee Receipt • Greenwood Accounts Department
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-amber-600" /> Pending Institutional Installment • Due on {issueDate}
                    </>
                  )}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
