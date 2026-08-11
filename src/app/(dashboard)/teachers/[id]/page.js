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
  CheckCircle2,
  History,
  Building,
  Clock,
  ExternalLink,
  Edit3
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { notifyError, notifySuccess } from '@/lib/notify';

export default function TeacherDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params?.id;

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading teacher profile...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto my-12">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Teacher Profile Not Found</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">The requested teacher profile could not be retrieved or does not exist.</p>
        <Button onClick={() => router.push('/teachers')} className="mx-auto">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Staff Directory
        </Button>
      </div>
    );
  }

  const fullName = teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Teacher Profile';
  const assignmentHistory = teacher.assignmentHistory || [];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Navigation & Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.push('/teachers')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teachers</span>
        </button>

        <div className="flex items-center gap-3">
          <Badge 
            variant={teacher.status === 'active' ? 'success' : 'neutral'} 
            className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-xs"
          >
            ● {teacher.status || 'Active'} Staff
          </Badge>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-3xl bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Subtle Decorative Background Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Avatar Photo Frame */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-indigo-500 to-primary-600 text-white border-4 border-white dark:border-slate-800 flex items-center justify-center text-4xl font-black shadow-xl overflow-hidden">
              {teacher.photo ? (
                <img src={teacher.photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
            {teacher.nfcCardUid && (
              <div 
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-2 border-white dark:border-slate-900 flex items-center gap-1 text-[11px] font-extrabold px-2.5" 
                title={`NFC UID: ${teacher.nfcCardUid}`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>NFC</span>
              </div>
            )}
          </div>

          {/* Core Info Summary */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{fullName}</h1>
                </div>
                <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1 flex items-center justify-center lg:justify-start gap-2">
                  <span>Employee ID:</span> 
                  <span className="font-extrabold bg-primary-50 dark:bg-primary-950/60 px-2.5 py-0.5 rounded-lg border border-primary-200 dark:border-primary-800">
                    {teacher.employeeId || `EMP-${teacher.id}`}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200/60 dark:border-indigo-800">
                  📚 {teacher.subject || 'Faculty Member'}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs border border-slate-200/60 dark:border-slate-700">
                  🏫 Current Class: {teacher.classAssigned || 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Quick Info Grid Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Email Address</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{teacher.email || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Phone Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.phone || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Qualification</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.qualification || 'Bachelor Degree'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{teacher.gender || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Academic History</span>
          {assignmentHistory.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-white/20 dark:bg-slate-700/60 font-bold">
              {assignmentHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic & Teaching Details Card */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl space-y-5 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Academic & Teaching Profile</h3>
                  <p className="text-xs text-slate-500 font-medium">Assigned subjects and current responsibilities</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Primary Subject
                  </span>
                  <p className="font-extrabold text-base text-slate-900 dark:text-white">{teacher.subject || 'General Faculty'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-500" /> Educational Qualification
                  </span>
                  <p className="font-extrabold text-base text-slate-900 dark:text-white">{teacher.qualification || 'Post Graduate / Degree'}</p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Current Assigned Classes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0 ? (
                      teacher.assignedClasses.map((c, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-100/80 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800">
                          Class {typeof c === 'string' ? c : (c.class_name || c)}
                        </span>
                      ))
                    ) : teacher.classAssigned ? (
                      teacher.classAssigned.split(',').map((c, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-100/80 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800">
                          Class {c.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="font-bold text-slate-400 text-xs italic">No current class assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Account & Hardware Cards */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl space-y-5 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Staff Credential & Access Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Smart NFC credentials and employment record</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> NFC Card Identification UID
                  </span>
                  <p className="font-mono font-black text-base text-primary-600 dark:text-primary-400">
                    {teacher.nfcCardUid || 'No NFC Card Paired'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> System Registration Date
                  </span>
                  <p className="font-bold text-base text-slate-900 dark:text-white">
                    {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar Stats & Contact Card */}
          <div className="space-y-6">
            {/* Quick Contact Card */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl space-y-4 bg-white dark:bg-slate-900">
              <h4 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-600" /> Direct Contact Info
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Email</span>
                    <a href={`mailto:${teacher.email}`} className="font-bold text-slate-800 dark:text-slate-200 truncate block hover:underline">
                      {teacher.email || 'N/A'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone</span>
                    <a href={`tel:${teacher.phone}`} className="font-bold text-slate-800 dark:text-slate-200 block hover:underline">
                      {teacher.phone || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            {/* Employment Status Badge Card */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl bg-gradient-to-br from-indigo-600 to-primary-700 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 font-extrabold text-xs uppercase tracking-wider">Status Overview</span>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-xl font-black">{teacher.status === 'active' ? 'Active Faculty Staff' : 'Inactive Staff'}</h3>
              <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                Registered staff member in active school database with class and academic allocation capabilities.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC HISTORY */}
      {activeTab === 'history' && (
        <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl bg-white dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-6 h-6 text-primary-600" /> Academic Session Assignments History
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Complete timeline of classes and academic years assigned to {fullName}
              </p>
            </div>
          </div>

          {assignmentHistory.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-primary-200 dark:border-primary-900 space-y-6 my-4">
              {assignmentHistory.map((item, index) => (
                <div key={index} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-slate-900 shadow-sm group-hover:scale-125 transition" />

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2 hover:border-primary-300 dark:hover:border-primary-700 transition">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-black text-xs">
                        📅 {item.academicYearName || 'Academic Session'}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        Record ID: #{item.id}
                      </span>
                    </div>

                    <div className="pt-2">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        Assigned Class: <span className="text-indigo-600 dark:text-indigo-400">{item.className}</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Teacher was allocated to handle subject / class teacher duties for this session.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <Building className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No Past History Records Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No session assignment records registered yet for this teacher in previous academic years.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

