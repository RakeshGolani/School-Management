'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Clock, 
  Plus, 
  Calendar, 
  UserCheck, 
  BookOpen, 
  AlertTriangle, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  CalendarDays
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { notifySuccess, notifyError } from '@/lib/notify';
import { confirmCustomAction } from '@/lib/commonHandlers';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { getClassesAction } from '@/actions/classActions';
import { getTeachersAction } from '@/actions/teacherActions';
import { 
  getPeriodSlotsAction, 
  savePeriodSlotAction, 
  deletePeriodSlotAction,
  allocateSlotAction,
  deleteAllocationAction,
  getClassTimetableAction
} from '@/actions/timetableActions';

const DAYS = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' }
];

export default function TimetablePage() {
  const { activeYear } = useAcademicYear();
  const [activeTab, setActiveTab] = useState('ALLOCATION'); // 'SLOTS' | 'ALLOCATION'
  
  // Data States
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [periodSlots, setPeriodSlots] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Forms
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    id: null,
    period_number: 1,
    title: 'Period 1',
    start_time: '08:00',
    end_time: '08:45',
    is_break: false
  });

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    id: null,
    day_of_week: 'MONDAY',
    period_slot_id: '',
    subject_name: '',
    teacher_id: '',
    room_number: ''
  });
  const [conflictError, setConflictError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [activeYear?.id]);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassTimetable(selectedClassId);
    } else {
      setTimetable([]);
    }
  }, [selectedClassId, activeYear?.id]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [clsRes, tchRes, slotsRes] = await Promise.all([
        getClassesAction(),
        getTeachersAction(),
        getPeriodSlotsAction(activeYear?.id)
      ]);

      if (clsRes.success) {
        setClasses(clsRes.data || []);
        if (clsRes.data && clsRes.data.length > 0) {
          setSelectedClassId(clsRes.data[0].id.toString());
        }
      }

      if (tchRes.success) {
        setTeachers(tchRes.data || []);
      }

      if (slotsRes.success) {
        setPeriodSlots(slotsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to load timetable initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTimetable = async (classId) => {
    try {
      const res = await getClassTimetableAction(classId, activeYear?.id);
      if (res.success) {
        setTimetable(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: null,
    loading: false
  });

  // --- Slot Handlers ---
  const handleSaveSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await savePeriodSlotAction({
        ...slotForm,
        academic_year_id: activeYear?.id
      });
      if (res.success) {
        notifySuccess(res.message);
        setShowSlotModal(false);
        const slotsRes = await getPeriodSlotsAction(activeYear?.id);
        if (slotsRes.success) setPeriodSlots(slotsRes.data || []);
      } else {
        notifyError(res.message);
      }
    } catch (err) {
      notifyError('Error saving period slot');
    }
  };

  const handleDeleteSlot = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Period Slot Delete',
      message: 'Are you sure you want to delete this period slot? This action will unassign linked periods.',
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await deletePeriodSlotAction(id);
          if (res.success) {
            notifySuccess(res.message);
            setPeriodSlots(periodSlots.filter(s => s.id !== id));
          } else {
            notifyError(res.message);
          }
        } catch (err) {
          notifyError('Error deleting period slot');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  // --- Allocation Handlers ---
  const handleOpenAllocate = (dayKey, slotId, existingData = null) => {
    setConflictError('');
    if (existingData) {
      setAllocateForm({
        id: existingData.id,
        day_of_week: dayKey,
        period_slot_id: slotId,
        subject_name: existingData.subject_name || '',
        teacher_id: existingData.teacher_id ? existingData.teacher_id.toString() : '',
        room_number: existingData.room_number || ''
      });
    } else {
      setAllocateForm({
        id: null,
        day_of_week: dayKey,
        period_slot_id: slotId,
        subject_name: '',
        teacher_id: teachers.length > 0 ? teachers[0].id.toString() : '',
        room_number: ''
      });
    }
    setShowAllocateModal(true);
  };

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    setConflictError('');
    try {
      const res = await allocateSlotAction({
        ...allocateForm,
        class_id: selectedClassId,
        academic_year_id: activeYear?.id
      });

      if (res.success) {
        notifySuccess(res.message);
        setShowAllocateModal(false);
        fetchClassTimetable(selectedClassId);
      } else {
        setConflictError(res.message);
        notifyError(res.message);
      }
    } catch (err) {
      notifyError('Failed to allocate period slot');
    }
  };

  const handleDeleteAllocation = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Period Allocation',
      message: 'Are you sure you want to unassign this period slot?',
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await deleteAllocationAction(id);
          if (res.success) {
            notifySuccess('Period unallocated');
            fetchClassTimetable(selectedClassId);
          } else {
            notifyError(res.message);
          }
        } catch (err) {
          notifyError('Error unallocating period');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  const getCellData = (dayKey, slotId) => {
    return timetable.find(t => t.day_of_week === dayKey && t.period_slot_id === slotId);
  };

  // Class options for Select2 dropdown
  const classOptions = classes.map(c => {
    const className = c.class_name || c.name || `Class ${c.id}`;
    const sectionName = c.section ? `- Section ${c.section}` : '';
    return {
      value: c.id.toString(),
      label: `${className} ${sectionName}`.trim()
    };
  });

  // Teacher options for modal select dropdown
  const teacherOptions = teachers.map(t => {
    const name = t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Teacher';
    const email = t.email ? `(${t.email})` : '';
    return {
      value: t.id.toString(),
      label: `${name} ${email}`.trim()
    };
  });

  // Columns definition for DataTable component
  const matrixColumns = [
    {
      header: 'Time / Period',
      className: 'w-36 font-bold bg-slate-50/80 border-r border-slate-200 text-slate-800',
      render: (slot) => (
        <div>
          <div className="text-xs">{slot.title}</div>
          <div className="text-[11px] text-slate-400 font-normal mt-0.5">{slot.start_time} - {slot.end_time}</div>
        </div>
      )
    },
    ...DAYS.map(day => ({
      header: day.label,
      className: 'min-w-[140px] text-center border-r border-slate-200',
      render: (slot) => {
        const cellData = getCellData(day.key, slot.id);

        if (slot.is_break) {
          return (
            <div className="py-6 text-center bg-amber-50/30 text-amber-700 font-semibold text-xs rounded-lg">
              Break
            </div>
          );
        }

        return (
          <div className="h-24 p-1">
            {cellData ? (
              <div className="h-full p-2.5 rounded-xl bg-primary-50/60 border border-primary-100 flex flex-col justify-between group relative hover:shadow-2xs transition text-left">
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">{cellData.subject_name}</div>
                  <div className="text-slate-600 font-medium text-[11px] flex items-center gap-1 mt-1">
                    <UserCheck size={12} className="text-primary-600 shrink-0" />
                    <span className="truncate">
                      {cellData.teacher 
                        ? (cellData.teacher.name || `${cellData.teacher.first_name || ''} ${cellData.teacher.last_name || ''}`.trim()) 
                        : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-primary-100">
                  <span className="text-[10px] text-primary-600 font-bold">{cellData.room_number ? `Room ${cellData.room_number}` : ''}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAllocate(day.key, slot.id, cellData)}
                      className="p-1 text-slate-400 hover:text-primary-600 rounded transition"
                      title="Edit"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteAllocation(cellData.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleOpenAllocate(day.key, slot.id)}
                className="w-full h-full min-h-[70px] rounded-xl border border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50/30 text-slate-400 hover:text-primary-600 flex flex-col items-center justify-center gap-1 transition"
              >
                <Plus size={15} />
                <span className="text-[11px]">Assign</span>
              </button>
            )}
          </div>
        );
      }
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 🌟 Standard Light Header Banner matching Attendance/Teachers design */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-primary-50/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <Badge variant="emerald" dot>Timetable & Period Master</Badge>
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
            <Clock className="text-primary-600" size={24} /> Teacher Period Management
          </h1>
          <p className="text-slate-500 text-xs">
            Design period timings, allocate classes to teachers, prevent period clashes, and manage substitute proxy allocations easily.
          </p>
        </div>

        {/* Buttons with standard design */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'ALLOCATION' ? 'primary' : 'secondary'}
            icon={Calendar}
            onClick={() => setActiveTab('ALLOCATION')}
          >
            Timetable Grid
          </Button>
          <Button
            variant={activeTab === 'SLOTS' ? 'primary' : 'secondary'}
            icon={Clock}
            onClick={() => setActiveTab('SLOTS')}
          >
            Period Slots
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'SLOTS' ? (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Period Slots Configuration</h3>
              <p className="text-xs text-slate-500">Configure period start/end timings and lunch breaks.</p>
            </div>
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={() => {
                setSlotForm({ id: null, period_number: periodSlots.length + 1, title: `Period ${periodSlots.length + 1}`, start_time: '08:00', end_time: '08:45', is_break: false });
                setShowSlotModal(true);
              }}
            >
              Add Period Slot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {periodSlots.map((slot) => (
              <div key={slot.id} className={`p-4 rounded-xl border ${slot.is_break ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50/80 border-slate-200/90'} flex items-center justify-between shadow-2xs`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-lg ${slot.is_break ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'} flex items-center justify-center font-bold text-xs`}>
                    #{slot.period_number}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      {slot.title}
                      {slot.is_break && <Badge variant="warning" className="text-[10px]">Break</Badge>}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {slot.start_time} - {slot.end_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => {
                      setSlotForm(slot);
                      setShowSlotModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-200/60 rounded-lg transition"
                    title="Edit Slot"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 rounded-lg transition"
                    title="Delete Slot"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Class Selector Bar with Reusable Select Component & Rich Quick Action Bar */}
          <div className="p-4 bg-gradient-to-r from-slate-50 via-white to-primary-50/30 border border-slate-200/90 dark:border-slate-800 shadow-2xs rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Class Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
              <div className="w-full sm:w-72">
                <Select
                  placeholder="Select Class & Section"
                  options={classOptions}
                  value={selectedClassId}
                  onChange={(val) => {
                    const value = val?.target ? val.target.value : val;
                    setSelectedClassId(value);
                  }}
                  className="w-full"
                  searchable={true}
                  clearable={false}
                />
              </div>
            </div>

            {/* Right Side: Filled with Stats & Quick Actions */}
            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <CalendarDays size={16} className="text-primary-600" />
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Allocated</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">{timetable.length} Periods</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <Clock size={16} className="text-primary-600" />
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Timings</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-100">{periodSlots.length} Slots</span>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-900 shadow-2xs text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <Check size={16} className="text-emerald-600" />
                <span>Engine Active</span>
              </div>

              <Button
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setSlotForm({ id: null, period_number: periodSlots.length + 1, title: `Period ${periodSlots.length + 1}`, start_time: '08:00', end_time: '08:45', is_break: false });
                  setShowSlotModal(true);
                }}
                className="whitespace-nowrap"
              >
                Add Slot
              </Button>
            </div>
          </div>

          {/* Timetable Matrix rendered via Reusable DataTable Component */}
          <Card className="p-0 overflow-hidden border border-slate-200 shadow-2xs rounded-xl">
            <DataTable
              columns={matrixColumns}
              data={periodSlots}
              loading={loading}
              emptyMessage="No period slots configured yet."
            />
          </Card>
        </div>
      )}

      {/* Period Slot Modal */}
      {showSlotModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {slotForm.id ? 'Edit Period Slot' : 'Add Period Slot'}
              </h3>
              <button onClick={() => setShowSlotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Period Number</label>
                <Input
                  type="number"
                  value={slotForm.period_number}
                  onChange={(e) => setSlotForm({ ...slotForm, period_number: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Period 1 or Lunch Break"
                  value={slotForm.title}
                  onChange={(e) => setSlotForm({ ...slotForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Start Time</label>
                  <Input
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">End Time</label>
                  <Input
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_break"
                  checked={slotForm.is_break}
                  onChange={(e) => setSlotForm({ ...slotForm, is_break: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300"
                />
                <label htmlFor="is_break" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Mark as Break / Lunch
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowSlotModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Slot
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Allocation Modal */}
      {showAllocateModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Assign Period ({allocateForm.day_of_week})
              </h3>
              <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {conflictError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAllocation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Subject Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Mathematics, English"
                  value={allocateForm.subject_name}
                  onChange={(e) => setAllocateForm({ ...allocateForm, subject_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Select
                  label="Assign Teacher"
                  placeholder="Search and select teacher"
                  options={teacherOptions}
                  value={allocateForm.teacher_id}
                  onChange={(val) => {
                    const value = val?.target ? val.target.value : val;
                    setAllocateForm(prev => ({ ...prev, teacher_id: value }));
                  }}
                  searchable={true}
                  required
                />
              </div>

              <div>
                <Select
                  label="Room / Classroom / Lab (Optional)"
                  placeholder="Select Classroom / Lab"
                  options={classOptions}
                  value={allocateForm.room_number}
                  onChange={(val) => {
                    const value = val?.target ? val.target.value : val;
                    setAllocateForm(prev => ({ ...prev, room_number: value }));
                  }}
                  searchable={true}
                  clearable={true}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAllocateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Assign Period
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Reusable Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={confirmModal.loading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
