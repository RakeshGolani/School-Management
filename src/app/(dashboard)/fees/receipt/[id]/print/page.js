'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import InvoiceSkeleton from '@/components/skeletons/school/InvoiceSkeleton';
import { 
  Building2, 
  CheckCircle2, 
  Calendar, 
  Landmark, 
  Mail, 
  Phone, 
  MapPin,
  User,
  GraduationCap
} from 'lucide-react';
import { getFeeReceiptAction } from '@/actions/school/feeActions';
import { getSessionAction } from '@/actions/school/authActions';

export default function StandalonePrintReceiptPage() {
  const params = useParams();
  const id = params?.id;

  const [payment, setPayment] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        // 1. Get school session
        const session = await getSessionAction();
        if (!session || !session.user || !session.user.id) {
          throw new Error('Active session not found.');
        }

        const schoolId = session.user.id;

        // 2. Fetch school profile for header
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
        const profileResponse = await fetch(`${apiUrl}/profile?schoolId=${schoolId}`, { cache: 'no-store' });
        const profileData = await profileResponse.json();
        let fetchedSchool = {};
        if (profileData.success && profileData.data) {
          fetchedSchool = profileData.data;
        }

        // 3. Fetch receipt transaction details
        const receiptRes = await getFeeReceiptAction(id);
        if (receiptRes.success && receiptRes.data) {
          setPayment(receiptRes.data);
          setSchool({
            school_name: fetchedSchool.schoolName || fetchedSchool.school_name || fetchedSchool.name || session.user.schoolName || 'N/A',
            code: fetchedSchool.code || 'N/A',
            address: fetchedSchool.address || '',
            email: fetchedSchool.email || '',
            phone: fetchedSchool.phone || '',
            logo: fetchedSchool.logo || null
          });
        }
      } catch (err) {
        console.error('Print receipt fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReceipt();
  }, [id]);

  useEffect(() => {
    let timer;
    if (payment && !loading) {
      timer = setTimeout(() => {
        window.print();
      }, 500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [payment, loading]);

  if (loading || !payment || !school) {
    return <InvoiceSkeleton theme="light" showActionBar={true} />;
  }

  const studentFee = payment.studentFee || {};
  const student = studentFee.student || {};
  const schoolClass = student.schoolClass || {};
  const feeCategory = studentFee.feeCategory || {};

  const receiptNumber = payment.receipt_number || `REC-${id}`;
  const issueDate = new Date(payment.payment_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const amountPaid = parseFloat(payment.amount_paid || 0);
  const allocatedAmount = parseFloat(studentFee.amount || 0);
  const totalPaidBefore = parseFloat(studentFee.paid_amount || 0) - amountPaid;
  const discountAmount = parseFloat(studentFee.discount_amount || 0);
  const remainingBalance = Math.max(0, allocatedAmount - studentFee.paid_amount - discountAmount);

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

      <div id="receipt-document" className="border border-zinc-200 rounded-2xl p-8 bg-white shadow-sm print:border-none print:shadow-none print:p-0 flex flex-col justify-between min-h-[780px] print:min-h-[262mm] w-full">
        
        {/* Top Content Group */}
        <div className="space-y-6 print:space-y-5 w-full">
          {/* Header */}
          <div className="flex justify-between items-start pb-6 border-b border-zinc-200 gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center font-black text-white shrink-0 overflow-hidden">
                  {school.logo ? (
                    <img src={school.logo} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <Landmark size={24} />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-black text-zinc-900 tracking-tight">{school.school_name}</h1>
                  <p className="text-xs text-primary-600 font-bold">Institution Fee Receipt</p>
                </div>
              </div>
              <p className="text-[11px] text-zinc-650 pt-1.5 leading-relaxed">
                {school.address || 'Institution Campus, Academic Square'} <br />
                School Code: {school.code} | Support: {school.email || 'erp@school.com'}
              </p>
            </div>

            <div className="text-right space-y-1 bg-zinc-50 p-4 rounded-xl border border-zinc-200 min-w-[200px]">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800 border border-primary-300 uppercase tracking-widest mb-1">
                FEE RECEIPT
              </span>
              <h2 className="text-base font-bold text-zinc-900 font-mono">{receiptNumber}</h2>
              <div className="flex items-center justify-end space-x-1.5 text-[11px] text-zinc-650">
                <Calendar size={13} />
                <span>Date: {issueDate}</span>
              </div>
            </div>
          </div>

          {/* Student & Payment Meta Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">STUDENT DETAILS</h4>
              <h3 className="text-sm font-bold text-zinc-900">{student.first_name} {student.last_name}</h3>
              <p className="text-xs text-zinc-750 flex items-center gap-2">
                <GraduationCap size={13} className="shrink-0 text-zinc-400" />
                <span>Class / Grade: <strong className="text-zinc-900">{schoolClass.class_name || 'N/A'}-{schoolClass.section || 'A'}</strong></span>
              </p>
              <p className="text-xs text-zinc-755 flex items-center gap-2">
                <User size={13} className="shrink-0 text-zinc-400" />
                <span>Admission No: <strong className="text-zinc-900 font-mono">{student.admission_number || '-'}</strong></span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">TRANSACTION INFO</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-0.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Payment Status:</span>
                  <span className="font-bold text-emerald-700 uppercase flex items-center gap-1">
                    <CheckCircle2 size={13} /> Settle / Success
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Payment Channel:</span>
                  <span className="font-semibold text-zinc-900 capitalize">{payment.payment_mode || 'Cash'}</span>
                </div>
                {payment.reference_number && (
                  <div className="flex justify-between py-0.5 border-b border-zinc-200">
                    <span className="text-zinc-600">Transaction Reference:</span>
                    <span className="font-mono text-zinc-900 font-bold">{payment.reference_number}</span>
                  </div>
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
                  <th className="py-2.5 px-3.5 text-right">Previous Paid</th>
                  <th className="py-2.5 px-3.5 text-right">Amount Paid Now</th>
                  <th className="py-2.5 px-3.5 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-zinc-900">{feeCategory.name || 'Student Fee Structure'}</div>
                    {payment.remarks && (
                      <div className="text-[10px] text-zinc-500 mt-1 font-medium">Remarks: {payment.remarks}</div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono">₹{allocatedAmount.toFixed(2)}</td>
                  <td className="py-3 px-3.5 text-right font-mono">₹{totalPaidBefore.toFixed(2)}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-zinc-900">₹{amountPaid.toFixed(2)}</td>
                  <td className="py-3 px-3.5 text-right font-mono text-rose-600 font-bold">₹{remainingBalance.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Content Group */}
        <div className="space-y-6 print:space-y-5 w-full pt-6 print:pt-0">
          {/* Calculations & Signatures */}
          <div className="flex justify-between items-start pt-1 gap-4">
            <div className="text-[11px] text-zinc-650 space-y-0.5 max-w-sm">
              <p className="font-bold text-zinc-800">Terms & Acknowledgments:</p>
              <p>1. This receipt is computer-generated and constitutes valid proof of payment.</p>
              <p>2. Fees once paid are subject to institutional refund policies.</p>
              <p>3. Please preserve this receipt for final academic year clearance.</p>
            </div>

            <div className="w-80 space-y-4">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2 text-xs">
                {discountAmount > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Applied Discounts:</span>
                    <span className="font-mono text-emerald-600">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-zinc-900 pt-1">
                  <span>Amount Transacted:</span>
                  <span className="font-mono text-zinc-900 text-base font-black">₹{amountPaid.toFixed(2)}</span>
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
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
              <CheckCircle2 size={15} /> Payment Settle - Accounts ERP Verified
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
