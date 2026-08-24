'use client';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Receipt,
  FileText
} from 'lucide-react';
import { notifySuccess } from '@/lib/notify';

export default function ParentFeesPage() {
  const { activeChild } = useParentChild();

  const childName = activeChild?.full_name || activeChild?.first_name || 'Ward';

  const invoices = [
    { id: 'INV-2026-001', term: 'Term 1 Tuition & Smart Bus Fee', amount: '₹ 24,500', dueDate: '15 Jul 2026', paidOn: '10 Jul 2026', mode: 'Online UPI', status: 'PAID' },
    { id: 'INV-2026-002', term: 'Term 1 Lab & Activity Fee', amount: '₹ 3,500', dueDate: '15 Jul 2026', paidOn: '10 Jul 2026', mode: 'NetBanking', status: 'PAID' },
    { id: 'INV-2026-003', term: 'Term 2 Tuition & Smart Bus Fee', amount: '₹ 24,500', dueDate: '15 Nov 2026', paidOn: '--', mode: '--', status: 'UPCOMING' },
  ];

  const handleDownload = (invId) => {
    notifySuccess(`Downloading official receipt for ${invId}...`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 mb-2">
            <CreditCard size={13} className="text-primary-600" /> Fee Accounts & Receipts
          </div>
          <h1 className="text-2xl font-black text-slate-900">Fee Invoices for {childName}</h1>
          <p className="text-xs text-slate-500">Review institutional fee allocations, payment receipts, and upcoming installments.</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-primary-600">₹ 0 Pending</div>
          <p className="text-[11px] text-slate-500 font-semibold">All current term dues cleared</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Invoice History</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
              <div className="flex items-start sm:items-center space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 shrink-0">
                  <Receipt size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inv.term}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{inv.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Due Date: {inv.dueDate} {inv.paidOn !== '--' && `• Paid on ${inv.paidOn} (${inv.mode})`}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <div className="text-base font-black text-slate-900">{inv.amount}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                {inv.status === 'PAID' ? (
                  <button
                    onClick={() => handleDownload(inv.id)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer shadow-2xs"
                    title="Download Receipt"
                  >
                    <Download size={16} />
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition cursor-pointer"
                  >
                    Pay Online
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
