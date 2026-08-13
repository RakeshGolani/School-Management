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
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  MapPin,
  User,
  Sparkles,
  Filter,
  Building
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Tooltip from '@/components/ui/Tooltip';
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

  // Scalability & Filtering States for Large Schools (60-100+ classes)
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [activeSelectedDay, setActiveSelectedDay] = useState('ALL'); // 'ALL' | 'MONDAY' | 'TUESDAY' ...
  const [expandedClasses, setExpandedClasses] = useState({});

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

  const fetchAllClassesTimetable = async (classList) => {
    try {
      if (!classList || classList.length === 0) return;
      const allPromises = classList.map(c => getClassTimetableAction(c.id, activeYear?.id));
      const results = await Promise.all(allPromises);
      let combined = [];
      results.forEach(res => {
        if (res.success && res.data) {
          combined = [...combined, ...res.data];
        }
      });
      setTimetable(combined);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [clsRes, tchRes, slotsRes] = await Promise.all([
        getClassesAction(),
        getTeachersAction(),
        getPeriodSlotsAction(activeYear?.id)
      ]);

      if (clsRes.success) {
        const clsData = clsRes.data || [];
        setClasses(clsData);
        if (clsData.length > 0) {
          setSelectedClassId(clsData[0].id.toString());
          fetchAllClassesTimetable(clsData);
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
    const currentClass = classes.find(c => String(c.id) === String(selectedClassId));
    const defaultRoom = currentClass?.room_number ? `Room ${currentClass.room_number}` : '';

    if (existingData) {
      setAllocateForm({
        id: existingData.id,
        day_of_week: dayKey,
        period_slot_id: slotId,
        subject_name: existingData.subject_name || '',
        teacher_id: existingData.teacher_id ? existingData.teacher_id.toString() : '',
        room_number: existingData.room_number || defaultRoom
      });
    } else {
      setAllocateForm({
        id: null,
        day_of_week: dayKey,
        period_slot_id: slotId,
        subject_name: '',
        teacher_id: teachers.length > 0 ? teachers[0].id.toString() : '',
        room_number: defaultRoom
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
        fetchAllClassesTimetable(classes);
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
            fetchAllClassesTimetable(classes);
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

  // Extract unique Grade names for quick filter pills (e.g., Grade 1, Grade 5, Grade 10)
  const uniqueGrades = Array.from(new Set(classes.map(c => {
    const name = c.class_name || c.name || '';
    return name.trim();
  }))).filter(Boolean);

  // Filter classes dynamically based on search query or grade pill selection
  const filteredClasses = classes.filter(cls => {
    const clsName = (cls.class_name || cls.name || '').toLowerCase();
    const secName = (cls.section || '').toLowerCase();
    const roomNum = (cls.room_number || '').toLowerCase();
    const query = classSearchTerm.toLowerCase().trim();

    const matchesSearch = !query || 
      clsName.includes(query) || 
      secName.includes(query) || 
      roomNum.includes(query) || 
      `room ${roomNum}`.includes(query) || 
      `section ${secName}`.includes(query);

    const matchesGrade = selectedGradeFilter === 'ALL' || (cls.class_name || cls.name || '').trim() === selectedGradeFilter;

    return matchesSearch && matchesGrade;
  });

  const toggleExpandClass = (clsId) => {
    setExpandedClasses(prev => {
      // Default is collapsed (false), so if key is undefined, currentVal is false, and flipping makes it true immediately on 1st click
      const currentVal = prev[clsId] === true;
      return {
        ...prev,
        [clsId]: !currentVal
      };
    });
  };

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
          <div className="h-28 p-1">
            {cellData ? (
              <div className="h-full p-2.5 rounded-xl bg-gradient-to-b from-primary-50/90 to-white border border-primary-200/90 flex flex-col justify-between group relative shadow-2xs hover:shadow-md hover:border-primary-400 transition-all text-left">
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-xs tracking-tight truncate flex items-center justify-between">
                    <span className="truncate">{cellData.subject_name}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-800 bg-primary-100/70 border border-primary-200/60 px-2 py-0.5 rounded-md max-w-full truncate">
                    <UserCheck size={11} className="text-primary-600 shrink-0" />
                    <span className="truncate">
                      {cellData.teacher 
                        ? (cellData.teacher.name || `${cellData.teacher.first_name || ''} ${cellData.teacher.last_name || ''}`.trim()) 
                        : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-1">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {cellData.room_number ? (cellData.room_number.startsWith('Room') ? cellData.room_number : `Room ${cellData.room_number}`) : 'Classroom'}
                  </span>
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                    <Tooltip content="Edit Allocation" position="top">
                      <button
                        onClick={() => handleOpenAllocate(day.key, slot.id, cellData)}
                        className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                      >
                        <Edit3 size={12} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete Allocation" position="top" variant="danger">
                      <button
                        onClick={() => handleDeleteAllocation(cellData.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleOpenAllocate(day.key, slot.id)}
                className="w-full h-full min-h-[78px] rounded-xl border border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50/40 text-slate-400 hover:text-primary-600 flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center transition">
                  <Plus size={13} className="group-hover:text-primary-600" />
                </div>
                <span className="text-[11px] font-medium">Assign</span>
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
          {/* Complete Master Class Header & Control Bar (Sticky Top) */}
          <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-md space-y-3.5">
            
            {/* Top Row: Master Title & Quick Metrics & Add Slot Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-600 text-white shadow-xs flex items-center justify-center shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Master Class Timetables</h3>
                  <p className="text-slate-500 text-xs">All classes, section periods & teacher allocations in one view.</p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <BookOpen size={14} className="text-primary-600" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{classes.length} Classes</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <Clock size={14} className="text-primary-600" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{periodSlots.length} Slots</span>
                </div>

                <Button
                  variant="primary"
                  icon={Plus}
                  size="sm"
                  onClick={() => {
                    setSlotForm({ id: null, period_number: periodSlots.length + 1, title: `Period ${periodSlots.length + 1}`, start_time: '08:00', end_time: '08:45', is_break: false });
                    setShowSlotModal(true);
                  }}
                  className="whitespace-nowrap py-1.5 text-xs"
                >
                  Add Slot
                </Button>
              </div>
            </div>

            {/* Middle Row: Day Selector Tabs, Accordion Actions & Search Input */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Left: Day Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto scrollbar-none shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSelectedDay('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    activeSelectedDay === 'ALL'
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  Full Week
                </button>
                {DAYS.map(day => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => setActiveSelectedDay(day.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      activeSelectedDay === day.key
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              {/* Middle: Live Search Input (Vertically Centered Search Icon & Increased Height) */}
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  placeholder="Search class, section or room (e.g. Grade 1, Sec A, 102)..."
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-8 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-2xs"
                />
                {classSearchTerm && (
                  <button
                    onClick={() => setClassSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Right: Expand / Collapse All Quick Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allOpen = {};
                    classes.forEach(c => { allOpen[c.id] = true; });
                    setExpandedClasses(allOpen);
                  }}
                  className="text-xs py-2 px-3.5 font-bold"
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allClosed = {};
                    classes.forEach(c => { allClosed[c.id] = false; });
                    setExpandedClasses(allClosed);
                  }}
                  className="text-xs py-2 px-3.5 font-bold"
                >
                  Collapse All
                </Button>
              </div>
            </div>

            {/* Bottom Row: Quick Grade Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-thin border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 shrink-0 flex items-center gap-1">
                <Filter size={12} /> Grade:
              </span>
              <button
                type="button"
                onClick={() => setSelectedGradeFilter('ALL')}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                  selectedGradeFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                All ({classes.length})
              </button>
              {uniqueGrades.map(grade => {
                const count = classes.filter(c => (c.class_name || c.name || '').trim() === grade).length;
                const isSelected = selectedGradeFilter === grade;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGradeFilter(grade)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {grade} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Grade & Section Cards with Full Weekly Timetable Matrix */}
          <div className="space-y-6">
            {filteredClasses.length === 0 ? (
              <Card className="p-8 text-center text-slate-400 space-y-2">
                <Search size={28} className="mx-auto text-slate-300" />
                <div className="font-bold text-slate-700">No matching classes found</div>
                <p className="text-xs">No grade or room number matches your search term.</p>
              </Card>
            ) : (
              filteredClasses.map((cls) => {
                const clsName = cls.class_name || cls.name || `Class ${cls.id}`;
                const secName = cls.section ? `Section ${cls.section}` : '';
                const roomInfo = cls.room_number ? (cls.room_number.startsWith('Room') ? cls.room_number : `Room ${cls.room_number}`) : 'Classroom';
                const classTimetableEntries = timetable.filter(t => String(t.class_id) === String(cls.id));
                const teacherObj = cls.classTeacher || cls.class_teacher || cls.teacher || (cls.class_teacher_id || cls.teacher_id ? teachers.find(t => String(t.id) === String(cls.class_teacher_id || cls.teacher_id)) : null);
                const teacherName = teacherObj 
                  ? (teacherObj.name || `${teacherObj.first_name || ''} ${teacherObj.last_name || ''}`.trim())
                  : (cls.class_teacher_name || cls.teacher_name || 'Not Assigned');
                const isExpanded = expandedClasses[cls.id] === true; // Default collapsed for clean view

                // Day filter check for columns display
                const displayDays = activeSelectedDay === 'ALL'
                  ? DAYS
                  : DAYS.filter(d => d.key === activeSelectedDay);

                return (
                  <div 
                    key={cls.id} 
                    className={`overflow-hidden border-none transition-all duration-300 rounded-3xl ${
                      isExpanded 
                        ? 'bg-white dark:bg-slate-900 shadow-md shadow-primary-500/15 ring-2 ring-primary-500/20' 
                        : 'bg-white dark:bg-slate-900 shadow-xs shadow-slate-200 dark:shadow-none hover:shadow-md hover:shadow-primary-500/10'
                    }`}
                  >
                    {/* Card Header Accordion Clickable Banner (Spacious Premium Design) */}
                    <div 
                      onClick={() => toggleExpandClass(cls.id)}
                      className={`py-4 px-6 cursor-pointer flex flex-wrap items-center justify-between gap-4 transition-colors ${
                        isExpanded
                          ? 'bg-gradient-to-r from-primary-50/80 via-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-primary-100 dark:border-slate-800'
                          : 'bg-white hover:bg-slate-50/90 dark:bg-slate-900 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 transition-transform ${
                          isExpanded 
                            ? 'bg-primary-600 text-white shadow-sm scale-105' 
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight">{clsName} <span className="text-primary-600 font-extrabold">({secName})</span></h3>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
                              <MapPin size={12} className="text-primary-600 shrink-0" />
                              {roomInfo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                              <User size={13} className="text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{teacherName}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl border transition shadow-2xs ${
                          classTimetableEntries.length > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/40'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {classTimetableEntries.length} Periods Assigned
                        </span>
                        <div className={`p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-transform duration-200 ${isExpanded ? 'bg-primary-100/70 text-primary-700 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Class Specific Timetable Table Matrix (Collapsible Body) */}
                    {isExpanded && (
                      <div className="overflow-x-auto animate-fadeIn">
                      <DataTable
                        columns={[
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
                          ...displayDays.map(day => ({
                            header: day.label,
                            className: 'min-w-[140px] text-center border-r border-slate-200',
                            render: (slot) => {
                              const cellData = classTimetableEntries.find(t => t.day_of_week === day.key && t.period_slot_id === slot.id);

                              if (slot.is_break) {
                                return (
                                  <div className="py-4 text-center bg-amber-50/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-extrabold text-xs rounded-xl border border-amber-200/60 dark:border-amber-900/40 shadow-2xs">
                                    Break
                                  </div>
                                );
                              }

                              return (
                                <div className="h-28 p-1.5">
                                  {cellData ? (
                                    <div className="h-full p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 flex flex-col justify-between group/cell relative transition-all text-left">
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-extrabold text-primary-700 dark:text-primary-300 text-xs tracking-tight truncate bg-primary-50 dark:bg-primary-950/80 px-2.5 py-0.5 rounded-lg">
                                            {cellData.subject_name}
                                          </span>
                                        </div>
                                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 pt-0.5 max-w-full truncate">
                                          <UserCheck size={11} className="text-primary-600 shrink-0" />
                                          <span className="truncate">
                                            {cellData.teacher 
                                              ? (cellData.teacher.name || `${cellData.teacher.first_name || ''} ${cellData.teacher.last_name || ''}`.trim()) 
                                              : 'Unassigned'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1">
                                        <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                                          {cellData.room_number ? (cellData.room_number.startsWith('Room') ? cellData.room_number : `Room ${cellData.room_number}`) : roomInfo}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-80 group-hover/cell:opacity-100">
                                          <Tooltip content="Edit Allocation" position="top">
                                            <button
                                              onClick={() => {
                                                setSelectedClassId(cls.id.toString());
                                                handleOpenAllocate(day.key, slot.id, cellData);
                                              }}
                                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition"
                                            >
                                              <Edit3 size={12} />
                                            </button>
                                          </Tooltip>

                                          <Tooltip content="Delete Allocation" position="top" variant="danger">
                                            <button
                                              onClick={() => {
                                                setSelectedClassId(cls.id.toString());
                                                handleDeleteAllocation(cellData.id);
                                              }}
                                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </Tooltip>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedClassId(cls.id.toString());
                                        handleOpenAllocate(day.key, slot.id);
                                      }}
                                      className="w-full h-full min-h-[72px] rounded-2xl border border-dashed border-slate-200/90 dark:border-slate-800 hover:border-primary-400 hover:bg-primary-50/40 text-slate-400 hover:text-primary-600 flex flex-col items-center justify-center gap-1 transition-all group/btn"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover/btn:bg-primary-100 flex items-center justify-center transition">
                                        <Plus size={13} className="group-hover/btn:text-primary-600" />
                                      </div>
                                      <span className="text-[11px] font-extrabold">Assign</span>
                                    </button>
                                  )}
                                </div>
                              );
                            }
                          }))
                        ]}
                        data={periodSlots}
                        loading={loading}
                        emptyMessage="No period slots configured yet."
                      />
                    </div>
                  )}
                  </div>
                );
              })
            )}
          </div>
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
                <Input
                  label="Start Time"
                  type="time"
                  value={slotForm.start_time}
                  onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                  required
                />
                <Input
                  label="End Time"
                  type="time"
                  value={slotForm.end_time}
                  onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                  required
                />
              </div>

              <Checkbox
                id="is_break"
                label="Mark as Break / Lunch"
                checked={slotForm.is_break}
                onChange={(e) => setSlotForm({ ...slotForm, is_break: e.target.checked })}
                className="pt-2"
              />

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
