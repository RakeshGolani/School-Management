'use client';

import { School, CreditCard } from 'lucide-react';
import { hexToRgba } from '@/lib/themeHelper';

export default function StudentIdCard({ student, schoolInfo, activeYear, teacher, containerId = 'modal-id-card-printable' }) {
  if (!student) return null;

  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student Name';
  const className = student.schoolClass 
    ? `${student.schoolClass.class_name} - ${student.schoolClass.section}`
    : (student.grade ? `Grade ${student.grade}` : 'Class N/A');
  const classTeacher = teacher || student.schoolClass?.classTeacher;
  const schoolLogo = schoolInfo?.logo_url || schoolInfo?.logo;
  const schoolName = schoolInfo?.schoolName || schoolInfo?.name || 'Greenwood International School';

  const rawPhoto = student.image_url || student.photo;
  const studentPhoto = rawPhoto && typeof rawPhoto === 'string' && !rawPhoto.includes('ui-avatars.com') ? rawPhoto : null;
  const primaryColor = schoolInfo?.primaryColor || schoolInfo?.primary_color || '#4f46e5';
  const bgLight = hexToRgba(primaryColor, 0.12);
  const bgLighter = hexToRgba(primaryColor, 0.07);
  const initials = (student.first_name?.charAt(0) || student.name?.charAt(0) || fullName.charAt(0) || 'S').toUpperCase();

  return (
    <div className="flex justify-center py-2 animate-fadeIn shrink-0" id={containerId}>
      {/* Vertical ID Card Graphics */}
      <div className="w-[320px] bg-white rounded-3xl border-2 border-slate-200 shadow-lg overflow-hidden text-slate-900 font-sans relative">
        
        {/* School Header Banner */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border-b border-slate-200/80 p-3 relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
            {schoolLogo ? (
              <img src={schoolLogo} alt={schoolName} className="w-full h-full object-cover" />
            ) : (
              <School className="w-6 h-6 text-primary-600" />
            )}
          </div>
          <div className="flex flex-col text-left min-w-0 flex-1">
            <h3 className="font-black text-[11px] text-slate-900 tracking-wide uppercase leading-snug whitespace-normal break-words">{schoolName}</h3>
            <p className="text-[9px] text-primary-600 font-extrabold uppercase tracking-widest mt-0.5">Official Student Identity Card</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: primaryColor }} />
        </div>

        {/* Student Photo & General Info */}
        <div className="p-4 flex flex-col items-center text-center space-y-3">
          <div
            className="w-[88px] h-[88px] rounded-2xl border-2 shadow-md overflow-hidden flex items-center justify-center text-2xl font-black relative"
            style={{ backgroundColor: bgLight, color: primaryColor, borderColor: hexToRgba(primaryColor, 0.25) }}
          >
            {studentPhoto ? (
              <img src={studentPhoto} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl sm:text-4xl font-black tracking-wider" style={{ color: primaryColor }}>{initials}</span>
            )}
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">{fullName}</h4>
            <p className="text-[11px] font-black px-3 py-0.5 rounded-full inline-block mt-0.5" style={{ color: primaryColor, backgroundColor: bgLighter }}>
              {className}
            </p>
          </div>

          {/* Core Details Grid */}
          <div className="w-full bg-slate-50 rounded-2xl p-2.5 border border-slate-100 grid grid-cols-2 gap-2 text-left text-xs font-medium">
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Admission No</span>
              <span className="font-extrabold text-slate-800 text-[11px]">{student.admission_number || `ADM-${student.id}`}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Roll Number</span>
              <span className="font-extrabold text-slate-800 text-[11px]">{student.rollNumber || student.roll_number || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Date of Birth</span>
              <span className="font-bold text-slate-800 text-[11px]">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Gender</span>
              <span className="font-bold text-slate-800 text-[11px] uppercase">{student.gender || 'Male'}</span>
            </div>
          </div>

          {/* Class Teacher & Guardian Info */}
          <div className="w-full text-left space-y-1 text-xs border-t border-slate-100 pt-2.5">
            {classTeacher && (
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-primary-50/50 border border-primary-100/60 text-[11px]">
                <span className="text-primary-600 font-bold flex items-center gap-1">
                  {/* Graduation Cap SVG */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg> Class Teacher:
                </span>
                <span className="font-extrabold text-slate-900">{classTeacher.name}</span>
              </div>
            )}

            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-slate-500 font-semibold">Guardian:</span>
              <span className="font-extrabold text-slate-900">{student.guardian_name || student.parent?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-slate-500 font-semibold">Contact Phone:</span>
              <span className="font-bold text-slate-900">{student.guardian_phone || student.parent?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[9px] font-bold text-slate-500">
          <span>Session: {activeYear?.year_name || '2026-2027'}</span>
          <span className={`${student.status === 'active' ? 'text-primary-700' : 'text-rose-600'} flex items-center gap-1`}>
            {/* CheckCircle SVG */}
            <svg className={`w-3 h-3 ${student.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {student.status === 'active' ? 'Verified Student' : 'Pending'}
          </span>
        </div>

      </div>
    </div>
  );
}
