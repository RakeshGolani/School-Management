'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  GraduationCap, 
  Sparkles, 
  RefreshCw, 
  X, 
  Check, 
  Building2,
  DoorOpen,
  UserCheck,
  Eye,
  School
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Tooltip from '@/components/ui/Tooltip';
import { SkeletonClassRow } from '@/components/ui/Skeleton';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  getClassesAction, 
  createClassAction, 
  updateClassAction, 
  deleteClassAction 
} from '@/actions/school/classActions';
import { getTeachersAction } from '@/actions/school/teacherActions';

import * as Yup from 'yup';

const classSchema = Yup.object().shape({
  class_name: Yup.string()
    .trim()
    .required('Class/Grade Name is required (e.g. Grade 10)'),
  section: Yup.string()
    .trim()
    .required('Section is required (e.g. A, B, C)'),
  room_number: Yup.string()
    .nullable(),
  capacity: Yup.number()
    .typeError('Capacity must be a number')
    .min(1, 'Capacity must be at least 1 student')
    .max(500, 'Capacity cannot exceed 500 students')
    .required('Student capacity is required')
});

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    class_name: '',
    section: 'A',
    class_teacher_id: '',
    room_number: '',
    capacity: 40,
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await getClassesAction({ search: searchQuery, status: statusFilter });
      if (res.success && Array.isArray(res.data)) {
        setClasses(res.data);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      notifyError('Classes load karne me error aaya');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await getTeachersAction({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setTeachers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchClasses();
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      class_name: '',
      section: 'A',
      class_teacher_id: '',
      room_number: '',
      capacity: 40,
      status: 'active'
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      class_name: cls.class_name || '',
      section: cls.section || 'A',
      class_teacher_id: cls.class_teacher_id ? cls.class_teacher_id.toString() : '',
      room_number: cls.room_number || '',
      capacity: cls.capacity || 40,
      status: cls.status || 'active'
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      await classSchema.validate(formData, { abortEarly: false });
    } catch (yupError) {
      if (yupError.inner) {
        const errors = {};
        yupError.inner.forEach((err) => {
          if (err.path && !errors[err.path]) {
            errors[err.path] = err.message;
          }
        });
        setFormErrors(errors);
        notifyError('Please fix validation errors in the form');
        return;
      }
    }

    setSubmitting(true);
    try {
      let res;
      if (editingClass) {
        res = await updateClassAction(editingClass.id, formData);
      } else {
        res = await createClassAction(formData);
      }

      if (res.success) {
        notifySuccess(res.message || 'Class saved successfully!');
        setModalOpen(false);
        fetchClasses();
      } else {
        if (res.errors) {
          const apiErrors = {};
          Object.keys(res.errors).forEach(key => {
            apiErrors[key] = Array.isArray(res.errors[key]) ? res.errors[key][0] : res.errors[key];
          });
          setFormErrors(apiErrors);
        }
        notifyError(res.message || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to save class');
    } finally {
      setSubmitting(false);
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

  const handleDelete = (cls) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Class Deletion',
      message: `Are you sure you want to delete '${cls.class_name}-${cls.section}'? All student class mappings will be removed.`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await deleteClassAction(cls.id);
          if (res.success) {
            notifySuccess('Class deleted successfully');
            fetchClasses();
          } else {
            notifyError(res.message || 'Delete failed');
          }
        } catch (err) {
          console.error(err);
          notifyError('Error deleting class');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  // DataTable Columns Definition
  const classColumns = [
    {
      header: 'CLASS / GRADE',
      accessor: 'class_name',
      className: 'font-extrabold text-slate-900 dark:text-white',
      render: (cls) => (
        <Link 
          href={`/classes/${cls.uuid || cls.id}`} 
          className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
          title="Click to open visual classroom layout"
        >
          <span>{cls.class_name}</span>
          <Eye size={14} className="opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity" />
        </Link>
      )
    },
    {
      header: 'SECTION',
      accessor: 'section',
      render: (cls) => (
        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
          Section {cls.section}
        </span>
      )
    },
    {
      header: 'CLASS TEACHER',
      accessor: 'classTeacher',
      className: 'font-semibold text-slate-700 dark:text-slate-300',
      render: (cls) => cls.classTeacher ? cls.classTeacher.name : <span className="text-slate-400 italic">Unassigned</span>
    },
    {
      header: 'ROOM #',
      accessor: 'room_number',
      className: 'font-medium text-slate-600 dark:text-slate-400',
      render: (cls) => cls.room_number ? `Room ${cls.room_number}` : 'N/A'
    },
    {
      header: 'MAX CAPACITY',
      accessor: 'capacity',
      className: 'font-semibold text-slate-600 dark:text-slate-400',
      render: (cls) => `${cls.capacity || 40} Students`
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (cls) => (
        <Badge variant={cls.status === 'active' ? 'success' : 'neutral'} className="font-bold uppercase text-[10px]">
          {cls.status}
        </Badge>
      )
    },
    {
      header: 'ACTIONS',
      className: 'text-right',
      render: (cls) => (
        <div className="flex items-center justify-end space-x-2">
          <Tooltip content="View Layout" position="top">
            <Link href={`/classes/${cls.uuid || cls.id}`}>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
              >
                <Eye size={14} />
              </button>
            </Link>
          </Tooltip>

          <Tooltip content="Edit Class" position="top">
            <button
              type="button"
              onClick={() => handleOpenEdit(cls)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
            >
              <Edit3 size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Delete Class" position="top" variant="danger">
            <button
              type="button"
              onClick={() => handleDelete(cls)}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 text-slate-600 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  // Metrics & Pagination calculation
  const totalClassesCount = classes.length;
  const totalSectionsCount = classes.reduce((acc, curr) => acc + 1, 0);
  const assignedTeachersCount = classes.filter(c => c.class_teacher_id || c.classTeacher).length;

  const totalPages = Math.ceil(totalClassesCount / pageSize) || 1;
  const paginatedClasses = classes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Extract IDs of teachers who are already assigned as Class Teacher in other classes
  const assignedTeacherIds = classes
    .filter(c => c.class_teacher_id && (!editingClass || c.id !== editingClass.id))
    .map(c => c.class_teacher_id.toString());

  const availableTeachers = teachers.filter(t => !assignedTeacherIds.includes(t.id.toString()));

  const teacherOptions = [
    { label: 'Unassigned (No Class Teacher)', value: '' },
    ...availableTeachers.map(t => ({ label: `${t.name} (${t.subject || 'Faculty'})`, value: t.id.toString() }))
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      {/* Top Banner - Single Primary Light/Soft Card Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/60 text-slate-900 dark:text-white p-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-bold mb-1 text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Academic Master Scoping
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Class & Section Management</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">
            Configure school grades, sections, room numbers, and assign Class Teachers.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button 
            variant="outline"
            onClick={fetchClasses}
            title="Refresh List"
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button 
            onClick={handleOpenAdd}
            icon={Plus}
            className="shadow-md shadow-primary-500/20"
          >
            Add New Class
          </Button>
        </div>
      </div>

      {/* Analytics Counter Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Class Units</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{loading ? '...' : totalClassesCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </Card>
        
        <Card className="p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Class Teachers</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{loading ? '...' : assignedTeachersCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </Card>

        <Card className="p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sections</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{loading ? '...' : totalSectionsCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <School size={20} />
          </div>
        </Card>
      </div>

      {/* 📋 Classes Directory Table */}
      <Card title={`Class Records (${totalClassesCount})`} icon={BookOpen} subtitle="Real-time list of grades, sections, and class teachers">
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by grade or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Active Only', value: 'active' },
                { label: 'Inactive Only', value: 'inactive' }
              ]}
              searchable={false}
            />
          </div>
        </div>

        <DataTable
          columns={classColumns}
          data={paginatedClasses}
          loading={loading}
          skeletonRow={SkeletonClassRow}
          skeletonRows={5}
          emptyMessage="No classes found matching your search. Click '+ Add New Class' to create one."
          emptyIcon={BookOpen}
          pagination={{
            currentPage,
            pageSize,
            totalRecords: totalClassesCount,
            totalPages,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize
          }}
        />
      </Card>

      {/* CREATE / EDIT CLASS DRAWER MODAL */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 pb-4 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-primary-600" />
                  {editingClass ? 'Edit Class & Section' : 'Create New Class & Section'}
                </h2>
                <p className="text-xs text-slate-500">Configure grade name, section, capacity, and class teacher.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                <Input
                  label="Class / Grade Name"
                  placeholder="e.g. Grade 10 or Class 9"
                  value={formData.class_name}
                  error={formErrors.class_name}
                  onChange={(e) => {
                    setFormData({ ...formData, class_name: e.target.value });
                    setFormErrors((prev) => ({ ...prev, class_name: '' }));
                  }}
                />

                <Input
                  label="Section"
                  placeholder="e.g. A, B, C"
                  value={formData.section}
                  error={formErrors.section}
                  onChange={(e) => {
                    setFormData({ ...formData, section: e.target.value });
                    setFormErrors((prev) => ({ ...prev, section: '' }));
                  }}
                />

                <Select
                  label="Assigned Class Teacher"
                  value={formData.class_teacher_id}
                  onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
                  options={teacherOptions}
                  searchable={true}
                />

                <Input
                  label="Room Number"
                  placeholder="e.g. Room 204"
                  value={formData.room_number}
                  error={formErrors.room_number}
                  onChange={(e) => {
                    setFormData({ ...formData, room_number: e.target.value });
                    setFormErrors((prev) => ({ ...prev, room_number: '' }));
                  }}
                />

                <Input
                  label="Student Capacity"
                  type="number"
                  value={formData.capacity}
                  error={formErrors.capacity}
                  onChange={(e) => {
                    setFormData({ ...formData, capacity: e.target.value });
                    setFormErrors((prev) => ({ ...prev, capacity: '' }));
                  }}
                />
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end space-x-3 p-4 sm:px-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
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
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Class'}
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
