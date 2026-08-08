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
  GraduationCap, 
  Award,
  Sparkles,
  BookOpen,
  Briefcase,
  DollarSign,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { notifyError } from '@/lib/notify';

export default function TeacherDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params?.id;

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, { cache: 'no-store' });
        const resData = await res.json();
        const teacherInfo = resData.data || resData;

        if (teacherInfo && (teacherInfo.id || teacherInfo.name || teacherInfo.first_name)) {
          setTeacher(teacherInfo);
        } else {
          notifyError(resData.message || 'Teacher not found');
        }
      } catch (err) {
        console.error('Error fetching teacher detail:', err);
        notifyError('Failed to load teacher details');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Teacher Profile Not Found</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">The requested teacher profile could not be retrieved.</p>
        <Button onClick={() => router.push('/teachers')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teachers
        </Button>
      </div>
    );
  }

  const fullName = teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Teacher Profile';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/teachers')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teachers</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant={teacher.status === 'active' ? 'success' : 'neutral'} className="px-3 py-1 text-xs font-extrabold uppercase">
            {teacher.status || 'Active'}
          </Badge>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl bg-gradient-to-r from-primary-50/60 via-white to-indigo-50/40 dark:from-slate-900 dark:to-slate-900">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Photo */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-3xl font-black shadow-md overflow-hidden">
              {teacher.photo ? (
                <img src={teacher.photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
            {teacher.nfc_card_uid && (
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md" title="NFC Card Assigned">
                <CreditCard className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Teacher General Information */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{fullName}</h1>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                  Employee ID: <span className="font-extrabold">{teacher.employee_id || `EMP-${teacher.id}`}</span>
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                  {teacher.subject || 'Faculty'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                  Assigned Class: {teacher.class_assigned || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{teacher.email || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Qualification</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.qualification || 'Higher Education'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Experience</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.experience ? `${teacher.experience} Years` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic & Professional Information */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Academic & Teaching Details</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-slate-400" /> Primary Subject</span>
              <span className="font-bold text-slate-900 dark:text-white">{teacher.subject || 'General'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400" /> Assigned Classes</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0 ? (
                  teacher.assignedClasses.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                      {typeof c === 'string' ? c : (c.class_name || c)}
                    </span>
                  ))
                ) : teacher.classAssigned ? (
                  teacher.classAssigned.split(',').map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                      {c.trim()}
                    </span>
                  ))
                ) : (
                  <span className="font-bold text-slate-400 text-xs italic">Unassigned</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><Award className="w-4 h-4 text-slate-400" /> Qualifications</span>
              <span className="font-bold text-slate-900 dark:text-white">{teacher.qualification || 'Bachelor Degree'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Joining Date</span>
              <span className="font-bold text-slate-900 dark:text-white">{teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Salary & Account Security Details */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Account & Payroll Details</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-400" /> Monthly Base Salary</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{teacher.salary ? `₹${Number(teacher.salary).toLocaleString()}` : 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> NFC Staff Card UID</span>
              <span className="font-mono font-bold text-primary-600">{teacher.nfc_card_uid || 'Unassigned'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500 font-medium">Portal Access Status</span>
              <Badge variant={teacher.status === 'active' ? 'success' : 'neutral'} className="font-bold">
                {teacher.status === 'active' ? 'Active Access' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
