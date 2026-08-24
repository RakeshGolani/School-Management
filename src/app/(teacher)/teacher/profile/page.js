'use client';
import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  CalendarDays,
  Printer,
  Edit3
} from 'lucide-react';
import { getTeacherSessionAction } from '@/actions/teacher/authActions';
import TeacherIdCard from '@/components/ui/TeacherIdCard';
import TeacherProfileEditDrawer from '@/components/modals/TeacherProfileEditDrawer';
import TeacherProfileSkeleton from '@/components/skeletons/teacher/TeacherProfileSkeleton';
import Button from '@/components/ui/Button';

export default function TeacherProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const session = await getTeacherSessionAction();
        if (session?.user) {
          setUser(session.user);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !user) {
    return <TeacherProfileSkeleton />;
  }

  const handlePrint = () => {
    window.print();
  };

  const teacherName = user?.name || 'Faculty Member';
  const employeeId = user?.employee_id || 'EMP-1001';
  const email = user?.email || 'teacher@school.com';
  const phone = user?.phone || '+91 9876543210';
  const subject = user?.subject || 'Mathematics';
  const qualification = user?.qualification || 'M.Sc. Mathematics, B.Ed.';
  const schoolName = user?.school?.name || user?.school?.school_name || 'Greenwood International School';
  const gender = user?.gender ? (user.gender.toUpperCase()) : 'MALE';
  const classTeacherFor = user?.class_teacher_for?.[0]?.class_name 
    ? `${user.class_teacher_for[0].class_name} - ${user.class_teacher_for[0].section}`
    : 'Subject Faculty';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner with Edit Button */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white text-3xl font-black shadow-md shadow-primary-500/20 shrink-0">
            {teacherName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700 border border-primary-200">
              <Sparkles size={12} /> Faculty Profile & Credentials
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{teacherName}</h1>
            <p className="text-xs text-primary-600 font-mono font-bold">
              Employee ID: {employeeId} • {classTeacherFor}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button
            variant="primary"
            icon={Edit3}
            onClick={() => setEditDrawerOpen(true)}
            className="shadow-md"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left Details + Right ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Academic & Personal Details + Contact & Security */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Academic & Personal Details Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User size={16} className="text-primary-600" /> Academic & Personal Details
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Verified Credentials</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Faculty Full Name</span>
                <span className="text-slate-900 font-bold">{teacherName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Department / Subject</span>
                <span className="text-slate-900 font-bold">{subject}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Qualifications</span>
                <span className="text-slate-900 font-bold">{qualification}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Gender</span>
                <span className="text-slate-900 font-bold uppercase">{gender}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Institution Campus</span>
                <span className="text-slate-900 font-bold">{schoolName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Account Status</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Staff
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Security Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" /> Contact & Security
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Institutional Access</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="text-slate-900 font-mono font-medium">{email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Phone Number</span>
                <span className="text-slate-900 font-mono font-medium">{phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">NFC Teacher Badge</span>
                <span className="text-primary-600 font-mono font-bold">
                  {user?.nfc_card_uid || 'NFC-STAFF-9021'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Role Authority</span>
                <span className="text-primary-700 font-bold">{classTeacherFor}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Official Digital Identity Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Official ID Card Component */}
          <TeacherIdCard
            teacher={user}
            schoolInfo={user?.school}
            activeYear="2026-2027"
            containerId="teacher-profile-id-card-printable"
          />
        </div>

      </div>

      {/* Reusable Teacher Profile Edit Drawer */}
      <TeacherProfileEditDrawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        user={user}
        onProfileUpdated={(updated) => setUser(updated)}
      />
    </div>
  );
}
