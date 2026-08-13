'use client';

import { School } from 'lucide-react';
import { hexToRgba } from '@/lib/themeHelper';

export default function TeacherIdCard({ teacher, schoolInfo, activeYear, containerId = 'teacher-modal-id-card-printable' }) {
  if (!teacher) return null;

  const fullName = teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Teacher Name';
  const schoolLogo = schoolInfo?.logo_url || schoolInfo?.logo;
  const schoolName = schoolInfo?.schoolName || schoolInfo?.name || 'Greenwood International School';
  const subject = teacher.subject || 'Faculty Member';
  const assignedClasses = teacher.class_assigned || teacher.classAssigned || 'N/A';

  const rawPhoto = teacher.image_url || teacher.photo;
  const teacherPhoto = rawPhoto && typeof rawPhoto === 'string' && !rawPhoto.includes('ui-avatars.com') ? rawPhoto : null;
  const primaryColor = schoolInfo?.primaryColor || schoolInfo?.primary_color || '#4f46e5';
  const bgLight = hexToRgba(primaryColor, 0.12);
  const bgLighter = hexToRgba(primaryColor, 0.07);
  const initials = (teacher.first_name?.charAt(0) || teacher.name?.charAt(0) || fullName.charAt(0) || 'T').toUpperCase();

  return (
    <div className="flex justify-center py-2 animate-fadeIn shrink-0" id={containerId}>
      {/* Vertical Faculty ID Card Graphics */}
      <div className="w-[320px] bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden text-slate-900 font-sans relative">
        
        {/* School Header Banner */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border-b border-slate-200/80 p-4 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
              {schoolLogo ? (
                <img src={schoolLogo} alt={schoolName} className="w-full h-full object-cover" />
              ) : (
                <School className="w-4 h-4 text-primary-600" />
              )}
            </div>
            <h3 className="font-black text-xs text-slate-900 tracking-wide uppercase leading-tight">{schoolName}</h3>
          </div>
          <p className="text-[9px] text-primary-600 font-extrabold uppercase tracking-widest">Faculty Identity Credential</p>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: primaryColor }} />
        </div>

        {/* Teacher Photo & Core Info */}
        <div className="p-4 flex flex-col items-center text-center space-y-3">
          <div
            className="w-[88px] h-[88px] rounded-2xl border-2 shadow-md overflow-hidden flex items-center justify-center relative"
            style={{ backgroundColor: bgLight, color: primaryColor, borderColor: hexToRgba(primaryColor, 0.25) }}
          >
            {teacherPhoto ? (
              <img src={teacherPhoto} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl sm:text-4xl font-black tracking-wider" style={{ color: primaryColor }}>{initials}</span>
            )}
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">{fullName}</h4>
            <p className="text-[11px] font-black px-3 py-0.5 rounded-full inline-block mt-0.5" style={{ color: primaryColor, backgroundColor: bgLighter }}>
              {subject}
            </p>
          </div>

          {/* Core Details Grid */}
          <div className="w-full bg-slate-50 rounded-2xl p-2.5 border border-slate-100 grid grid-cols-2 gap-2 text-left text-xs font-medium">
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Employee ID</span>
              <span className="font-extrabold text-slate-800 text-[11px]">{teacher.employee_id || `EMP-${teacher.id}`}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Qualification</span>
              <span className="font-extrabold text-slate-800 text-[11px]">{teacher.qualification || 'Higher Degree'}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Designation</span>
              <span className="font-bold text-slate-800 text-[11px]">{teacher.designation || 'Senior Faculty'}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Experience</span>
              <span className="font-bold text-slate-800 text-[11px]">{teacher.experience_years ? `${teacher.experience_years} Years` : '5+ Years'}</span>
            </div>
          </div>

          {/* Classes & Contact Info */}
          <div className="w-full text-left space-y-1.5 text-xs border-t border-slate-100 pt-2.5">
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                {/* BookOpen SVG */}
                <svg className="w-3.5 h-3.5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg> Assigned Class:
              </span>
              <span className="font-extrabold text-slate-900">{assignedClasses}</span>
            </div>
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-slate-500 font-semibold">Email:</span>
              <span className="font-bold text-slate-900">{teacher.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-slate-500 font-semibold">Contact Phone:</span>
              <span className="font-bold text-slate-900">{teacher.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500">
          <span>Session: {activeYear?.year_name || '2026-2027'}</span>
          <span className="text-primary-700 flex items-center gap-1">
            {/* CheckCircle SVG */}
            <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg> Verified Faculty
          </span>
        </div>
      </div>
    </div>
  );
}
