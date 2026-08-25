'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  CalendarDays, 
  FileText, 
  UserCheck, 
  Send, 
  AlertCircle, 
  Clock, 
  PhoneCall, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function StudentApplyLeaveDrawer({
  isOpen,
  onClose,
  onSubmit,
  loading,
  classTeacher,
  studentInfo
}) {
  const [mounted, setMounted] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [formData, setFormData] = useState({
    leave_type: 'sick',
    start_date: todayStr,
    end_date: todayStr,
    reason: '',
    emergency_contact: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        leave_type: 'sick',
        start_date: todayStr,
        end_date: todayStr,
        reason: '',
        emergency_contact: studentInfo?.phone || studentInfo?.guardian_phone || ''
      });
      setErrors({});
    }
  }, [isOpen, todayStr, studentInfo]);

  if (!isOpen || !mounted) return null;

  const leaveTypeOptions = [
    { value: 'sick', label: '🤒 Sick Leave (Fever, Cold, Health issue)' },
    { value: 'casual', label: '🎉 Casual Leave (Family function, Personal)' },
    { value: 'medical', label: '🏥 Medical Emergency (Hospital / Surgery)' },
    { value: 'vacation', label: '✈️ Vacation / Family Travel' },
    { value: 'other', label: '📝 Special Permission / Other' }
  ];

  // Calculate duration
  const start = new Date(formData.start_date);
  const end = new Date(formData.end_date);
  let totalDays = 0;
  let isValidRange = false;

  if (formData.start_date && formData.end_date) {
    if (end >= start) {
      const diffTime = Math.abs(end - start);
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      isValidRange = true;
    }
  }

  const validate = () => {
    const errs = {};
    if (!formData.leave_type) errs.leave_type = 'Please select a leave category';
    if (!formData.start_date) errs.start_date = 'Start date is required';
    if (!formData.end_date) errs.end_date = 'End date is required';
    if (end < start) errs.end_date = 'End date cannot be earlier than start date';
    if (!formData.reason || !formData.reason.trim()) errs.reason = 'Please explain the reason for your leave';
    if (formData.reason && formData.reason.trim().length < 8) errs.reason = 'Please provide a clear description (at least 8 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden animate-fadeIn">
      {/* 100% Full Viewport Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={!loading ? onClose : undefined}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-100">
          
          {/* 🌟 1. Fixed Drawer Header (Rule 10) */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Apply for Leave
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Submit request to Class Teacher
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

          {/* 🌟 2. Scrollable Body Form Container (Rule 10) */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
              
              {/* Class Teacher Preview Banner */}
              {classTeacher ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-primary-50 border border-primary-500/25 flex items-center justify-center text-primary-700 font-black text-sm shrink-0 overflow-hidden relative shadow-2xs">
                      <span>{(classTeacher.name || 'T').trim().charAt(0).toUpperCase()}</span>
                      {classTeacher.image_url || (classTeacher.photo && (classTeacher.photo.startsWith('/') || classTeacher.photo.startsWith('http'))) ? (
                        <img 
                          src={classTeacher.image_url || classTeacher.photo} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{classTeacher.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary-100 text-primary-800 uppercase">Reviewer</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        Assigned Class Teacher • {classTeacher.class_name || studentInfo?.class || 'Class Desk'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Leave Type Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Leave Category <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={formData.leave_type}
                  onChange={(e) => {
                    const selectedVal = e?.target ? e.target.value : e;
                    setFormData(prev => ({ ...prev, leave_type: selectedVal }));
                  }}
                  options={leaveTypeOptions}
                  placeholder="Select leave category"
                />
                {errors.leave_type && (
                  <p className="text-[11px] text-rose-500 font-semibold">{errors.leave_type}</p>
                )}
              </div>

              {/* Date Range Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Leave Dates & Duration <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">From Date</span>
                    <DatePicker
                      value={formData.start_date}
                      disablePast={true}
                      minDate={todayStr}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setFormData(prev => {
                          // Auto-adjust end date if it is earlier than new start date
                          const shouldAdjustEnd = prev.end_date && newStart && new Date(prev.end_date) < new Date(newStart);
                          return {
                            ...prev,
                            start_date: newStart,
                            end_date: shouldAdjustEnd ? newStart : prev.end_date
                          };
                        });
                      }}
                      placeholder="Start date"
                    />
                    {errors.start_date && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">To Date</span>
                    <DatePicker
                      value={formData.end_date}
                      disablePast={true}
                      minDate={formData.start_date || todayStr}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      placeholder="End date"
                      align="right"
                    />
                    {errors.end_date && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                {/* Duration Capsule */}
                {isValidRange && totalDays > 0 ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Clock size={13} className="text-emerald-700 shrink-0" />
                      <span>Total Leave Duration:</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white font-mono shadow-2xs">
                      {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Reason Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Reason for Absence <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Clearly explain the reason for requesting leave (e.g. Suffering from viral fever, attending cousin's wedding ceremony, etc.)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition resize-none font-medium leading-relaxed"
                />
                {errors.reason && (
                  <p className="text-[11px] text-rose-500 font-semibold">{errors.reason}</p>
                )}
              </div>

              {/* Emergency Contact Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Emergency Contact Number (Optional)
                </label>
                <div className="relative">
                  <PhoneCall size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    placeholder="Parent / Guardian mobile number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition font-mono font-medium"
                  />
                </div>
              </div>

              {/* Guidelines Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck size={13} className="text-amber-700" />
                  <span>Important Leave Policy</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed font-medium">
                  Your leave request will be routed directly to your Class Teacher. Upon approval, your attendance status for these dates will be automatically marked as verified leave.
                </p>
              </div>

            </div>

            {/* 🌟 3. Fixed Action Footer (Rule 10) */}
            <div className="p-5 sm:p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
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
                className="px-6 py-2.5 text-xs font-black rounded-2xl bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap min-h-[42px] active:scale-95 disabled:opacity-50"
              >
                <Send size={14} className="shrink-0 stroke-[2.5]" />
                <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>,
    document.body
  );
}
