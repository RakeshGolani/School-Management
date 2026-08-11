'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  CreditCard, 
  Bus, 
  Edit3, 
  Trash2, 
  Phone, 
  UserCheck, 
  Camera, 
  Upload, 
  X, 
  Sparkles,
  ShieldCheck,
  Eye,
  GraduationCap,
  ArrowRight,
  CheckSquare,
  Square,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormPhoneInput from '@/components/FormPhoneInput';
import { 
  getStudentsAction, 
  createStudentAction, 
  updateStudentAction,
  getStudentSessionsAction,
  promoteStudentsAction
} from '@/actions/studentActions';
import { getClassesAction } from '@/actions/classActions';
import { useRouter } from 'next/navigation';
import Switch from '@/components/ui/Switch';
import { handleConfirmDelete, handleStatusToggle, formatPhoneNumber } from '@/lib/commonHandlers';
import { studentSchema } from '@/validators/studentSchemas';
import { notifySuccess, notifyError } from '@/lib/notify';
import DataTable from '@/components/ui/DataTable';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { useAcademicYear } from '@/context/AcademicYearContext';

const SESSION_STATUS_CONFIG = {
  ENROLLED:   { label: 'Enrolled',   color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.25)'   },
  PROMOTED:   { label: 'Promoted',   color: '#2563eb', bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.25)'   },
  DETAINED:   { label: 'Detained',   color: '#d97706', bg: 'rgba(217,119,6,0.1)',   border: 'rgba(217,119,6,0.25)'   },
  PASSED_OUT: { label: 'Passed Out', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)' },
};

function SessionBadge({ status }) {
  const cfg = SESSION_STATUS_CONFIG[status] || SESSION_STATUS_CONFIG.ENROLLED;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

/**
 * Complete Students Management Workspace — Academic Year aware
 */
export default function StudentsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { activeYear, academicYears } = useAcademicYear();

  // Data States
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedBusFilter, setSelectedBusFilter] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Promote Modal States
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [sessionStudents, setSessionStudents] = useState([]);
  const [loadingSessionStudents, setLoadingSessionStudents] = useState(false);
  const [targetYearId, setTargetYearId] = useState('');
  const [promotionList, setPromotionList] = useState([]); // [{ student_id, new_grade, new_section, status, checked }]
  const [promoteGradeFilter, setPromoteGradeFilter] = useState('all');
  const [bulkTargetGrade, setBulkTargetGrade] = useState('');
  const [submittingPromotion, setSubmittingPromotion] = useState(false);
  const [promotionResult, setPromotionResult] = useState(null);

  // Form Field States
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    admission_number: '',
    roll_number: '',
    class_id: '',
    grade: '',
    section: 'A',
    gender: 'male',
    dob: '',
    guardian_name: '',
    guardian_email: '',
    guardian_phone: '',
    alternate_phone: '',
    nfc_card_uid: '',
    is_bus_service_enabled: false,
    bus_route_id: '',
    bus_stop_id: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch classes dynamically
  const fetchClasses = async () => {
    const res = await getClassesAction();
    if (res.status === 'success' || res.success) {
      setClassesList(res.data || []);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGrade, selectedBusFilter, pageSize]);

  // Re-fetch when academic year changes
  useEffect(() => {
    if (!activeYear) return;
    setCurrentPage(1);
    fetchStudents();
  }, [activeYear?.id]);

  const classOptions = classesList.map((cls) => {
    const name = cls.class_name || cls.className || `Class ${cls.id}`;
    const sec = cls.section ? ` - ${cls.section}` : '';
    return { label: `${name}${sec}`, value: String(cls.id) };
  });

  const gradeOptions = classOptions.length > 0 ? classOptions : [
    { label: 'Grade 10-A', value: '1' },
    { label: 'Grade 9-B',  value: '2' },
    { label: 'Grade 8-A',  value: '3' },
    { label: 'Grade 5-B',  value: '4' },
    { label: 'Grade 1-A',  value: '5' }
  ];

  const gradeFilterOptions = [{ label: 'All Grades / Classes', value: 'all' }, ...gradeOptions];
  const busFilterOptions = [
    { label: 'All Transport Status', value: 'all' },
    { label: 'Bus Riders Only',      value: 'true' },
    { label: 'Non-Bus Students',     value: 'false' }
  ];
  const genderOptions = [
    { label: 'Male',   value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other',  value: 'other' }
  ];

  const fetchStudents = async () => {
    setLoading(true);
    const result = await getStudentsAction({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      grade: selectedGrade,
      is_bus: selectedBusFilter,
      academic_year_id: activeYear?.id
    });

    if (result.success) {
      setStudents(result.data || []);
      if (result.meta) {
        setTotalRecords(result.meta.total || 0);
        setTotalPages(result.meta.totalPages || 1);
      }
    } else {
      notifyError(result.message || 'Failed to load student records');
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchStudents(); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGrade, selectedBusFilter, currentPage, pageSize]);

  // ─── Promote Modal ─────────────────────────────────────────────────────────
  const handleOpenPromoteModal = async () => {
    if (!activeYear) { notifyError('No active academic session selected.'); return; }
    setPromoteModalOpen(true);
    setPromotionResult(null);
    setTargetYearId('');
    setPromoteGradeFilter('all');
    setBulkTargetGrade('');
    setLoadingSessionStudents(true);
    const res = await getStudentSessionsAction(activeYear.id);
    if (res.success) {
      const list = (res.data || []).map(s => ({
        student_id: s.student_id,
        student_name: s.student_name,
        admission_number: s.admission_number,
        current_grade: s.session_grade,
        current_section: s.session_section,
        session_status: s.session_status,
        photo: s.photo,
        // Promotion form fields
        new_grade: s.session_grade,
        new_section: s.session_section,
        status: 'PROMOTED',
        checked: true
      }));
      setSessionStudents(list);
      setPromotionList(list);
    } else {
      notifyError(res.message || 'Could not load students for this session');
    }
    setLoadingSessionStudents(false);
  };

  const handleToggleAll = (checked) => {
    setPromotionList(prev => prev.map(s => ({ ...s, checked })));
  };

  const handleToggleStudent = (student_id, checked) => {
    setPromotionList(prev => prev.map(s => s.student_id === student_id ? { ...s, checked } : s));
  };

  const handlePromotionFieldChange = (student_id, field, value) => {
    setPromotionList(prev => prev.map(s => s.student_id === student_id ? { ...s, [field]: value } : s));
  };

  const handleSubmitPromotion = async () => {
    if (!targetYearId) { notifyError('Please select the target academic session.'); return; }
    const selected = promotionList.filter(s => s.checked);
    if (selected.length === 0) { notifyError('Please select at least one student to promote.'); return; }

    setSubmittingPromotion(true);
    const res = await promoteStudentsAction({
      from_academic_year_id: activeYear.id,
      to_academic_year_id: parseInt(targetYearId),
      students: selected.map(s => ({
        student_id: s.student_id,
        new_grade: s.new_grade,
        new_section: s.new_section,
        status: s.status
      }))
    });

    if (res.success) {
      setPromotionResult(res.data);
      notifySuccess(res.message || 'Students promoted successfully!');
      fetchStudents();
    } else {
      notifyError(res.message || 'Promotion failed');
    }
    setSubmittingPromotion(false);
  };

  const visiblePromotionList = promotionList.filter(s => {
    if (!promoteGradeFilter || promoteGradeFilter === 'all') return true;
    
    // Find selected option label if value is an ID
    const selectedOpt = gradeOptions.find(o => String(o.value) === String(promoteGradeFilter));
    const targetText = (selectedOpt ? selectedOpt.label : promoteGradeFilter).replace(/[-\s]/g, '').toLowerCase();
    const studentGradeText = (s.current_grade || '').replace(/[-\s]/g, '').toLowerCase();
    
    return studentGradeText.includes(targetText) || targetText.includes(studentGradeText);
  });

  // ─── Admission Modal ────────────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    const firstCls = classesList[0];
    const initialClassId = firstCls ? String(firstCls.id) : '';
    const initialGrade = firstCls ? `${firstCls.class_name || firstCls.className}-${firstCls.section}` : 'Grade 10-A';
    const initialSection = firstCls ? firstCls.section : 'A';

    setFormData({
      first_name: '', last_name: '',
      admission_number: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      roll_number: '',
      class_id: initialClassId,
      grade: initialGrade,
      section: initialSection,
      gender: 'male',
      dob: '2012-05-15',
      guardian_name: '', guardian_email: '', guardian_phone: '',
      alternate_phone: '', nfc_card_uid: '',
      is_bus_service_enabled: false, bus_route_id: '', bus_stop_id: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    const studentClassId = student.classId || student.class_id;
    let matchedClass = classesList.find((c) => String(c.id) === String(studentClassId));
    if (!matchedClass && student.grade) {
      matchedClass = classesList.find((c) =>
        `${c.class_name || c.className}-${c.section}` === student.grade ||
        (c.class_name || c.className) === student.grade
      );
    }
    const initialClassId = matchedClass ? String(matchedClass.id) : (studentClassId ? String(studentClassId) : (classesList[0] ? String(classesList[0].id) : ''));

    setFormData({
      first_name: student.firstName || '',
      last_name: student.lastName || '',
      admission_number: student.admissionNumber || '',
      roll_number: student.rollNumber || student.roll_number || '',
      class_id: initialClassId,
      grade: initialClassId,
      section: student.section || (matchedClass ? matchedClass.section : 'A'),
      gender: student.gender || 'male',
      dob: student.dob || '',
      guardian_name: student.guardianName || '',
      guardian_email: student.guardianEmail || '',
      guardian_phone: student.guardianPhone || '',
      alternate_phone: student.alternatePhone || '',
      nfc_card_uid: student.nfcCardUid || '',
      is_bus_service_enabled: Boolean(student.isBusServiceEnabled),
      bus_route_id: student.busRouteId || '',
      bus_stop_id: student.busStopId || ''
    });
    setSelectedFile(null);
    setPreviewUrl(student.photo || '');
    setFormErrors({});
    setModalOpen(true);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { notifyError('Please select a valid image file (PNG, JPG, WEBP)'); return; }
    if (file.size > 15 * 1024 * 1024) { notifyError('Photo size should be less than 15MB'); return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      await studentSchema.validate(formData, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errs = {};
        yupErr.inner.forEach((err) => { if (err.path && !errs[err.path]) errs[err.path] = err.message; });
        setFormErrors(errs);
      } else {
        notifyError(yupErr.message);
      }
      setSubmitting(false);
      return;
    }

    try {
      const sendData = new FormData();
      const selectedCls = classesList.find((c) => String(c.id) === String(formData.class_id || formData.grade));
      const resolvedGrade = selectedCls
        ? `${selectedCls.class_name || selectedCls.className}-${selectedCls.section}`
        : (formData.grade || '');

      Object.entries(formData).forEach(([key, val]) => {
        let finalVal = val !== null ? val : '';
        if (key === 'grade') finalVal = resolvedGrade;
        else if (key === 'class_id') finalVal = selectedCls ? String(selectedCls.id) : val;
        if (key === 'alternate_phone' && finalVal) {
          const stripped = String(finalVal).replace(/\D/g, '');
          if (stripped.length <= 4) finalVal = '';
        }
        sendData.append(key, finalVal);
      });

      // Also pass the active academic year so the session record is created
      if (activeYear?.id) sendData.append('academic_year_id', activeYear.id);

      if (selectedFile) sendData.append('photo', selectedFile);

      let result;
      if (editingStudent) {
        result = await updateStudentAction(editingStudent.id, sendData);
      } else {
        result = await createStudentAction(sendData);
      }

      if (!result.success) {
        if (result.errors) {
          const errs = {};
          if (Array.isArray(result.errors)) result.errors.forEach(err => { if (err.path) errs[err.path] = err.message; });
          else Object.entries(result.errors).forEach(([key, val]) => { errs[key] = Array.isArray(val) ? val[0] : val; });
          setFormErrors(errs);
          notifyError('Please fix the form errors highlighted in red.');
        } else {
          notifyError(result.message);
        }
        setSubmitting(false);
        return;
      }

      notifySuccess(editingStudent ? 'Student profile updated!' : 'New student admitted successfully!');
      setModalOpen(false);
      fetchStudents();
    } catch (error) {
      notifyError('Failed to save student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = (student) => {
    handleConfirmDelete('student', student.id, () => { fetchStudents(); });
  };

  // ─── Table Columns ──────────────────────────────────────────────────────────
  const studentColumns = [
    {
      header: 'Student Profile',
      render: (student) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 p-0.5 shrink-0 overflow-hidden">
            <div className="w-full h-full rounded-[10px] bg-slate-100 flex items-center justify-center font-bold text-slate-800 overflow-hidden">
              {student.photo ? (
                <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{student.firstName?.[0]}{student.lastName?.[0]}</span>
              )}
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-900">{student.fullName}</p>
            <p className="text-[10px] text-slate-500 capitalize">{student.gender || 'student'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Admission / Roll #',
      render: (student) => (
        <div className="space-y-0.5">
          <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block text-center">
            {student.admissionNumber}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block text-center">
            Roll: <strong className="text-slate-800">{student.rollNumber || student.roll_number || 'N/A'}</strong>
          </span>
        </div>
      )
    },
    {
      header: 'Class / Grade',
      render: (student) => (
        <div className="space-y-1">
          <Badge variant="primary">{student.session_grade || student.grade}</Badge>
          {student.session_status && <SessionBadge status={student.session_status} />}
        </div>
      )
    },
    {
      header: 'NFC Card UID',
      render: (student) => student.nfcCardUid ? (
        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <CreditCard size={10} /> {student.nfcCardUid}
        </span>
      ) : (
        <span className="text-slate-400 text-[11px] italic">Not Assigned</span>
      )
    },
    {
      header: 'Smart Bus',
      render: (student) => student.isBusServiceEnabled ? (
        <Badge variant="emerald" icon={Bus}>Active Rider</Badge>
      ) : (
        <span className="text-slate-500 text-[11px]">No Bus</span>
      )
    },
    {
      header: 'Guardian Contact',
      render: (student) => (
        <div className="space-y-0.5">
          <p className="text-slate-800 font-medium">{student.guardianName || 'N/A'}</p>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Phone size={10} /> {student.guardianPhone ? formatPhoneNumber(student.guardianPhone) : 'No Phone'}
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      render: (student) => (
        <Switch
          checked={student.status === 'active'}
          onChange={async (checked) => {
            await handleStatusToggle('student', student.id, checked ? 'active' : 'inactive', () => { fetchStudents(); });
          }}
        />
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (student) => (
        <div className="flex justify-end space-x-2">
          <Tooltip content="View Profile" position="top">
            <button
              type="button"
              onClick={() => router.push(`/students/${student.id}`)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
            >
              <Eye size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Edit Student" position="top">
            <button
              type="button"
              onClick={() => handleOpenEditModal(student)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
            >
              <Edit3 size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete Student" position="top">
            <button
              type="button"
              onClick={() => handleDeleteStudent(student)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 text-slate-600 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  const totalStudents = totalRecords || students.length;
  const nfcAssignedCount = students.filter((s) => s.nfcCardUid).length;
  const busRidersCount = students.filter((s) => s.isBusServiceEnabled).length;

  // Target year options for promotion (exclude current active year)
  const targetYearOptions = (academicYears || [])
    .filter(y => String(y.id) !== String(activeYear?.id))
    .map(y => ({ label: `${y.year_name} (${y.status})`, value: String(y.id) }));

  const allChecked = promotionList.length > 0 && promotionList.every(s => s.checked);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 🌟 Header Banner & Quick Actions */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-primary-50/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <Badge variant="emerald" dot>Live Academic Directory</Badge>
            <Badge variant="primary">Campus: Main Branch</Badge>
            {activeYear && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-50 border border-violet-200 text-violet-700 px-2 py-0.5 rounded-full">
                <CalendarDays size={10} />
                Session: {activeYear.year_name}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <Users className="text-primary-600" size={24} /> Student Directory &amp; NFC Management
          </h1>
          <p className="text-slate-500 text-xs">
            Manage student admissions, NFC card UIDs, smart bus transport, and attendance profiles.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Promote Students Button */}
          <button
            type="button"
            onClick={handleOpenPromoteModal}
            disabled={!activeYear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
          >
            <GraduationCap size={16} />
            Promote Students
          </button>

          <Button variant="primary" icon={UserPlus} onClick={handleOpenAddModal}>
            + New Admission
          </Button>
        </div>
      </div>

      {/* 📊 Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs"><span>Total Students</span><Users size={16} className="text-primary-600" /></div>
          <p className="text-2xl font-extrabold text-slate-900">{totalStudents}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Active Enrollments</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs"><span>NFC Cards Issued</span><CreditCard size={16} className="text-emerald-600" /></div>
          <p className="text-2xl font-extrabold text-emerald-600">{nfcAssignedCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">{Math.round((nfcAssignedCount / (totalStudents || 1)) * 100)}% Coverage</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs"><span>Smart Bus Riders</span><Bus size={16} className="text-amber-600" /></div>
          <p className="text-2xl font-extrabold text-amber-600">{busRidersCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Active Transport Riders</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs"><span>Attendance Status</span><UserCheck size={16} className="text-primary-600" /></div>
          <p className="text-2xl font-extrabold text-slate-900">98.4%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Daily Campus Average</span>
        </div>
      </div>

      {/* 🔍 Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Roll #, NFC UID, admission #..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} options={gradeFilterOptions} placeholder="All Grades" searchable={true} />
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedBusFilter} onChange={(e) => setSelectedBusFilter(e.target.value)} options={busFilterOptions} placeholder="All Transport Status" searchable={true} />
          </div>
        </div>
      </div>

      {/* 📋 Students Directory Table */}
      <Card title={`Student Records (${totalRecords})`} icon={Users} subtitle={activeYear ? `Session: ${activeYear.year_name}` : 'Real-time list of enrolled students'}>
        <DataTable
          columns={studentColumns}
          data={students}
          loading={loading}
          skeletonRow={SkeletonTableRow}
          skeletonRows={5}
          emptyMessage="No student records match your search query."
          emptyIcon={Users}
          pagination={{ currentPage, pageSize, totalRecords, totalPages, onPageChange: setCurrentPage, onPageSizeChange: setPageSize }}
        />
      </Card>

      {/* ─── PROMOTE STUDENTS MODAL ───────────────────────────────────────── */}
      {promoteModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4"
          onClick={() => setPromoteModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Promote Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                    <GraduationCap size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Promote Students</h2>
                </div>
                <p className="text-xs text-slate-500 pl-10">
                  Move students from <strong>{activeYear?.year_name}</strong> to the next academic session
                </p>
              </div>
              <button type="button" onClick={() => setPromoteModalOpen(false)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Promote Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Promotion result summary */}
              {promotionResult && (
                <div className="rounded-2xl p-4 border border-emerald-200 bg-emerald-50 space-y-2">
                  <p className="font-bold text-emerald-700 text-sm flex items-center gap-2"><CheckCircle2 size={16} /> Promotion Completed!</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="bg-white border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full font-semibold">✓ Promoted: {promotionResult.summary?.promoted}</span>
                    <span className="bg-white border border-amber-200 text-amber-700 px-3 py-1 rounded-full font-semibold">⚠ Detained: {promotionResult.summary?.detained}</span>
                    <span className="bg-white border border-violet-200 text-violet-700 px-3 py-1 rounded-full font-semibold">⬆ Passed Out: {promotionResult.summary?.passedOut}</span>
                    {promotionResult.summary?.skipped > 0 && <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full font-semibold">— Skipped: {promotionResult.summary?.skipped}</span>}
                  </div>
                </div>
              )}

              {/* Filter & Target Session Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <div>
                  <Select
                    label="Target Academic Session"
                    required
                    value={targetYearId}
                    onChange={e => setTargetYearId(e.target.value)}
                    options={[
                      { label: '— Select target session —', value: '' },
                      ...targetYearOptions
                    ]}
                    placeholder="Select target session"
                  />
                  {targetYearOptions.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Create another academic session first.</p>
                  )}
                </div>

                <div>
                  <Select
                    label="Filter By Current Class / Grade"
                    value={promoteGradeFilter}
                    onChange={e => setPromoteGradeFilter(e.target.value)}
                    options={[
                      { label: 'All Classes / Grades', value: 'all' },
                      ...gradeOptions
                    ]}
                    placeholder="Filter by class"
                  />
                </div>
              </div>

              {/* Students list */}
              {loadingSessionStudents ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : sessionStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <GraduationCap size={32} className="mx-auto mb-2 opacity-40" />
                  No students found in this session.
                </div>
              ) : (
                <>
                  {/* Select all & Bulk Action Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-violet-50/60 border border-violet-100">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const visibleIds = visiblePromotionList.map(s => s.student_id);
                          const shouldCheck = !visiblePromotionList.every(s => s.checked);
                          setPromotionList(prev => prev.map(s => visibleIds.includes(s.student_id) ? { ...s, checked: shouldCheck } : s));
                        }}
                        className="text-slate-700 hover:text-violet-700 cursor-pointer flex items-center gap-2 font-bold text-xs"
                      >
                        {visiblePromotionList.length > 0 && visiblePromotionList.every(s => s.checked) ? (
                          <CheckSquare size={16} className="text-violet-600" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                        <span>Select All ({visiblePromotionList.filter(s => s.checked).length}/{visiblePromotionList.length})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Set New Class for Selected:</span>
                      <div className="w-40 shrink-0">
                        <select
                          value={bulkTargetGrade}
                          onChange={e => {
                            const val = e.target.value;
                            setBulkTargetGrade(val);
                            if (val) {
                              const visibleIds = visiblePromotionList.filter(s => s.checked).map(s => s.student_id);
                              setPromotionList(prev => prev.map(s => visibleIds.includes(s.student_id) ? { ...s, new_grade: val } : s));
                            }
                          }}
                          className="w-full bg-white border border-violet-200 rounded-xl py-1 px-2 text-xs font-semibold text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        >
                          <option value="">— Set New Grade —</option>
                          {gradeOptions.map(opt => (
                            <option key={opt.label} value={opt.label}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Student promotion rows */}
                  <div className="space-y-2.5 max-h-80 overflow-y-auto px-1 pb-20 pt-1">
                    {visiblePromotionList.map((s) => (
                      <div
                        key={s.student_id}
                        className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                        style={{ background: s.checked ? 'rgba(124,58,237,0.03)' : '#f8fafc', borderColor: s.checked ? 'rgba(124,58,237,0.2)' : '#e2e8f0' }}
                      >
                        {/* Checkbox */}
                        <button type="button" onClick={() => handleToggleStudent(s.student_id, !s.checked)} className="shrink-0 cursor-pointer">
                          {s.checked ? <CheckSquare size={16} className="text-violet-600" /> : <Square size={16} className="text-slate-400" />}
                        </button>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {s.student_name?.[0]}
                        </div>

                        {/* Name + current grade */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{s.student_name}</p>
                          <p className="text-[10px] text-slate-500">{s.admission_number} · {s.current_grade}</p>
                        </div>

                        {/* New grade select dropdown using UI Select component */}
                        <div className="w-40 shrink-0">
                          <Select
                            value={s.new_grade}
                            onChange={e => handlePromotionFieldChange(s.student_id, 'new_grade', e.target.value)}
                            disabled={!s.checked}
                            options={gradeOptions.map(opt => ({ label: opt.label, value: opt.label }))}
                            searchable={true}
                            clearable={false}
                            placeholder="Select Grade"
                          />
                        </div>

                        {/* Status selector using UI Select component */}
                        <div className="w-36 shrink-0">
                          <Select
                            value={s.status}
                            onChange={e => handlePromotionFieldChange(s.student_id, 'status', e.target.value)}
                            disabled={!s.checked}
                            options={[
                              { label: 'Promoted', value: 'PROMOTED' },
                              { label: 'Detained', value: 'DETAINED' },
                              { label: 'Passed Out', value: 'PASSED_OUT' }
                            ]}
                            searchable={false}
                            clearable={false}
                            placeholder="Status"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Promote Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <Button type="button" variant="secondary" onClick={() => setPromoteModalOpen(false)}>Cancel</Button>
              <button
                type="button"
                onClick={handleSubmitPromotion}
                disabled={submittingPromotion || !targetYearId || promotionList.filter(s => s.checked).length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
              >
                {submittingPromotion ? (
                  <>Processing...</>
                ) : (
                  <><GraduationCap size={15} /> Promote {promotionList.filter(s => s.checked).length} Students <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── NEW ADMISSION / EDIT OFFCANVAS DRAWER ────────────────────────── */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-white border-l border-slate-200 w-full max-w-2xl h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-primary-600" />
                  {editingStudent ? 'Edit Student Profile' : 'New Student Admission'}
                </h2>
                {activeYear && (
                  <p className="text-[10px] text-violet-600 font-semibold mt-0.5 flex items-center gap-1">
                    <CalendarDays size={10} /> Session: {activeYear.year_name}
                  </p>
                )}
                <p className="text-xs text-slate-500">Fill in campus details, assign NFC card UID, and configure bus transport.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form noValidate onSubmit={handleSubmit} className="space-y-6">
              
              {/* Photo Upload Picker */}
              <div className="flex items-center space-x-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 p-0.5 shadow-md overflow-hidden">
                    <div className="w-full h-full rounded-[14px] bg-slate-100 flex items-center justify-center text-slate-800 font-bold overflow-hidden">
                      {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={20} className="text-slate-400" />}
                    </div>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white cursor-pointer">
                    <Upload size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                  <Button type="button" variant="secondary" icon={Upload} onClick={() => fileInputRef.current?.click()}>Select Photo File</Button>
                  <p className="text-[10px] text-slate-500">Saved to <code className="text-primary-600 font-medium">backend/uploads/students/</code></p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First Name" required value={formData.first_name} error={formErrors.first_name} onChange={(e) => { setFormData({ ...formData, first_name: e.target.value }); setFormErrors(p => ({ ...p, first_name: '' })); }} placeholder="e.g. Rahul" />
                <Input label="Last Name" required value={formData.last_name} error={formErrors.last_name} onChange={(e) => { setFormData({ ...formData, last_name: e.target.value }); setFormErrors(p => ({ ...p, last_name: '' })); }} placeholder="e.g. Sharma" />
                <Input label="Admission Number" value={formData.admission_number} onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })} placeholder="ADM-1001" />
                <Input label="Roll Number" value={formData.roll_number} error={formErrors.roll_number} onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })} placeholder="e.g. 101" />
                <Select label="Grade / Class" value={formData.class_id || formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value, class_id: e.target.value })} options={gradeOptions} error={formErrors.grade} searchable={true} />
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Guardian Name" required value={formData.guardian_name} error={formErrors.guardian_name} onChange={(e) => { setFormData({ ...formData, guardian_name: e.target.value }); setFormErrors(p => ({ ...p, guardian_name: '' })); }} placeholder="e.g. Ramesh Sharma" />
                <Input label="Guardian Email" required type="email" value={formData.guardian_email} error={formErrors.guardian_email} onChange={(e) => { setFormData({ ...formData, guardian_email: e.target.value }); setFormErrors(p => ({ ...p, guardian_email: '' })); }} placeholder="e.g. ramesh@example.com" />
                <FormPhoneInput label="Guardian Phone" required defaultCountry="in" value={formData.guardian_phone} error={formErrors.guardian_phone} onChange={(phone) => { setFormData({ ...formData, guardian_phone: phone }); setFormErrors(p => ({ ...p, guardian_phone: '' })); }} />
                <FormPhoneInput label="Alternate Phone" defaultCountry="in" value={formData.alternate_phone} error={formErrors.alternate_phone} onChange={(phone) => { setFormData({ ...formData, alternate_phone: phone }); setFormErrors(p => ({ ...p, alternate_phone: '' })); }} />
                <Select label="Gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} options={genderOptions} searchable={false} />
                <Input label="NFC Card Identifier UID" icon={CreditCard} value={formData.nfc_card_uid} error={formErrors.nfc_card_uid} onChange={(e) => { setFormData({ ...formData, nfc_card_uid: e.target.value }); setFormErrors(p => ({ ...p, nfc_card_uid: '' })); }} placeholder="e.g. 8F3C910B" />
              </div>

              {/* Smart Bus Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-slate-900 flex items-center gap-1.5"><Bus size={14} className="text-amber-600" /> Smart Bus Transport Service</span>
                    <span className="text-[10px] text-slate-500">Enable automatic bus boarding &amp; deboarding scanning.</span>
                  </div>
                  <input type="checkbox" checked={formData.is_bus_service_enabled} onChange={(e) => setFormData({ ...formData, is_bus_service_enabled: e.target.checked })} className="w-5 h-5 accent-primary-600 rounded cursor-pointer" />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" loading={submitting} icon={ShieldCheck}>
                  {editingStudent ? 'Update Profile' : 'Save Student Admission'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
