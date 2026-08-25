'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  CalendarDays, 
  User, 
  Clock, 
  PhoneCall, 
  Send, 
  ShieldCheck,
  MessageSquareQuote,
  FileText,
  Building
} from 'lucide-react';

export default function SchoolReviewLeaveModal({
  isOpen,
  leave,
  onClose,
  onSubmit,
  loading
}) {
  const [mounted, setMounted] = useState(false);
  const [decision, setDecision] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && leave) {
      setDecision(leave.status === 'REJECTED' ? 'REJECTED' : 'APPROVED');
      setRemarks(leave.teacher_remarks || '');
      setError('');
    }
  }, [isOpen, leave]);

  if (!isOpen || !leave || !mounted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!decision) {
      setError('Please select whether to Approve or Reject this leave request.');
      return;
    }
    onSubmit(leave.id, {
      status: decision,
      remarks: remarks
    });
  };

  const initial = (leave.student_name || 'S').trim().charAt(0).toUpperCase();

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto animate-fadeIn flex items-center justify-center p-4">
      {/* 100% Full Viewport Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Building size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                School Admin Leave Review
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Principal & Administration Decision Override
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Student Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-500/25 flex items-center justify-center text-primary-700 font-black text-sm shrink-0 overflow-hidden relative shadow-2xs">
                <span>{initial}</span>
                {leave.student_image_url || (leave.student_photo && (leave.student_photo.startsWith('/') || leave.student_photo.startsWith('http'))) ? (
                  <img 
                    src={leave.student_image_url || leave.student_photo} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {leave.student_name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5 flex-wrap">
                  <span className="font-mono font-bold text-primary-700">{leave.admission_number}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-700">{leave.class_name}</span>
                  {leave.roll_number && leave.roll_number !== '--' && (
                    <>
                      <span>•</span>
                      <span>Roll #{leave.roll_number}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200/80 shadow-2xs text-slate-700">
                {leave.leave_type_label}
              </span>
            </div>
          </div>

          {/* Leave Duration & Reason Details */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-primary-50/50 border border-primary-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <CalendarDays size={14} className="text-primary-600 shrink-0" />
                <span>{leave.start_date_formatted}</span>
                <span className="text-slate-400">→</span>
                <span>{leave.end_date_formatted}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary-600 text-white font-mono shadow-2xs">
                {leave.days_count} {leave.days_count === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Student Stated Reason:
              </span>
              <p className="font-medium leading-relaxed italic text-slate-700">
                "{leave.reason}"
              </p>
              {leave.emergency_contact && leave.emergency_contact !== '--' && (
                <div className="pt-1.5 mt-1 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <PhoneCall size={12} className="text-slate-400" />
                  <span>Contact: <strong className="text-slate-800">{leave.emergency_contact}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Decision Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Administration Decision <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Approve */}
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-xs cursor-pointer ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-md shadow-emerald-600/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 size={16} className={decision === 'APPROVED' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Approve Leave</span>
              </button>

              {/* Option 2: Reject */}
              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black text-xs cursor-pointer ${
                  decision === 'REJECTED'
                    ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-md shadow-rose-600/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle size={16} className={decision === 'REJECTED' ? 'text-rose-600' : 'text-slate-400'} />
                <span>Reject Leave</span>
              </button>
            </div>
            {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
          </div>

          {/* Administration Remarks Feedback */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Administration Remarks / Note (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Approved by Principal Office / Leave granted on medical grounds..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 min-h-[42px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 text-xs font-black rounded-2xl text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap min-h-[42px] active:scale-95 disabled:opacity-50 ${
                decision === 'REJECTED'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                  : 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/25'
              }`}
            >
              <Send size={14} className="shrink-0 stroke-[2.5]" />
              <span>{loading ? 'Submitting...' : `Confirm ${decision === 'REJECTED' ? 'Rejection' : 'Approval'}`}</span>
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
