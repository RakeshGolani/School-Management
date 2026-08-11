'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, 
  UserPlus, 
  Search, 
  CreditCard, 
  BookOpen, 
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
  Award,
  CalendarDays
} from 'lucide-react';
import { useAcademicYear } from '@/context/AcademicYearContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormPhoneInput from '@/components/FormPhoneInput';
import Switch from '@/components/ui/Switch';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/DataTable';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { 
  getTeachersAction, 
  createTeacherAction, 
  updateTeacherAction 
} from '@/actions/teacherActions';
import { getClassesAction } from '@/actions/classActions';
import { handleConfirmDelete, handleStatusToggle, formatPhoneNumber } from '@/lib/commonHandlers';
import { teacherSchema } from '@/validators/teacherSchemas';
import { notifySuccess, notifyError } from '@/lib/notify';

/**
 * Teachers Directory & Profile Management Workspace
 */
export default function TeachersPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { activeYear } = useAcademicYear();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeTeachersCount, setActiveTeachersCount] = useState(0);
  const [nfcAssignedCount, setNfcAssignedCount] = useState(0);

  const subjectOptions = [
    { label: 'Mathematics', value: 'Mathematics' },
    { label: 'Science & Physics', value: 'Science & Physics' },
    { label: 'English Literature', value: 'English Literature' },
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'Social Studies', value: 'Social Studies' },
    { label: 'Chemistry', value: 'Chemistry' },
    { label: 'Physical Education', value: 'Physical Education' }
  ];

  const subjectFilterOptions = [
    { label: 'All Subjects', value: 'all' },
    ...subjectOptions
  ];

  const statusFilterOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'Inactive Only', value: 'inactive' }
  ];

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form Field States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    qualification: '',
    subject: '',
    class_assigned: '',
    employee_id: '',
    nfc_card_uid: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dynamicClasses, setDynamicClasses] = useState([]);

  const fetchDynamicClasses = async () => {
    try {
      const res = await getClassesAction({ status: 'active' });
      if (res.success && Array.isArray(res.data)) {
        const formatted = res.data.map(c => ({
          label: `${c.class_name}-${c.section}`,
          value: `${c.class_name}-${c.section}`
        }));
        setDynamicClasses(formatted);
      } else {
        setDynamicClasses([]);
      }
    } catch (e) {
      console.error('Failed to load dynamic classes', e);
      setDynamicClasses([]);
    }
  };

  useEffect(() => {
    fetchDynamicClasses();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    const result = await getTeachersAction({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      subject: selectedSubject,
      status: selectedStatusFilter,
      academic_year_id: activeYear?.id
    });

    if (result.success) {
      setTeachers(result.data || []);
      if (result.meta) {
        setTotalRecords(result.meta.total || 0);
        setTotalPages(result.meta.totalPages || 1);
        setActiveTeachersCount(result.meta.active_count ?? (result.data || []).filter(t => t.status === 'active').length);
        setNfcAssignedCount(result.meta.nfc_count ?? (result.data || []).filter(t => t.nfcCardUid).length);
      }
    } else {
      notifyError(result.message || 'Failed to load teacher records');
    }
    setLoading(false);
  };

  // Re-fetch when academic year changes
  useEffect(() => {
    setCurrentPage(1);
    fetchTeachers();
  }, [activeYear?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSubject, selectedStatusFilter, currentPage, pageSize]);

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      qualification: '',
      subject: '',
      class_assigned: '',
      employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      nfc_card_uid: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      gender: teacher.gender || 'male',
      qualification: teacher.qualification || 'M.Sc, B.Ed',
      subject: teacher.subject || 'Mathematics',
      class_assigned: teacher.classAssigned || 'Grade 10-A',
      employee_id: teacher.employeeId || '',
      nfc_card_uid: teacher.nfcCardUid || ''
    });
    setSelectedFile(null);
    setPreviewUrl(teacher.photo || '');
    setFormErrors({});
    setModalOpen(true);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyError('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      notifyError('Photo size should be less than 15MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      await teacherSchema.validate(formData, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errs = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errs[err.path]) {
            errs[err.path] = err.message;
          }
        });
        setFormErrors(errs);
      } else {
        notifyError(yupErr.message);
      }
      setSubmitting(false);
      return;
    }

    try {
      const sendData = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        sendData.append(key, val !== null ? val : '');
      });

      if (selectedFile) {
        sendData.append('photo', selectedFile);
      }

      let result;
      if (editingTeacher) {
        result = await updateTeacherAction(editingTeacher.id, sendData);
      } else {
        result = await createTeacherAction(sendData);
      }

      if (!result.success) {
        if (result.errors) {
          const errs = {};
          if (Array.isArray(result.errors)) {
            result.errors.forEach(err => {
              if (err.path) errs[err.path] = err.message;
            });
          } else {
            Object.entries(result.errors).forEach(([key, val]) => {
              errs[key] = Array.isArray(val) ? val[0] : val;
            });
          }
          setFormErrors(errs);
          notifyError('Please fix the highlighted errors.');
        } else {
          notifyError(result.message);
        }
        setSubmitting(false);
        return;
      }

      notifySuccess(editingTeacher ? 'Teacher profile updated successfully!' : 'New teacher added successfully!');
      setModalOpen(false);
      fetchTeachers();
    } catch (error) {
      notifyError('Failed to save teacher record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = (teacher) => {
    handleConfirmDelete('teacher', teacher.id, () => {
      fetchTeachers();
    });
  };

  const teacherColumns = [
    {
      header: 'Teacher Profile',
      render: (teacher) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 p-0.5 shrink-0 overflow-hidden">
            <div className="w-full h-full rounded-[10px] bg-slate-100 flex items-center justify-center font-bold text-slate-800 overflow-hidden">
              {teacher.photo ? (
                <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <span>{teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'TC'}</span>
              )}
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-900">{teacher.name}</p>
            <p className="text-[10px] text-slate-500">{teacher.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Employee ID',
      render: (teacher) => (
        <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 px-2.5 py-1 rounded-md border border-slate-200/80 text-[11px] shadow-2xs">
          {teacher.employeeId || 'N/A'}
        </span>
      )
    },
    {
      header: 'Subject & Qualification',
      render: (teacher) => (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 text-teal-700 font-semibold text-[11px] px-2.5 py-0.5 rounded-full shadow-2xs">
            <BookOpen size={11} className="text-teal-600 shrink-0" />
            {teacher.subject || 'General Educator'}
          </span>
          <p className="text-[11px] text-slate-500 font-medium pl-0.5">{teacher.qualification || 'Educator'}</p>
        </div>
      )
    },
    {
      header: 'Assigned Classes',
      render: (teacher) => {
        const classes = (Array.isArray(teacher.assignedClasses) && teacher.assignedClasses.length > 0)
          ? teacher.assignedClasses.map(c => typeof c === 'string' ? c : (c.class_name || c))
          : (teacher.classAssigned ? teacher.classAssigned.split(',').map(c => c.trim()).filter(Boolean) : []);

        return classes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {classes.map((cls, idx) => (
              <span key={idx} className="bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                {cls}
              </span>
            ))}
          </div>
        ) : (
          <span className="inline-block text-slate-400 text-[11px] italic bg-slate-50 border border-dashed border-slate-200 px-2 py-0.5 rounded-md">
            Unassigned
          </span>
        );
      }
    },
    {
      header: 'NFC Card UID',
      render: (teacher) => teacher.nfcCardUid ? (
        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <CreditCard size={10} /> {teacher.nfcCardUid}
        </span>
      ) : (
        <span className="text-slate-400 text-[11px] italic">Not Assigned</span>
      )
    },
    {
      header: 'Phone Contact',
      render: (teacher) => (
        <p className="text-slate-700 font-medium flex items-center gap-1 text-xs">
          <Phone size={12} className="text-slate-400" /> {teacher.phone ? formatPhoneNumber(teacher.phone) : 'N/A'}
        </p>
      )
    },
    {
      header: 'Status',
      render: (teacher) => (
        <Switch
          checked={teacher.status === 'active'}
          onChange={async (checked) => {
            const newStatus = checked ? 'active' : 'inactive';
            await handleStatusToggle('teacher', teacher.id, newStatus, () => {
              fetchTeachers();
            });
          }}
        />
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (teacher) => (
        <div className="flex justify-end space-x-2">
          <Tooltip content="View Profile" position="top">
            <button
              type="button"
              onClick={() => router.push(`/teachers/${teacher.id}`)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
            >
              <Eye size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Edit Teacher" position="top">
            <button
              type="button"
              onClick={() => handleOpenEditModal(teacher)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
            >
              <Edit3 size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete Teacher" position="top">
            <button
              type="button"
              onClick={() => handleDeleteTeacher(teacher)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 text-slate-600 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  const totalTeachers = totalRecords || teachers.length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 🌟 Header Banner & Quick Actions */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-primary-50/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <Badge variant="emerald" dot>Faculty & Staff Directory</Badge>
            {activeYear ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-50 border border-violet-200 text-violet-700 px-2 py-0.5 rounded-full">
                <CalendarDays size={10} />
                Session: {activeYear.year_name}
              </span>
            ) : (
              <Badge variant="primary">All Sessions</Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <GraduationCap className="text-primary-600" size={24} /> Teacher Directory & Staff Portal
          </h1>
          <p className="text-slate-500 text-xs">
            Manage faculty profiles, subject specializations, NFC cards, and class assignments.
          </p>
        </div>

        <Button
          variant="primary"
          icon={UserPlus}
          onClick={handleOpenAddModal}
        >
          Add New Teacher
        </Button>
      </div>

      {/* 📊 Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Faculty</span>
            <GraduationCap size={16} className="text-primary-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totalTeachers}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Registered Staff</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Educators</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{activeTeachersCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Currently Teaching</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>NFC Cards Issued</span>
            <CreditCard size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{nfcAssignedCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Gate Pass Enabled</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Subjects Covered</span>
            <Award size={16} className="text-primary-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">7 Science & Arts</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Full Curriculum</span>
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
            placeholder="Search by teacher name, email, employee ID, NFC UID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={subjectFilterOptions}
              placeholder="All Subjects"
              searchable={true}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              options={statusFilterOptions}
              placeholder="All Statuses"
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* 📋 Teachers Directory Table */}
      <Card title={`Teacher Records (${totalRecords})`} icon={GraduationCap} subtitle={activeYear ? `Session: ${activeYear.year_name}` : 'Real-time list of faculty members'}>
        <DataTable
          columns={teacherColumns}
          data={teachers}
          loading={loading}
          skeletonRow={SkeletonTableRow}
          skeletonRows={5}
          emptyMessage="No teacher records match your search query."
          emptyIcon={GraduationCap}
          pagination={{
            currentPage,
            pageSize,
            totalRecords,
            totalPages,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize
          }}
        />
      </Card>

      {/* 📥 ADD / EDIT TEACHER OFFCANVAS DRAWER (PORTAL) */}
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
                  {editingTeacher ? 'Edit Teacher Profile' : 'Add New Teacher'}
                </h2>
                <p className="text-xs text-slate-500">Fill in faculty details, assign subject specialization, and configure NFC card UID.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
              >
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
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={20} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white cursor-pointer"
                  >
                    <Upload size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Photo File
                  </Button>
                  <p className="text-[10px] text-slate-500">Saved to <code className="text-primary-600 font-medium">backend/uploads/teachers/</code></p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={formData.name}
                  error={formErrors.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setFormErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Vikram Mehta"
                />

                <Input
                  label="Email Address"
                  required
                  type="email"
                  value={formData.email}
                  error={formErrors.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setFormErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. vikram@school.com"
                />

                <FormPhoneInput
                  label="Phone Contact"
                  required
                  defaultCountry="in"
                  value={formData.phone}
                  error={formErrors.phone}
                  onChange={(phone) => {
                    setFormData({ ...formData, phone: phone });
                    setFormErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                />

                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  options={genderOptions}
                  searchable={false}
                />
              </div>

              {/* Academic Details & Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Primary Teaching Subject"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    setFormErrors((prev) => ({ ...prev, subject: '' }));
                  }}
                  options={subjectOptions}
                  error={formErrors.subject}
                  searchable={true}
                />

                <Input
                  label="Qualifications"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. M.Sc, B.Ed"
                />

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Assigned Classes (Select Multiple)
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    {dynamicClasses.map((cls) => {
                      const selectedList = formData.class_assigned ? formData.class_assigned.split(',').map(c => c.trim()) : [];
                      const isChecked = selectedList.includes(cls.value);

                      return (
                        <label 
                          key={cls.value} 
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            isChecked 
                              ? 'bg-primary-600 text-white border-primary-600 shadow-2xs' 
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={(e) => {
                              let current = formData.class_assigned ? formData.class_assigned.split(',').map(c => c.trim()).filter(Boolean) : [];
                              if (e.target.checked) {
                                if (!current.includes(cls.value)) current.push(cls.value);
                              } else {
                                current = current.filter(c => c !== cls.value);
                              }
                              setFormData({ ...formData, class_assigned: current.join(', ') });
                            }}
                          />
                          <span>{cls.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Employee ID Code"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  placeholder="EMP-1001"
                />
              </div>

              {/* NFC Card UID */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <Input
                  label="NFC Staff Pass UID (Gate Check-In & Attendance)"
                  icon={CreditCard}
                  value={formData.nfc_card_uid}
                  error={formErrors.nfc_card_uid}
                  onChange={(e) => {
                    setFormData({ ...formData, nfc_card_uid: e.target.value });
                    setFormErrors((prev) => ({ ...prev, nfc_card_uid: '' }));
                  }}
                  placeholder="e.g. TEACHER_CARD_001"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  icon={ShieldCheck}
                >
                  {editingTeacher ? 'Update Profile' : 'Save Teacher Profile'}
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
