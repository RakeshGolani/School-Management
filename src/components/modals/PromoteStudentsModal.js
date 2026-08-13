'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, X, AlertCircle, CheckSquare, Square, Check, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { promoteStudentsAction } from '@/actions/studentActions';
import { notifySuccess, notifyError } from '@/lib/notify';

// Helper to resolve student photo image URL
const getStudentPhotoUrl = (student) => {
  return student?.image_url || student?.photo || null;
};

/**
 * Reusable Promote Students Modal Component
 * Used across Students Directory and Class Details Page.
 */
export default function PromoteStudentsModal({
  isOpen,
  onClose,
  activeYear,
  academicYears = [],
  initialStudents = [],
  classOptions = [],
  showClassFilter = true,
  title = "Promote Students",
  subtitle = "Move students to the next academic session",
  onSuccess
}) {
  const [targetYearId, setTargetYearId] = useState('');
  const [bulkTargetGrade, setBulkTargetGrade] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [promotionList, setPromotionList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [promotionResult, setPromotionResult] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Sync initial student list when modal opens
  useEffect(() => {
    if (isOpen) {
      setPromotionList(
        initialStudents.map(s => ({
          student_id: s.student_id || s.id,
          student_name: s.student_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          admission_number: s.admission_number || `ADM-${s.student_id || s.id}`,
          current_grade: s.session_grade || s.current_grade || s.grade || '',
          current_section: s.session_section || s.current_section || s.section || 'A',
          new_grade: s.new_grade || s.session_grade || s.current_grade || s.grade || '',
          new_section: s.new_section || s.session_section || s.current_section || s.section || 'A',
          photo: s.photo || s.image_url || null,
          status: s.status || 'PROMOTED',
          checked: true
        }))
      );
      setTargetYearId('');
      setBulkTargetGrade('');
      setGradeFilter('all');
      setSearchQuery('');
      setPromotionResult(null);
    }
  }, [isOpen, initialStudents]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Filter promotion list by selected grade filter and search query
  const visibleList = promotionList.filter(s => {
    const matchesGrade = !gradeFilter || gradeFilter === 'all' || s.current_grade === gradeFilter || String(s.current_grade).includes(gradeFilter);
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || (s.student_name || '').toLowerCase().includes(q) || (s.admission_number || '').toLowerCase().includes(q);
    return matchesGrade && matchesQuery;
  });

  const handleToggleStudent = (studentId, checked) => {
    setPromotionList(prev => prev.map(s => s.student_id === studentId ? { ...s, checked } : s));
  };

  const handleFieldChange = (studentId, field, value) => {
    setPromotionList(prev => prev.map(s => s.student_id === studentId ? { ...s, [field]: value } : s));
  };

  const handleSelectAll = () => {
    const visibleIds = visibleList.map(s => s.student_id);
    const shouldCheck = !visibleList.every(s => s.checked);
    setPromotionList(prev => prev.map(s => visibleIds.includes(s.student_id) ? { ...s, checked: shouldCheck } : s));
  };

  const handleBulkSetGrade = (val) => {
    setBulkTargetGrade(val);
    if (val) {
      const visibleIds = visibleList.filter(s => s.checked).map(s => s.student_id);
      setPromotionList(prev => prev.map(s => visibleIds.includes(s.student_id) ? { ...s, new_grade: val } : s));
    }
  };

  const handleSubmit = async () => {
    if (!targetYearId) {
      notifyError('Please select a target academic session.');
      return;
    }

    const selectedStudents = promotionList.filter(s => s.checked);
    if (selectedStudents.length === 0) {
      notifyError('Please select at least one student to promote.');
      return;
    }

    setSubmitting(true);
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
        if (onSuccess) onSuccess(res.data);
      } else {
        notifyError(res.message || 'Promotion failed');
      }
    } catch (err) {
      console.error(err);
      notifyError('Error executing promotion');
    } finally {
      setSubmitting(false);
    }
  };

  // Target Year Options (exclude current active session)
  const targetYearOptions = academicYears
    .filter(y => String(y.id) !== String(activeYear?.id))
    .map(y => ({ label: `${y.year_name} (${y.status})`, value: String(y.id) }));

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-primary-50 via-white to-primary-50/40 dark:from-slate-900 dark:to-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-10">
              {subtitle} {activeYear?.year_name ? <span>(From Session: <strong>{activeYear.year_name}</strong>)</span> : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Promotion Result Alert */}
          {promotionResult && (
            <div className="rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 space-y-2">
              <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                <Check size={16} /> Student Promotion Completed Successfully!
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-white dark:bg-slate-900 border border-emerald-200 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-semibold">✓ Promoted: {promotionResult.summary?.promoted}</span>
                <span className="bg-white dark:bg-slate-900 border border-amber-200 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full font-semibold">⚠ Detained: {promotionResult.summary?.detained}</span>
                <span className="bg-white dark:bg-slate-900 border border-indigo-200 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-semibold">⬆ Passed Out: {promotionResult.summary?.passedOut}</span>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Full-Width Filter By Current Class Row (Only rendered when showClassFilter is true) */}
            {showClassFilter && (
              <div className="w-full">
                <Select
                  label="Filter By Current Class"
                  value={gradeFilter}
                  onChange={e => setGradeFilter(e.target.value)}
                  options={[
                    { label: 'All Current Classes', value: 'all' },
                    ...classOptions
                  ]}
                  searchable={true}
                  clearable={true}
                  placeholder="All Current Classes"
                />
              </div>
            )}

            {/* 2-Column Grid for Target Academic Session and Bulk Set Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Select
                  label="Target Academic Session"
                  required
                  value={targetYearId}
                  onChange={e => setTargetYearId(e.target.value)}
                  options={[
                    { label: '— Select Next Session —', value: '' },
                    ...targetYearOptions
                  ]}
                  placeholder="Select next session"
                />
                {targetYearOptions.length === 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> Create next session first.
                  </p>
                )}
              </div>

              <div>
                <Select
                  label="Set Target Class for Selected"
                  value={bulkTargetGrade}
                  onChange={e => handleBulkSetGrade(e.target.value)}
                  options={[
                    { label: '— Bulk Set Target Class —', value: '' },
                    ...classOptions
                  ]}
                  searchable={true}
                  clearable={false}
                  placeholder="Bulk Set Target Class"
                />
              </div>
            </div>
          </div>

          {/* Select All & Search Bar Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-primary-50/60 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-slate-700 dark:text-slate-200 hover:text-primary-700 cursor-pointer flex items-center gap-2 font-bold text-xs shrink-0"
            >
              {visibleList.length > 0 && visibleList.every(s => s.checked) ? (
                <CheckSquare size={16} className="text-primary-600" />
              ) : (
                <Square size={16} className="text-slate-400" />
              )}
              <span>Select All ({visibleList.filter(s => s.checked).length}/{visibleList.length})</span>
            </button>

            {/* Real-time Student Search Bar */}
            <div className="relative flex-1 max-w-xs flex items-center">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student by name or admission #..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto px-1 pb-10 pt-1">
            {visibleList.map((s) => {
              const photoUrl = getStudentPhotoUrl(s);
              return (
                <div
                  key={s.student_id}
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                  style={{ background: s.checked ? 'rgba(37,99,235,0.03)' : '#f8fafc', borderColor: s.checked ? 'rgba(37,99,235,0.2)' : '#e2e8f0' }}
                >
                  {/* Checkbox */}
                  <button type="button" onClick={() => handleToggleStudent(s.student_id, !s.checked)} className="shrink-0 cursor-pointer">
                    {s.checked ? <CheckSquare size={16} className="text-primary-600" /> : <Square size={16} className="text-slate-400" />}
                  </button>

                  {/* Student Photo Image / Initials Fallback Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 p-0.5 shrink-0 overflow-hidden shadow-xs">
                    <div className="w-full h-full rounded-[10px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-white overflow-hidden">
                      {photoUrl ? (
                        <img src={photoUrl} alt={s.student_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{s.student_name?.[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Name + current class */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{s.student_name}</p>
                    <p className="text-[10px] text-slate-500">{s.admission_number} · Current: <strong>{s.current_grade || 'Grade 10'}</strong></p>
                  </div>

                  {/* Target grade dropdown */}
                  <div className="w-48 shrink-0">
                    <Select
                      value={s.new_grade}
                      onChange={e => handleFieldChange(s.student_id, 'new_grade', e.target.value)}
                      disabled={!s.checked}
                      options={classOptions}
                      searchable={true}
                      clearable={false}
                      placeholder="Next Grade Class"
                    />
                  </div>

                  {/* Status dropdown */}
                  <div className="w-36 shrink-0">
                    <Select
                      value={s.status}
                      onChange={e => handleFieldChange(s.student_id, 'status', e.target.value)}
                      disabled={!s.checked}
                      options={[
                        { label: 'Promoted (Passed)', value: 'PROMOTED' },
                        { label: 'Detained (Repeat)', value: 'DETAINED' },
                        { label: 'Passed Out (Exit)', value: 'PASSED_OUT' }
                      ]}
                      searchable={false}
                      clearable={false}
                      placeholder="Status"
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            variant="primary"
            icon={GraduationCap}
            loading={submitting}
            onClick={handleSubmit}
            disabled={submitting || !targetYearId || promotionList.filter(s => s.checked).length === 0}
          >
            Promote {promotionList.filter(s => s.checked).length} Students to Next Session
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
