'use client';
import { useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';

/**
 * Single Student Avatar with Hover Popover / Tooltip
 */
export function StudentAvatarItem({ student, size = 'sm', index = 0 }) {
  const [showPopover, setShowPopover] = useState(false);
  const [imageError, setImageError] = useState(false);

  const initial = (student?.first_name ? student.first_name[0] : 'S').toUpperCase();
  const fullName = `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Student';
  const photoUrl = !imageError && (student?.image_url || student?.photo);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-7.5 h-7.5 text-xs',
    lg: 'w-9 h-9 text-sm'
  }[size] || 'w-6 h-6 text-[10px]';

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      style={{ 
        zIndex: showPopover ? 9999 : (10 - index),
        position: 'relative'
      }}
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      {/* Student Avatar Box */}
      <div 
        className={`relative ${sizeClasses} rounded-full border border-white shadow-xs overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700 font-black flex items-center justify-center cursor-pointer transition-all duration-150 ${
          showPopover ? 'scale-115 ring-2 ring-primary-500 shadow-md' : 'hover:scale-105'
        } shrink-0`}
      >
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={fullName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full" 
          />
        ) : (
          <span className="select-none font-black text-primary-700 tracking-tight">{initial}</span>
        )}
      </div>

      {/* Floating Hover Popover (Compact & High Z-Index) */}
      {showPopover && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
          style={{ zIndex: 10000 }}
        >
          <div className="relative bg-slate-900 text-white px-2.5 py-1.5 rounded-lg shadow-2xl border border-slate-700 text-center flex flex-col items-center justify-center gap-0.5 min-w-max">
            {/* Student Name */}
            <p className="font-bold text-[11px] text-white leading-normal m-0 whitespace-nowrap tracking-tight">
              {fullName}
            </p>

            {/* Student Details Badge */}
            <div className="flex items-center justify-center gap-1 text-[9.5px] text-slate-300 font-medium whitespace-nowrap">
              {student?.grade && <span className="text-slate-200">{student.grade}</span>}
              {student?.admission_number && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-primary-300 font-bold">{student.admission_number}</span>
                </>
              )}
            </div>

            {/* Popover Pointer Arrow */}
            <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Overflowing "+N More" Badge with Hover Popover showing list of remaining students
 */
function MoreStudentsBadge({ remainingStudents = [] }) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      style={{ zIndex: showPopover ? 9999 : 0, position: 'relative' }}
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <div 
        className="w-6 h-6 rounded-full border border-white bg-slate-800 text-white font-bold text-[9px] flex items-center justify-center shadow-xs cursor-pointer transition-all hover:scale-110 shrink-0"
      >
        +{remainingStudents.length}
      </div>

      {/* Floating Popover listing all remaining students */}
      {showPopover && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
          style={{ zIndex: 10000 }}
        >
          <div className="relative bg-slate-900 text-white p-2 rounded-xl shadow-2xl border border-slate-700 min-w-[150px] max-w-[200px] text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1 border-b border-slate-800 pb-1">
              +{remainingStudents.length} More Students
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {remainingStudents.map((st) => (
                <div key={st.id} className="flex items-center gap-1.5 px-1 py-0.5 rounded-md hover:bg-slate-800/60">
                  <div className="w-4.5 h-4.5 rounded-full bg-primary-900 text-primary-300 text-[8px] font-black flex items-center justify-center shrink-0 border border-primary-700/50">
                    {(st.first_name?.[0] || 'S').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white truncate leading-tight m-0">
                      {st.first_name} {st.last_name}
                    </p>
                    <p className="text-[8.5px] text-slate-400 truncate m-0">
                      {st.grade || 'Student'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Popover Pointer Arrow */}
            <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Overlapping Avatar Stack of Students for a Stop
 */
export default function StudentAvatarStack({ students = [], max = 5, size = 'sm' }) {
  if (!students || students.length === 0) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
        <Users size={10} className="shrink-0" />
        <span>No students assigned</span>
      </div>
    );
  }

  const visibleStudents = students.slice(0, max);
  const remainingStudents = students.slice(max);

  return (
    <div className="pt-1.5 border-t border-slate-100 space-y-1">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={10} className="text-primary-600 shrink-0" />
          Students ({students.length})
        </span>
      </div>

      {/* Avatar Row */}
      <div className="flex items-center -space-x-1.5 overflow-visible py-0.5">
        {visibleStudents.map((student, index) => (
          <StudentAvatarItem 
            key={student.id} 
            student={student} 
            size={size}
            index={index}
          />
        ))}

        {remainingStudents.length > 0 && (
          <MoreStudentsBadge remainingStudents={remainingStudents} />
        )}
      </div>
    </div>
  );
}
