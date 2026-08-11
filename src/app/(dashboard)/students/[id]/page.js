'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Bus, 
  ShieldCheck, 
  GraduationCap, 
  Heart, 
  Award,
  Sparkles,
  Edit3,
  Clock,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { notifyError } from '@/lib/notify';

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/students/${studentId}`, { cache: 'no-store' });
        const resData = await res.json();
        const studentInfo = resData.data || resData;

        if (studentInfo && (studentInfo.id || studentInfo.first_name)) {
          setStudent(studentInfo);
        } else {
          notifyError(resData.message || 'Student not found');
        }
      } catch (err) {
        console.error('Error fetching student detail:', err);
        notifyError('Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Student Profile Not Found</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">The requested student profile could not be retrieved.</p>
        <Button onClick={() => router.push('/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
      </div>
    );
  }

  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student Profile';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/students')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant={student.status === 'active' ? 'success' : 'neutral'} className="px-3 py-1 text-xs font-extrabold uppercase">
            {student.status || 'Active'}
          </Badge>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl bg-gradient-to-r from-primary-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:to-slate-900">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Photo */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-800 flex items-center justify-center text-3xl font-black shadow-md overflow-hidden">
              {student.photo ? (
                <img src={student.photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
            {student.nfc_card_uid && (
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md" title="NFC Card Assigned">
                <CreditCard className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Student General Information */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{fullName}</h1>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                  Admission No: <span className="font-extrabold">{student.admission_number || `ADM-${student.id}`}</span>
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <span className="px-3 py-1 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 font-bold text-xs">
                  {student.grade || `Class ${student.class_id || 'N/A'}`}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                  Roll No: {student.rollNumber || student.roll_number || 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{student.gender || 'Not specified'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Date of Birth</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Smart Bus Transport</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-primary-600" />
                  {student.is_bus_service_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">NFC Card UID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{student.nfc_card_uid || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guardian & Emergency Contact */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Guardian & Contact Information</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium">Guardian Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.guardian_name || student.parent?.name || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> Email</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.guardian_email || student.parent?.email || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> Phone</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.guardian_phone || student.parent?.phone || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> Alternate Phone</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.alternate_phone || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Transport & NFC Access Details */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Smart Bus & Location Access</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium">Bus Service Status</span>
              <Badge variant={student.is_bus_service_enabled ? 'success' : 'neutral'} className="font-bold">
                {student.is_bus_service_enabled ? 'Active Transport' : 'Not Subscribed'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium">Bus Route</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.busRoute?.route_name || student.bus_route_id || 'Unassigned'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Bus Stop</span>
              <span className="font-bold text-slate-900 dark:text-white">{student.busStop?.stop_name || student.bus_stop_id || 'Unassigned'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> NFC Hardware UID</span>
              <span className="font-mono font-bold text-primary-600">{student.nfc_card_uid || 'No Card Tap Code'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
