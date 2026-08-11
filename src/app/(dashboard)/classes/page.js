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
import { SkeletonClassRow } from '@/components/ui/Skeleton';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  getClassesAction, 
  createClassAction, 
  updateClassAction, 
  deleteClassAction 
} from '@/actions/classActions';
import { getTeachersAction } from '@/actions/teacherActions';

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

  // Metrics
  const totalClassesCount = classes.length;
  const totalSectionsCount = classes.reduce((acc, curr) => acc + 1, 0);
  const assignedTeachersCount = classes.filter(c => c.class_teacher_id || c.classTeacher).length;

  const teacherOptions = [
    { label: 'Unassigned (No Class Teacher)', value: '' },
    ...teachers.map(t => ({ label: `${t.name} (${t.subject || 'Faculty'})`, value: t.id.toString() }))
  ];

  return (
    <div className="space-y-6 pb-12">
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
          <button 
            type="button"
            onClick={fetchClasses} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button 
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all shadow-md shadow-primary-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add New Class</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Class Units</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {totalClassesCount}
              </h3>
            </div>
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl dark:bg-primary-950/50 dark:text-primary-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Class Teachers</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {assignedTeachersCount}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/50 dark:text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sections</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {totalSectionsCount}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/50 dark:text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Control Panel & Table */}
      <Card className="p-6 space-y-6 shadow-xs rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* Classes Listing Table */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Class / Grade</th>
                <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Class Teacher</th>
                <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Room #</th>
                <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Max Capacity</th>
                <th className="px-6 py-3.5 text-left font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <>
                  <SkeletonClassRow />
                  <SkeletonClassRow />
                  <SkeletonClassRow />
                  <SkeletonClassRow />
                  <SkeletonClassRow />
                </>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No classes found. Click "+ Add New Class" to create one.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                      <Link 
                        href={`/classes/${cls.id}`} 
                        className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group"
                        title="Click to open visual classroom layout"
                      >
                        <span>{cls.class_name}</span>
                        <Eye size={14} className="opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                        Section {cls.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {cls.classTeacher ? cls.classTeacher.name : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                      {cls.room_number ? `Room ${cls.room_number}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">
                      {cls.capacity || 40} Students
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={cls.status === 'active' ? 'success' : 'neutral'} className="font-bold uppercase text-[10px]">
                        {cls.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/classes/${cls.id}`}>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
                          title="View Classroom Layout & Seating"
                        >
                          <Eye size={14} />
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer"
                        title="Edit Class Details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls)}
                        className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Class Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT CLASS DRAWER MODAL */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
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

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
