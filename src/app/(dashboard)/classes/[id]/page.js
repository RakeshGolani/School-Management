'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Plus, 
  X, 
  Check, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  IdCard, 
  Wifi, 
  School, 
  Filter, 
  Calendar,
  Building2,
  AlertCircle,
  UserX,
  Info
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { SkeletonClassroomLayout } from '@/components/ui/Skeleton';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  getClassDetailsAction, 
  assignStudentToClassAction, 
  unassignStudentFromClassAction 
} from '@/actions/classActions';

// Student Dynamic Avatar Generator (Uses backend image_url, photo, or name-based initial avatar)
const getStudentAvatar = (student) => {
  if (!student) return 'https://ui-avatars.com/api/?name=Student&background=0284c7&color=fff&bold=true';
  if (student.image_url && typeof student.image_url === 'string' && student.image_url.trim() !== '') {
    return student.image_url;
  }
  if (student.photo && typeof student.photo === 'string' && student.photo.trim() !== '') {
    return student.photo;
  }
  const firstName = student.first_name || '';
  const lastName = student.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Student';
  const bg = student.gender === 'female' ? 'ec4899' : '0284c7';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=${bg}&color=fff&bold=true`;
};

export default function ClassDetailsPage({ params }) {
  // Unwrap params using React.use if needed or fallback
  const resolvedParams = use ? use(params) : params;
  const classId = resolvedParams?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  
  // Interactive States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  
  // Assign Student Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDeskIndex, setSelectedDeskIndex] = useState(null);
  const [studentToAssign, setStudentToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchClassDetails = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await getClassDetailsAction(classId);
      if (res.success && res.data) {
        setClassData(res.data.class || null);
        setUnassignedStudents(res.data.unassignedStudents || []);
      } else {
        notifyError(res.message || 'Failed to load class details');
      }
    } catch (err) {
      console.error('Error fetching class details:', err);
      notifyError('Class load karne me error aaya');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const handleOpenAssign = (deskIndex) => {
    setSelectedDeskIndex(deskIndex);
    setStudentToAssign('');
    setAssignModalOpen(true);
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!studentToAssign) {
      notifyError('Please select a student to assign');
      return;
    }

    setAssigning(true);
    try {
      const res = await assignStudentToClassAction(classId, studentToAssign);
      if (res.success) {
        notifySuccess('Student assigned to class successfully!');
        setAssignModalOpen(false);
        fetchClassDetails();
      } else {
        notifyError(res.message || 'Failed to assign student');
      }
    } catch (err) {
      console.error(err);
      notifyError('Error assigning student');
    } finally {
      setAssigning(false);
    }
  };

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  const handleUnassignStudent = (studentId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Unassign Student from Class',
      message: 'Are you sure you want to unassign this student from this class?',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await unassignStudentFromClassAction(classId, studentId);
          if (res.success) {
            notifySuccess('Student unassigned successfully');
            fetchClassDetails();
          } else {
            notifyError(res.message || 'Unassign failed');
          }
        } catch (err) {
          console.error(err);
          notifyError('Error unassigning student');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  if (loading) {
    return <SkeletonClassroomLayout />;
  }

  if (!classData) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Class Not Found</h2>
        <p className="text-slate-500 text-sm">The requested class & section details could not be loaded.</p>
        <Link href="/classes">
          <Button variant="primary" className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Classes
          </Button>
        </Link>
      </div>
    );
  }

  const capacity = classData.capacity || 40;
  const enrolledStudents = classData.students || [];
  const teacher = classData.classTeacher;

  // Filter students based on search and gender filter
  const filteredStudents = enrolledStudents.filter((st) => {
    const fullName = `${st.first_name || ''} ${st.last_name || ''}`.toLowerCase();
    const adm = (st.admission_number || '').toLowerCase();
    const matchesQuery = fullName.includes(searchQuery.toLowerCase()) || adm.includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === 'all' || st.gender === filterGender;
    return matchesQuery && matchesGender;
  });

  // Calculate desk grid slots up to Max Capacity
  const desks = Array.from({ length: capacity }, (_, index) => {
    const student = enrolledStudents[index] || null;
    return {
      seatNumber: index + 1,
      student
    };
  });

  const occupiedCount = enrolledStudents.length;
  const vacantCount = Math.max(0, capacity - occupiedCount);
  const occupancyRate = Math.round((occupiedCount / capacity) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* Navigation Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => router.push('/classes')}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
            title="Back to Class List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              <School className="w-4 h-4" /> Classroom Layout & Student Seating
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              {classData.class_name} - Section {classData.section}
              <Badge variant={classData.status === 'active' ? 'success' : 'neutral'} className="text-xs uppercase px-2.5 py-0.5">
                {classData.status}
              </Badge>
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Room Location: <strong className="text-slate-700 dark:text-slate-200">{classData.room_number ? `Room ${classData.room_number}` : 'Unassigned'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={fetchClassDetails} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => handleOpenAssign(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Assign Student
          </button>
        </div>
      </div>

      {/* Classroom Analytics Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary-500 bg-white dark:bg-slate-900 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Max Capacity Seats</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{capacity}</span>
            <BookOpen className="w-6 h-6 text-primary-500/80" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Seated / Enrolled</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{occupiedCount}</span>
            <Users className="w-6 h-6 text-emerald-500/80" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vacant Desks</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{vacantCount}</span>
            <GraduationCap className="w-6 h-6 text-amber-500/80" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{occupancyRate}%</span>
            <Building2 className="w-6 h-6 text-indigo-500/80" />
          </div>
        </Card>
      </div>

      {/* Classroom Seating Search & Filter Control Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Highlight student by name or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Gender:
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['all', 'male', 'female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFilterGender(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                    filterGender === g 
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-2xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* REALISTIC LIGHT THEME CLASSROOM GRAPHICAL CONTAINER */}
      <div className="bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-xs border-2 border-slate-200 dark:border-slate-800 relative overflow-hidden">
        {/* Ambient Floor Pattern & Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        {/* TOP CLASSROOM FRONT STAGE (BLACKBOARD & TEACHER TABLE) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-stretch">
          
          {/* BLACKBOARD (LEFT / CENTER STAGE) */}
          <div className="lg:col-span-8 bg-[#0f291e] border-8 border-[#5c3a21] rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[220px] text-emerald-100">
            {/* Blackboard Wooden Frame Glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-900/30"></div>
            
            <div className="flex items-center justify-between border-b border-emerald-700/50 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="font-mono text-emerald-300 font-bold tracking-widest text-xs sm:text-sm uppercase">
                  ✏️ CHALKBOARD - {classData.class_name.toUpperCase()} (SEC {classData.section})
                </h3>
              </div>
              <span className="font-mono text-xs text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60">
                ROOM #{classData.room_number || '101'}
              </span>
            </div>

            {/* Chalk Writing Content */}
            <div className="space-y-3 font-mono">
              <div className="text-xl sm:text-2xl font-black text-amber-200 tracking-wider">
                CLASS: {classData.class_name} - SECTION {classData.section}
              </div>
              <div className="text-xs sm:text-sm text-emerald-200 space-y-1">
                <p>👨‍🏫 Class Teacher: <strong className="text-white">{teacher ? teacher.name : 'Unassigned Teacher'}</strong></p>
                <p>📋 Subject: <strong className="text-white">{teacher?.subject || 'General Academics'}</strong></p>
                <p className="text-amber-200/90 italic pt-1">
                  "Thought of the day: Excellence is not an act, but a habit. Welcome to class!"
                </p>
              </div>
            </div>

            {/* Blackboard Bottom Chalk Tray */}
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-emerald-800/50 text-[11px] font-mono text-emerald-300/80">
              <div className="flex items-center gap-2">
                <span className="w-6 h-2 bg-white rounded-xs shadow-xs" title="Chalk"></span>
                <span className="w-4 h-2 bg-amber-200 rounded-xs shadow-xs" title="Yellow Chalk"></span>
                <span className="w-8 h-3 bg-[#4a2e1b] rounded-xs shadow-xs" title="Duster"></span>
              </div>
              <span>Total Seats: {capacity} | Seated: {occupiedCount}</span>
            </div>
          </div>

          {/* TEACHER TABLE & TEACHER DESK (LIGHT WOOD PODIUM CARD) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-amber-50/90 to-orange-50/60 dark:from-slate-900 dark:to-slate-800/80 border-2 border-amber-200/90 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-3 text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-800">
              Teacher Podium
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={teacher ? `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=059669&color=fff` : 'https://ui-avatars.com/api/?name=Teacher&background=e2e8f0&color=334155'}
                    alt="Teacher"
                    className="w-14 h-14 rounded-full border-2 border-amber-400 shadow-xs object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-amber-100 text-sm">{teacher ? teacher.name : 'No Teacher Assigned'}</h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">{teacher ? (teacher.subject || 'Head Class Teacher') : 'Position Vacant'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{teacher?.email || 'teacher@school.edu'}</p>
                </div>
              </div>
            </div>

            {/* Visual Wooden Desk Graphic */}
            <div className="mt-4 pt-3 border-t border-amber-200 dark:border-slate-700 bg-amber-100/70 dark:bg-slate-800 rounded-xl p-3 text-center border border-amber-200/80 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-center gap-3 text-amber-900 dark:text-amber-200 text-xs font-mono font-semibold">
                <span>💻 Laptop</span>
                <span>📚 Grade Book</span>
                <span>☕ Mug</span>
              </div>
              <div className="mt-1.5 text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                Teacher's Executive Desk & Chair
              </div>
            </div>
          </div>

        </div>

        {/* FRONT CLASSROOM AISLE / STAGE DIVIDER LINE */}
        <div className="relative flex items-center justify-center my-8">
          <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700 w-full"></div>
          <span className="absolute bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full shadow-2xs">
            ⬇️ STUDENT DESKS & SEATING AREA (FACING BLACKBOARD) ⬇️
          </span>
        </div>

        {/* STUDENT SEATING GRID (MAX CAPACITY DYNAMIC DESKS) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 relative z-10">
          {desks.map((desk, idx) => {
            const st = desk.student;
            const isMatch = st && (
              !searchQuery || 
              `${st.first_name} ${st.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (st.admission_number && st.admission_number.toLowerCase().includes(searchQuery.toLowerCase()))
            ) && (filterGender === 'all' || st.gender === filterGender);

            return (
              <div
                key={desk.seatNumber}
                className={`relative group rounded-xl p-2.5 transition-all duration-200 cursor-pointer border ${
                  st 
                    ? isMatch 
                      ? 'bg-white dark:bg-slate-900 border-emerald-400 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-500' 
                      : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-40 hover:opacity-100'
                    : 'bg-white/70 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 hover:-translate-y-0.5'
                }`}
                onClick={() => {
                  if (st) {
                    setSelectedStudent({ ...st, seatNumber: desk.seatNumber });
                    setStudentModalOpen(true);
                  } else {
                    handleOpenAssign(desk.seatNumber);
                  }
                }}
              >
                {/* Seat Number + Status dot */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    #{desk.seatNumber}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${st ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                </div>

                {st ? (
                  /* OCCUPIED STUDENT DESK */
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="relative">
                      <img
                        src={getStudentAvatar(st)}
                        alt={st.first_name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-xs group-hover:ring-2 group-hover:ring-emerald-400/30 transition-all"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 w-4 h-4 flex items-center justify-center">
                        {st.gender === 'female' ? '👩' : '👨'}
                      </span>
                    </div>
                    <div className="w-full">
                      <h4 className="font-bold text-[10px] text-slate-800 dark:text-white truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {st.first_name} {st.last_name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                        {st.admission_number || `#${st.id}`}
                      </p>
                    </div>
                    <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/30 rounded-md px-1.5 py-0.5 text-[8px] text-amber-700 dark:text-amber-400 font-semibold text-center">
                      🪑 Seated
                    </div>
                  </div>
                ) : (
                  /* VACANT DESK */
                  <div className="flex flex-col items-center justify-center text-center py-2.5 gap-1.5 text-slate-400 group-hover:text-primary-500 transition">
                    <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-primary-400 group-hover:bg-primary-50/50 transition">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary-600 leading-tight">Vacant</p>
                      <p className="text-[8px] text-slate-400 group-hover:text-primary-400">+ Assign</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* STUDENT DETAIL MODAL (WHEN CLICKING AN ASSIGNED STUDENT DESK) */}
      {studentModalOpen && selectedStudent && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setStudentModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-6 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-primary-50 text-primary-600 rounded-xl dark:bg-primary-950 dark:text-primary-400">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Student Seating Profile</h3>
                  <p className="text-xs text-slate-500">Class Desk #{selectedStudent.seatNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Student Avatar & Core Info */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <img
                src={getStudentAvatar(selectedStudent)}
                alt={selectedStudent.first_name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-500 shadow-md"
              />
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h4>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                  Admission No: {selectedStudent.admission_number || `STU-${selectedStudent.id}`}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="success" className="text-[10px] uppercase font-bold">
                    {selectedStudent.status || 'Active'}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-500 capitalize">
                    {selectedStudent.gender || 'male'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Attributes Grid */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-slate-400" /> NFC Card UID:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedStudent.nfc_card_uid || 'NFC-NOT-LINKED'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" /> Guardian / Parent:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedStudent.guardian_name || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> Parent Phone:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedStudent.guardian_phone || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold flex items-center gap-2">
                  <School className="w-4 h-4 text-slate-400" /> Assigned Grade & Section:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {classData.class_name} - {classData.section}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleUnassignStudent(selectedStudent.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/40 text-rose-700 hover:text-white dark:text-rose-400 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <UserX size={15} className="shrink-0" />
                <span>Unassign from Class</span>
              </button>
              <Link 
                href={`/students/${selectedStudent.id}`}
                className="flex-1"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-all shadow-md shadow-primary-600/20 cursor-pointer active:scale-95"
                >
                  <GraduationCap size={15} className="shrink-0" />
                  <span>View Full Profile</span>
                </button>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ASSIGN STUDENT TO DESK MODAL */}
      {assignModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setAssignModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-primary-50 text-primary-600 rounded-xl dark:bg-primary-950 dark:text-primary-400">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Assign Student to {classData.class_name} ({classData.section})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDeskIndex ? `Assigning to Desk #${selectedDeskIndex}` : 'Select student from available list'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Unassigned Student ({unassignedStudents.length} available)
                </label>
                <Select
                  value={studentToAssign}
                  onChange={(e) => setStudentToAssign(e.target.value)}
                  options={[
                    { label: '-- Select Student to Seat --', value: '' },
                    ...unassignedStudents.map((st) => ({
                      label: `${st.first_name} ${st.last_name} (Adm: ${st.admission_number || st.id}) - Grade ${st.grade || 'N/A'}`,
                      value: st.id.toString()
                    }))
                  ]}
                  searchable={true}
                />
              </div>

              {unassignedStudents.length === 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>No unassigned active students found. You can add new students from the Students Directory page.</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={assigning || !studentToAssign}
                >
                  {assigning ? 'Assigning...' : 'Confirm Seating Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={confirmModal.loading}
        type="danger"
        confirmText="Yes, Delete"
      />
    </div>
  );
}
