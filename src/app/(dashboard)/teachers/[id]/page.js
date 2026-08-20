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
  Edit3,
  Printer
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import TeacherDetailsSkeleton from '@/components/skeletons/TeacherDetailsSkeleton';
import TeacherIdCardModal from '@/components/modals/TeacherIdCardModal';
import { notifyError, notifySuccess } from '@/lib/notify';
import { getTeacherTimetableAction } from '@/actions/timetableActions';

export default function TeacherDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params?.id;

  const [teacher, setTeacher] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherAndData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
        const res = await fetch(`${apiUrl}/teachers/${teacherId}`, { cache: 'no-store' });
        const resData = await res.json();
        const teacherInfo = resData.data || resData;

        if (teacherInfo && (teacherInfo.id || teacherInfo.name || teacherInfo.first_name)) {
          setTeacher(teacherInfo);

          // Fetch School Profile for Logo & Name
          const targetSchoolId = teacherInfo.school_id || teacherInfo.schoolId || 1;
          fetch(`${apiUrl}/profile?schoolId=${targetSchoolId}`, { cache: 'no-store' })
            .then(sRes => sRes.json())
            .then(sData => {
              if (sData?.success && sData.data) setSchoolInfo(sData.data);
            })
            .catch(err => console.error('Error loading school info:', err));

          // Fetch Teacher Timetable Allocations
          setTimetableLoading(true);
          getTeacherTimetableAction(teacherInfo.id)
            .then(ttRes => {
              if (ttRes?.success) setTimetable(ttRes.data || []);
            })
            .finally(() => setTimetableLoading(false));

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

    fetchTeacherAndData();
  }, [teacherId]);

  if (loading) {
    return <TeacherDetailsSkeleton />;
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
  const assignedClasses = teacher.class_assigned || teacher.classAssigned || 'N/A';
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayTimetable = timetable.filter(t => t.day_of_week === selectedDay);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fadeIn text-xs sm:text-sm">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/teachers')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Staff Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <Badge variant={teacher.status === 'active' ? 'success' : 'neutral'} className="px-3 py-1 text-xs font-extrabold uppercase">
            {teacher.status || 'Active'}
          </Badge>
          <Button 
            variant="primary" 
            icon={Printer}
            onClick={() => setIdCardModalOpen(true)}
            className="shadow-sm font-extrabold"
          >
            Print Teacher ID Card
          </Button>
        </div>
      </div>

      {/* Main Teacher Banner Card */}
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Photo */}
          {(() => {
            const teacherPhoto = teacher.image_url || teacher.photo;
            const hasPhoto = teacherPhoto && !teacherPhoto.includes('ui-avatars.com');
            return (
              <div className="relative">
                <div 
                  className="w-28 h-28 rounded-2xl border-2 border-primary-500/30 shadow-md flex items-center justify-center overflow-hidden relative"
                  style={{
                    backgroundColor: 'var(--theme-primary-50)',
                    color: 'var(--theme-primary-500)'
                  }}
                >
                  <span className="text-4xl font-black">{fullName.charAt(0).toUpperCase()}</span>
                  {hasPhoto && (
                    <img 
                      src={teacherPhoto} 
                      alt={fullName} 
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl z-10" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>
            );
          })()}

          {/* Teacher Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{fullName}</h1>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5 flex items-center justify-center md:justify-start gap-1.5">
                  <span>Subject / Faculty:</span>
                  <span className="font-extrabold px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800 text-primary-700 dark:text-primary-300">
                    {teacher.subject || 'General Faculty'}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-primary-600 text-white font-extrabold text-xs shadow-2xs flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Emp ID: {teacher.employee_id || `EMP-${teacher.id}`}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                  {teacher.qualification || 'Senior Faculty'}
                </span>
              </div>
            </div>

            {/* General Info Row */}
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
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Assigned Class</span>
                <span className="font-extrabold text-primary-600 dark:text-primary-400">{assignedClasses}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Joining Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Single Page Grid Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Column Main Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Assigned Classes & Subject Master */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Academic Specialization</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Primary Subject</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{teacher.subject || 'Faculty'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Qualification</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{teacher.qualification || 'Degree Certified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Teaching Experience</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.experience_years ? `${teacher.experience_years} Years` : '5+ Years'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Class Allocations</h3>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Class In-charge</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{assignedClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{teacher.department || 'Academics'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Employment Type</span>
                  <span className="font-extrabold text-emerald-600 uppercase">{teacher.employment_type || 'Full Time'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Section 2: Teaching Period Timetable Matrix */}
          <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Weekly Teaching Schedule</h3>
                  <p className="text-xs text-slate-500">Period allocations & room schedule for {teacher.name}</p>
                </div>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      selectedDay === day 
                        ? 'bg-primary-600 text-white shadow-2xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {timetableLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading period allocations...</div>
            ) : dayTimetable.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No period scheduled for {selectedDay}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Select another day tab above to view scheduled lectures.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dayTimetable.map((period, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-primary-700 dark:text-primary-300">
                      <span>Period {period.period_number || idx + 1}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {period.start_time || '09:00'} - {period.end_time || '09:45'}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{period.subject || teacher.subject}</p>
                    <p className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-primary-100/60 dark:border-primary-900/40">
                      <span>Class: {period.schoolClass?.class_name}-{period.schoolClass?.section || 'A'}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{period.room_number || 'Room 101'}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Section 3: Academic Session History */}
          <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Academic Session History</h3>
                  <p className="text-xs text-slate-500">Historical class teacher assignments & session records</p>
                </div>
              </div>
              <Badge variant="neutral" className="text-xs font-bold">
                {teacher.academicSessionHistory?.length || (teacher.classAssigned ? 1 : 0)} Sessions
              </Badge>
            </div>

            {(!teacher.academicSessionHistory || teacher.academicSessionHistory.length === 0) && !teacher.classAssigned ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No session history records found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Faculty session assignment history will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(teacher.academicSessionHistory && teacher.academicSessionHistory.length > 0
                  ? teacher.academicSessionHistory
                  : [{ className: teacher.classAssigned || 'N/A', academicYearName: '2026-2027' }]
                ).map((session, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-950 dark:text-primary-300 dark:border-primary-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Session: {session.academicYearName || '2026-2027'}
                      </span>
                      <Badge variant="success" className="text-[10px] uppercase font-bold">
                        Assigned
                      </Badge>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Class In-charge</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {session.className || 'General Faculty'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Role</span>
                        <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
                          Class Teacher
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          
          {/* Contact Details Card */}
          <Card className="p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Phone className="w-5 h-5 text-primary-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Contact Information</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span>
                <p className="font-bold text-slate-900 dark:text-white truncate">{teacher.email || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Primary Phone</span>
                <p className="font-bold text-slate-900 dark:text-white">{teacher.phone || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Residential Address</span>
                <p className="font-bold text-slate-900 dark:text-white">{teacher.address || 'Not specified'}</p>
              </div>
            </div>
          </Card>

          {/* Account & Security Details */}
          <Card className="p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Security & Status</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Status</span>
                <Badge variant={teacher.status === 'active' ? 'success' : 'neutral'} className="font-bold">
                  {teacher.status || 'Active'}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Faculty Verified</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Printable Teacher ID Card Modal */}
      <TeacherIdCardModal
        isOpen={idCardModalOpen}
        onClose={() => setIdCardModalOpen(false)}
        teacher={teacher}
        schoolInfo={schoolInfo}
      />
    </div>
  );
}

