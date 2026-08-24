'use client';
import { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Sparkles, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  BookOpen, 
  Radio, 
  Calendar,
  Printer,
  Edit3
} from 'lucide-react';
import { getStudentSessionAction } from '@/actions/student/authActions';
import StudentIdCard from '@/components/ui/StudentIdCard';
import StudentProfileEditDrawer from '@/components/modals/StudentProfileEditDrawer';
import StudentProfileSkeleton from '@/components/skeletons/student/StudentProfileSkeleton';
import Button from '@/components/ui/Button';

export default function StudentProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const session = await getStudentSessionAction();
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
    return <StudentProfileSkeleton />;
  }

  const handlePrint = () => {
    window.print();
  };

  const studentName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Student';
  const admissionNumber = user?.admission_number || 'ADM-2026-001';
  const rollNumber = user?.roll_number || '01';
  const className = user?.class?.class_name 
    ? `${user.class.class_name} - ${user.class.section}` 
    : (user?.schoolClass ? `${user.schoolClass.class_name} - ${user.schoolClass.section}` : (user?.grade || 'Class 10-A'));
  const schoolName = user?.school?.name || user?.school?.school_name || 'EduManage Academy';
  const guardianName = user?.guardian_name || 'Parent Guardian';
  const guardianPhone = user?.guardian_phone || '+91 9876543210';
  const alternatePhone = user?.alternate_phone || 'N/A';
  const address = user?.address || 'Not Provided';
  const dob = user?.dob ? new Date(user.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '14 May 2011';
  const gender = user?.gender ? (user.gender.toUpperCase()) : 'MALE';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner with Edit Button */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white text-3xl font-black shadow-md shadow-primary-500/20 shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700 border border-primary-200">
              <Sparkles size={12} /> Digital Student Identity & Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{studentName}</h1>
            <p className="text-xs text-primary-600 font-mono font-bold">
              Admission No: {admissionNumber} • Roll No: {rollNumber} • {className}
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
        
        {/* LEFT COLUMN: Academic Details + Guardian & Access Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Academic Information Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User size={16} className="text-primary-600" /> Academic & Personal Information
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Enrolled Student</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Student Full Name</span>
                <span className="text-slate-900 font-bold">{studentName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Class & Section</span>
                <span className="text-slate-900 font-bold">{className}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Roll Number</span>
                <span className="text-slate-900 font-mono font-bold">{rollNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Date of Birth</span>
                <span className="text-slate-900 font-mono">{dob}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Gender</span>
                <span className="text-slate-900 font-bold uppercase">{gender}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Institution Campus</span>
                <span className="text-slate-900 font-bold">{schoolName}</span>
              </div>
            </div>
          </div>

          {/* Guardian & Access Telemetry Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" /> Guardian & Access Telemetry
              </h2>
              <span className="text-[11px] font-bold text-slate-400">Contact & Transit</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Guardian Name</span>
                <span className="text-slate-900 font-bold">{guardianName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Guardian Contact</span>
                <span className="text-slate-900 font-mono font-bold">{guardianPhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Alternate Contact</span>
                <span className="text-slate-900 font-mono">{alternatePhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Residential Address</span>
                <span className="text-slate-900 font-medium max-w-[240px] text-right truncate">{address}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">NFC Gate Card UID</span>
                <span className="text-primary-600 font-mono font-bold">
                  {user?.nfc_card_uid || 'NFC-8921-A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Smart Bus Transit</span>
                <span className="text-amber-700 font-bold">
                  {user?.bus_route?.route_name ? `Enrolled (${user.bus_route.route_name})` : 'Enrolled (Smart Bus)'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Official Student ID Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Official ID Card Component */}
          <StudentIdCard
            student={user}
            schoolInfo={user?.school}
            activeYear="2026-2027"
            containerId="student-profile-id-card-printable"
          />
        </div>

      </div>

      {/* Reusable Student Profile Edit Drawer */}
      <StudentProfileEditDrawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        user={user}
        onProfileUpdated={(updated) => setUser(updated)}
      />
    </div>
  );
}
