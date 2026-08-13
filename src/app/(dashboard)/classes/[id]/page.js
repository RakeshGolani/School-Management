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
import { useAcademicYear } from '@/context/AcademicYearContext';
import { 
  getClassDetailsAction, 
  getClassesAction,
  updateClassAction,
  assignStudentToClassAction, 
  unassignStudentFromClassAction 
} from '@/actions/classActions';
import { getTeachersAction } from '@/actions/teacherActions';
import { promoteStudentsAction } from '@/actions/studentActions';
import PromoteStudentsModal from '@/components/modals/PromoteStudentsModal';
import BatchStudentIdCardModal from '@/components/modals/BatchStudentIdCardModal';

// Student Dynamic Avatar Generator
const getStudentAvatar = (student) => {
  if (!student) return null;
  const rawPath = student.image_url || student.photo;
  if (rawPath && typeof rawPath === 'string' && rawPath.trim() !== '' && !rawPath.includes('ui-avatars.com')) {
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('data:image')) return rawPath;
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}${cleanPath}`;
  }
  return null;
};

export default function ClassDetailsPage({ params }) {
  // Unwrap params using React.use if needed or fallback
  const resolvedParams = use ? use(params) : params;
  const classId = resolvedParams?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  
  // Academic Session Context
  const { academicYears, activeYear } = useAcademicYear();

  // Promote Modal State
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [targetYearId, setTargetYearId] = useState('');
  const [bulkTargetGrade, setBulkTargetGrade] = useState('');
  const [classListOptions, setClassListOptions] = useState([]);
  const [promotionList, setPromotionList] = useState([]);
  const [submittingPromotion, setSubmittingPromotion] = useState(false);
  const [promotionResult, setPromotionResult] = useState(null);

  // Fetch available classes for target grade options
  useEffect(() => {
    async function loadAllClasses() {
      const res = await getClassesAction();
      if (res.success && Array.isArray(res.data)) {
        const opts = res.data.map(c => ({
          label: `${c.class_name || c.className} - ${c.section}`,
          value: `${c.class_name || c.className}-${c.section}`
        }));
        setClassListOptions(opts);
      }
    }
    loadAllClasses();
  }, []);

  const handleOpenClassPromoteModal = () => {
    if (!classData || !Array.isArray(classData.students) || classData.students.length === 0) {
      notifyError('No enrolled students in this class to promote.');
      return;
    }

    const currentClassName = `${classData.class_name}-${classData.section}`;
    
    // Build initial promotion list from current enrolled class students
    const list = classData.students.map(s => ({
      student_id: s.id,
      student_name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
      admission_number: s.admission_number || `ADM-${s.id}`,
      current_grade: currentClassName,
      current_section: classData.section,
      new_grade: currentClassName,
      new_section: classData.section,
      status: 'PROMOTED',
      checked: true
    }));

    setPromotionList(list);
    setTargetYearId('');
    setBulkTargetGrade('');
    setPromotionResult(null);
    setPromoteModalOpen(true);
  };

  const handleToggleStudent = (studentId, checked) => {
    setPromotionList(prev => prev.map(s => s.student_id === studentId ? { ...s, checked } : s));
  };

  const handlePromotionFieldChange = (studentId, field, value) => {
    setPromotionList(prev => prev.map(s => s.student_id === studentId ? { ...s, [field]: value } : s));
  };

  const handleSubmitClassPromotion = async () => {
    if (!targetYearId) {
      notifyError('Please select a target academic session.');
      return;
    }

    const selectedStudents = promotionList.filter(s => s.checked);
    if (selectedStudents.length === 0) {
      notifyError('Please select at least one student to promote.');
      return;
    }

    setSubmittingPromotion(true);
    try {
      const payload = {
        from_academic_year_id: activeYear?.id || 1,
        to_academic_year_id: targetYearId,
        students: selectedStudents.map(s => ({
          student_id: s.student_id,
          new_grade: s.new_grade,
          new_section: s.new_section,
          status: s.status
        }))
      };

      const res = await promoteStudentsAction(payload);
      if (res.success) {
        notifySuccess(res.message || 'Students promoted successfully!');
        setPromotionResult(res.data);
        fetchClassDetails();
      } else {
        notifyError(res.message || 'Failed to promote students');
      }
    } catch (err) {
      console.error(err);
      notifyError('Error executing class promotion');
    } finally {
      setSubmittingPromotion(false);
    }
  };

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

  // Assign Class Teacher Modal State
  const [assignTeacherModalOpen, setAssignTeacherModalOpen] = useState(false);
  const [teacherToAssign, setTeacherToAssign] = useState('');
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const [availableUnassignedTeachers, setAvailableUnassignedTeachers] = useState([]);

  // Batch Print ID Cards States
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState(null);

  useEffect(() => {
    // Fetch School Profile for Logo & Name in batch print preview
    const targetSchoolId = 1;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/school/profile?schoolId=${targetSchoolId}`, { cache: 'no-store' })
      .then(sRes => sRes.json())
      .then(sData => {
        if (sData?.success && sData.data) setSchoolInfo(sData.data);
      })
      .catch(err => console.error('Error loading school info:', err));
  }, []);

  const handleOpenAssignTeacherModal = async () => {
    try {
      // Fetch all teachers and all classes to filter only unassigned teachers
      const [tRes, cRes] = await Promise.all([
        getTeachersAction({ limit: 100 }),
        getClassesAction()
      ]);

      let allTeachers = [];
      if (tRes && tRes.success && Array.isArray(tRes.data)) {
        allTeachers = tRes.data;
      } else if (Array.isArray(tRes)) {
        allTeachers = tRes;
      } else if (tRes?.data && Array.isArray(tRes.data)) {
        allTeachers = tRes.data;
      }

      let allClasses = [];
      if (cRes && cRes.success && Array.isArray(cRes.data)) {
        allClasses = cRes.data;
      } else if (Array.isArray(cRes)) {
        allClasses = cRes;
      } else if (cRes?.data && Array.isArray(cRes.data)) {
        allClasses = cRes.data;
      }

      // Extract IDs of teachers currently assigned to any class
      const assignedIds = allClasses
        .filter(c => c && c.class_teacher_id)
        .map(c => c.class_teacher_id.toString());

      // Filter only unassigned teachers
      const freeTeachers = allTeachers.filter(t => t && t.id && !assignedIds.includes(t.id.toString()));
      setAvailableUnassignedTeachers(freeTeachers);
      setTeacherToAssign('');
      setAssignTeacherModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch available teachers:', err);
      notifyError('Failed to load available unassigned teachers');
    }
  };

  const handleAssignTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!teacherToAssign) {
      notifyError('Please select a teacher to assign');
      return;
    }

    setAssigningTeacher(true);
    try {
      const payload = {
        class_name: classData.class_name,
        section: classData.section,
        class_teacher_id: teacherToAssign,
        room_number: classData.room_number,
        capacity: classData.capacity,
        status: classData.status || 'active'
      };

      const res = await updateClassAction(classId, payload);
      if (res.success) {
        notifySuccess('Class teacher assigned successfully!');
        setAssignTeacherModalOpen(false);
        fetchClassDetails();
      } else {
        notifyError(res.message || 'Failed to assign class teacher');
      }
    } catch (err) {
      console.error(err);
      notifyError('Error assigning class teacher');
    } finally {
      setAssigningTeacher(false);
    }
  };

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
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fadeIn text-xs sm:text-sm">
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

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            type="button"
            onClick={() => handleOpenClassPromoteModal()} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs transition cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" /> Promote Class Students
          </button>
          <button 
            type="button"
            onClick={fetchClassDetails} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setBatchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 font-bold text-xs transition cursor-pointer"
            disabled={!classData || !classData.students || classData.students.length === 0}
          >
            <IdCard className="w-4 h-4" /> Print ID Cards
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

        <Card className="p-4 border-l-4 border-l-primary-500 bg-white dark:bg-slate-900 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Seated / Enrolled</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-primary-600 dark:text-primary-400">{occupiedCount}</span>
            <Users className="w-6 h-6 text-primary-500/80" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vacant Desks</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{vacantCount}</span>
            <GraduationCap className="w-6 h-6 text-amber-500/80" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary-500 bg-white dark:bg-slate-900 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-primary-600 dark:text-primary-400">{occupancyRate}%</span>
            <Building2 className="w-6 h-6 text-primary-500/80" />
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
            <div className="absolute top-2 right-3 flex items-center gap-1.5">
              {teacher ? (
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-800">
                  Teacher Podium
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAssignTeacherModal}
                  className="text-[10px] font-extrabold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded-lg border border-primary-500 shadow-2xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={12} /> Assign Class Teacher
                </button>
              )}
            </div>

            <div className="space-y-3 relative z-10 pt-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-2xl border-2 border-primary-500/30 shadow-xs flex items-center justify-center font-black text-xl shrink-0 overflow-hidden relative"
                  style={{
                    backgroundColor: 'var(--theme-primary-50)',
                    color: 'var(--theme-primary-500)'
                  }}
                >
                  {teacher?.image_url && !teacher.image_url.includes('ui-avatars.com') ? (
                    <img
                      src={teacher.image_url}
                      alt={teacher.name}
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  <span>{teacher?.name ? teacher.name[0].toUpperCase() : 'T'}</span>
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${teacher ? 'bg-primary-500' : 'bg-slate-300'} border-2 border-white dark:border-slate-900 rounded-full z-20`}></span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-amber-100 text-sm">{teacher ? teacher.name : 'No Teacher Assigned'}</h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">{teacher ? (teacher.subject || 'Head Class Teacher') : 'Position Vacant'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{teacher?.email || 'Click Assign Button Above'}</p>
                </div>
              </div>
            </div>

            {/* Visual Wooden Desk Graphic */}
            <div className="mt-4 pt-3 border-t border-amber-200 dark:border-slate-700 bg-amber-100/70 dark:bg-slate-800 rounded-xl p-3 text-center border border-amber-200/80 dark:border-slate-700 shadow-2xs">
              {teacher ? (
                <>
                  <div className="flex items-center justify-center gap-3 text-amber-900 dark:text-amber-200 text-xs font-mono font-semibold">
                    <span>💻 Laptop</span>
                    <span>📚 Grade Book</span>
                    <span>☕ Mug</span>
                  </div>
                  <div className="mt-1.5 text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                    Teacher's Executive Desk & Chair
                  </div>
                </>
              ) : (
                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleOpenAssignTeacherModal}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-200/70 hover:bg-amber-300/80 text-amber-900 font-extrabold text-xs transition border border-amber-300 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Assign Class Teacher Now
                  </button>
                </div>
              )}
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
                      ? 'bg-white dark:bg-slate-900 border-primary-500/40 dark:border-primary-800 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-primary-500 hover:ring-2 hover:ring-primary-500/20' 
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
                  <span className={`w-1.5 h-1.5 rounded-full ${st ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                </div>

                {st ? (
                  /* OCCUPIED STUDENT DESK */
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="relative">
                      <div 
                        className="w-10 h-10 rounded-xl border-2 border-primary-500/30 shadow-xs flex items-center justify-center font-black text-xs shrink-0 overflow-hidden relative"
                        style={{
                          backgroundColor: 'var(--theme-primary-50)',
                          color: 'var(--theme-primary-500)'
                        }}
                      >
                        <span className="font-black text-xs">{st.first_name?.[0]?.toUpperCase() || 'S'}</span>
                        {getStudentAvatar(st) ? (
                          <img
                            src={getStudentAvatar(st)}
                            alt={st.first_name}
                            className="absolute inset-0 w-full h-full object-cover rounded-xl z-10"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : null}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 w-4 h-4 flex items-center justify-center shadow-2xs z-20">
                        {st.gender === 'female' ? '👩' : '👨'}
                      </span>
                    </div>
                    <div className="w-full">
                      <h4 className="font-bold text-[10px] text-slate-800 dark:text-white truncate leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                        {st.first_name} {st.last_name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                        {st.admission_number || `#${st.id}`}
                      </p>
                    </div>
                    <div className="w-full bg-primary-50/80 dark:bg-primary-950/40 border border-primary-200/70 dark:border-primary-800/50 rounded-md px-1.5 py-0.5 text-[8px] text-primary-700 dark:text-primary-300 font-semibold text-center">
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
              <div 
                className="w-16 h-16 rounded-2xl border-2 border-primary-500/30 shadow-md flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden relative"
                style={{
                  backgroundColor: 'var(--theme-primary-50)',
                  color: 'var(--theme-primary-500)'
                }}
              >
                <span className="font-black text-2xl">{selectedStudent.first_name?.[0]?.toUpperCase() || 'S'}</span>
                {getStudentAvatar(selectedStudent) ? (
                  <img
                    src={getStudentAvatar(selectedStudent)}
                    alt={selectedStudent.first_name}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl z-10"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>
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
                      label: `${st.first_name} ${st.last_name} (Adm: ${st.admission_number || st.id})${st.grade ? ` - ${st.grade}` : ''}`,
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

      {/* 📥 ASSIGN CLASS TEACHER MODAL (PORTAL) */}
      {assignTeacherModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setAssignTeacherModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-6 animate-scaleUp relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary-600" />
                  <span>Assign Class Teacher</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Assign an unassigned teacher for Grade {classData?.class_name} - Sec {classData?.section}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssignTeacherModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Unassigned Teacher ({availableUnassignedTeachers.length} available)
                </label>
                <Select
                  value={teacherToAssign}
                  onChange={(e) => setTeacherToAssign(e.target.value)}
                  options={[
                    { label: '-- Select Unassigned Teacher --', value: '' },
                    ...availableUnassignedTeachers.map((t) => ({
                      label: `${t.name} (${t.subject || 'Faculty Member'}) - Emp ID: ${t.employeeId || t.id}`,
                      value: t.id.toString()
                    }))
                  ]}
                  searchable={true}
                />
              </div>

              {availableUnassignedTeachers.length === 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>All active teachers in your school are already assigned to a class. Add a new teacher from the Teachers Directory page first.</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAssignTeacherModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={assigningTeacher || !teacherToAssign}
                >
                  {assigningTeacher ? 'Assigning...' : 'Confirm Teacher Assignment'}
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

      {/* Reusable Promote Class Students Modal */}
      <PromoteStudentsModal
        isOpen={promoteModalOpen}
        onClose={() => setPromoteModalOpen(false)}
        activeYear={activeYear}
        academicYears={academicYears}
        initialStudents={classData?.students || []}
        classOptions={classListOptions}
        showClassFilter={false}
        title="Promote Class Students"
        subtitle={`Promote students of ${classData?.class_name} - Section ${classData?.section} to the next session`}
        onSuccess={() => fetchClassDetails()}
      />

      {/* Batch Student ID Cards Printable Modal */}
      <BatchStudentIdCardModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        students={classData?.students || []}
        classData={classData}
        teacher={teacher}
        schoolInfo={schoolInfo}
      />
    </div>
  );
}
