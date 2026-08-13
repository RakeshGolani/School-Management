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
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
  CalendarDays,
  UserCheck,
  BookOpen,
  School,
  Sparkles,
  Printer
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import StudentDetailsSkeleton from '@/components/skeletons/StudentDetailsSkeleton';
import StudentIdCardModal from '@/components/modals/StudentIdCardModal';
import { notifyError, notifySuccess } from '@/lib/notify';
import { getClassTimetableAction } from '@/actions/timetableActions';
import { getAttendanceAction } from '@/actions/attendanceActions';
import { getFeeAllocationsAction } from '@/actions/feeActions';

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id;

  const [student, setStudent] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  // Related Section states
  const [timetable, setTimetable] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState('MONDAY');

  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 100 });
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [feeAllocations, setFeeAllocations] = useState([]);
  const [feeSummary, setFeeSummary] = useState({ totalAllocated: 0, totalPaid: 0, totalPending: 0 });
  const [feesLoading, setFeesLoading] = useState(false);

  // Fetch Student Profile & All Sections on initial render
  useEffect(() => {
    if (!studentId) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/students/${studentId}`, { cache: 'no-store' });
        const resData = await res.json();
        const studentInfo = resData.data || resData;

        if (studentInfo && (studentInfo.id || studentInfo.first_name)) {
          setStudent(studentInfo);

          // Fetch School Profile for Logo & Name
          const targetSchoolId = studentInfo.school_id || studentInfo.schoolId || 1;
          fetch(`${apiUrl}/school/profile?schoolId=${targetSchoolId}`, { cache: 'no-store' })
            .then(sRes => sRes.json())
            .then(sData => {
              if (sData?.success && sData.data) setSchoolInfo(sData.data);
            })
            .catch(err => console.error('Error loading school info:', err));

          // Trigger parallel section fetches once student is retrieved
          if (studentInfo.class_id) {
            setTimetableLoading(true);
            getClassTimetableAction(studentInfo.class_id)
              .then(ttRes => {
                if (ttRes?.success) setTimetable(ttRes.data || []);
              })
              .finally(() => setTimetableLoading(false));
          }

          setAttendanceLoading(true);
          getAttendanceAction({ entity_type: 'STUDENT' })
            .then(attRes => {
              if (attRes?.success && attRes.data?.records) {
                const studentRecords = attRes.data.records.filter(r => r.id === studentInfo.id || r.student_id === studentInfo.id);
                setAttendanceLogs(studentRecords);

                const present = studentRecords.filter(r => r.status === 'present').length;
                const absent = studentRecords.filter(r => r.status === 'absent').length;
                const late = studentRecords.filter(r => r.status === 'late').length;
                const total = studentRecords.length || 1;
                const pct = Math.round(((present + late * 0.5) / total) * 100);

                setAttendanceSummary({ present, absent, late, total: studentRecords.length, percentage: pct });
              }
            })
            .finally(() => setAttendanceLoading(false));

          setFeesLoading(true);
          getFeeAllocationsAction({ limit: 100 })
            .then(feeRes => {
              if (feeRes?.success) {
                const studentFees = (feeRes.data || []).filter(f => f.student_id === studentInfo.id);
                setFeeAllocations(studentFees);

                let allocated = 0;
                let paid = 0;
                studentFees.forEach(f => {
                  const amt = Number(f.amount || f.feeCategory?.amount || 0);
                  allocated += amt;
                  if (f.status === 'PAID') paid += amt;
                });
                setFeeSummary({
                  totalAllocated: allocated,
                  totalPaid: paid,
                  totalPending: allocated - paid
                });
              }
            })
            .finally(() => setFeesLoading(false));

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

    fetchAllData();
  }, [studentId]);

  // Premium Page Skeleton Loader
  if (loading) {
    return <StudentDetailsSkeleton />;
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
  const classDisplayName = student.schoolClass 
    ? `${student.schoolClass.class_name} - ${student.schoolClass.section}`
    : (student.grade ? `Grade ${student.grade}` : 'Unassigned Class');
  const classTeacher = student.schoolClass?.classTeacher;

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayTimetable = timetable.filter(t => t.day_of_week === selectedDay);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/students')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>

        <div className="flex items-center gap-3">
          <Badge variant={student.status === 'active' ? 'success' : 'neutral'} className="px-3 py-1 text-xs font-extrabold uppercase">
            {student.status || 'Active'}
          </Badge>
          <Button 
            variant="primary" 
            icon={Printer}
            onClick={() => setIdCardModalOpen(true)}
            className="shadow-sm font-extrabold"
          >
            Print Student ID Card
          </Button>
        </div>
      </div>

      {/* Main Student Banner Card */}
      <Card className="p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Photo */}
          {(() => {
            const studentPhoto = student.image_url || student.photo;
            const hasPhoto = studentPhoto && !studentPhoto.includes('ui-avatars.com');
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
                      src={studentPhoto} 
                      alt={fullName} 
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl z-10" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
                {student.nfc_card_uid && (
                  <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md z-20" title="NFC Card Assigned">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            );
          })()}

          {/* Student General Information */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{fullName}</h1>
                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5 flex items-center justify-center md:justify-start gap-1.5">
                  <span>Admission No:</span>
                  <span className="font-extrabold px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/60 border border-primary-200/60 dark:border-primary-800 text-primary-700 dark:text-primary-300">
                    {student.admission_number || `ADM-${student.id}`}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-primary-600 text-white font-extrabold text-xs shadow-2xs flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  {classDisplayName}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                  Roll No: {student.rollNumber || student.roll_number || 'N/A'}
                </span>
              </div>
            </div>

            {/* General Info Row */}
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
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Smart Bus Service</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-primary-600" />
                  {student.is_bus_service_enabled ? 'Active Transport' : 'Not Subscribed'}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">NFC Hardware UID</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{student.nfc_card_uid || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* SINGLE PAGE ALL-IN-ONE LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT & CENTER COLUMN (Main Sections) */}
        <div className="lg:col-span-2 space-y-6">

          {/* SECTION 1: CLASSROOM & CLASS TEACHER DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Classroom Info */}
            <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-primary-600" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Classroom Info</h3>
                </div>
                <Badge variant="primary" className="font-bold">{classDisplayName}</Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500 font-medium">Class Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.schoolClass?.class_name || student.grade || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500 font-medium">Section</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.schoolClass?.section || student.section || 'A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500 font-medium">Classroom No.</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.schoolClass?.room_number || student.schoolClass?.roomNumber || 'Room 101'}</span>
                </div>
              </div>
            </Card>

            {/* Class Teacher Info */}
            <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <GraduationCap className="w-5 h-5 text-primary-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Class Teacher</h3>
              </div>
              {classTeacher ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200/80 dark:border-primary-800 flex items-center justify-center font-black text-primary-600 dark:text-primary-400 text-sm shrink-0">
                      {classTeacher.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{classTeacher.name}</h4>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Class In-charge Teacher</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> Email</span>
                    <span className="font-bold text-slate-900 dark:text-white">{classTeacher.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> Phone</span>
                    <span className="font-bold text-slate-900 dark:text-white">{classTeacher.phone || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 font-medium">
                  No class teacher assigned to this section.
                </div>
              )}
            </Card>
          </div>

          {/* SECTION 2: CLASS PERIOD TIMETABLE MATRIX */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Class Period Timetable
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Weekly period allocations for {classDisplayName}</p>
              </div>

              {/* Day Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedDay === day 
                        ? 'bg-primary-600 text-white shadow-xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {timetableLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton height={80} className="w-full rounded-xl" />
                <Skeleton height={80} className="w-full rounded-xl" />
                <Skeleton height={80} className="w-full rounded-xl" />
              </div>
            ) : dayTimetable.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dayTimetable.map((slot, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-black text-xs">
                        Period {slot.periodSlot?.period_number || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {slot.periodSlot ? `${slot.periodSlot.start_time} - ${slot.periodSlot.end_time}` : 'Slot Time'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{slot.subject_name}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                      <span>Teacher: <strong>{slot.teacher?.name || 'Assigned Teacher'}</strong></span>
                      <span>{slot.room_number || 'Room Default'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-500 font-bold text-sm">No periods scheduled for {selectedDay}</p>
                <p className="text-xs text-slate-400 mt-1">Select another day tab above to view class periods.</p>
              </div>
            )}
          </Card>

          {/* SECTION 3: ATTENDANCE RECORD & HISTORY */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Attendance Summary & Log History
              </h3>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                Rate: {attendanceSummary.percentage}%
              </span>
            </div>

            {/* Attendance Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Present</span>
                <p className="text-xl font-black text-emerald-600">{attendanceSummary.present}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Absent</span>
                <p className="text-xl font-black text-rose-600">{attendanceSummary.absent}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Late</span>
                <p className="text-xl font-black text-amber-600">{attendanceSummary.late}</p>
              </div>
            </div>

            {attendanceLoading ? (
              <div className="space-y-2">
                <Skeleton height={36} className="w-full rounded-lg" />
                <Skeleton height={36} className="w-full rounded-lg" />
              </div>
            ) : attendanceLogs.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceLogs.slice(0, 5).map((log, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.date || 'Recent Date'}</span>
                      {log.remarks && <p className="text-xs text-slate-400">{log.remarks}</p>}
                    </div>
                    <Badge variant={log.status === 'present' ? 'success' : (log.status === 'absent' ? 'danger' : 'warning')}>
                      {log.status?.toUpperCase() || 'PRESENT'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 font-medium text-xs">
                No recent attendance logs recorded.
              </div>
            )}
          </Card>

          {/* SECTION 4: FEES & BILLING SUMMARY */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Fees & Billing Allocations
              </h3>
              <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
                Due: ₹{feeSummary.totalPending.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Fee</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">₹{feeSummary.totalAllocated.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30">
                <span className="text-xs text-emerald-600 font-bold uppercase">Total Paid</span>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">₹{feeSummary.totalPaid.toLocaleString()}</p>
              </div>
            </div>

            {feesLoading ? (
              <div className="space-y-2">
                <Skeleton height={40} className="w-full rounded-lg" />
                <Skeleton height={40} className="w-full rounded-lg" />
              </div>
            ) : feeAllocations.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {feeAllocations.map((item, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white">{item.feeCategory?.name || 'School Fee'}</span>
                      <span className="block text-xs text-slate-400">Due: {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 dark:text-white">₹{Number(item.amount || item.feeCategory?.amount || 0).toLocaleString()}</span>
                      <Badge variant={item.status === 'PAID' ? 'success' : 'danger'}>
                        {item.status || 'PENDING'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 font-medium text-xs">
                No fee allocations found for this student.
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN (Guardian Info & Smart Bus/NFC Sidebar) */}
        <div className="space-y-6">

          {/* GUARDIAN & CONTACT DETAILS */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Guardian Contacts</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Guardian Name</span>
                <p className="font-bold text-slate-900 dark:text-white">{student.guardian_name || student.parent?.name || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> Guardian Email</span>
                <p className="font-bold text-slate-900 dark:text-white">{student.guardian_email || student.parent?.email || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> Primary Phone</span>
                <p className="font-bold text-slate-900 dark:text-white">{student.guardian_phone || student.parent?.phone || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> Alternate Phone</span>
                <p className="font-bold text-slate-900 dark:text-white">{student.alternate_phone || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* SMART BUS & NFC ACCESS */}
          <Card className="p-6 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Bus className="w-5 h-5 text-primary-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Smart Bus & Hardware</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Bus Status</span>
                <Badge variant={student.is_bus_service_enabled ? 'success' : 'neutral'} className="font-bold">
                  {student.is_bus_service_enabled ? 'Active Transport' : 'Not Subscribed'}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Bus Route</span>
                <p className="font-bold text-slate-900 dark:text-white">{student.busRoute?.route_name || student.bus_route_id || 'Unassigned'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Bus Stop Station</span>
                <p className="font-bold text-slate-900 dark:text-white">{student.busStop?.stop_name || student.bus_stop_id || 'Unassigned'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-slate-400" /> NFC Hardware UID</span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{student.nfc_card_uid || 'Unassigned Card'}</p>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Printable ID Card Modal */}
      <StudentIdCardModal
        isOpen={idCardModalOpen}
        onClose={() => setIdCardModalOpen(false)}
        student={student}
        schoolInfo={schoolInfo}
      />
    </div>
  );
}
