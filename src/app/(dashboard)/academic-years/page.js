'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Calendar,
  AlertCircle,
  X,
  Search,
  Filter
} from 'lucide-react';
import { useAcademicYear } from '@/context/AcademicYearContext';
import DataTable from '@/components/ui/DataTable';
import Skeleton from '@/components/ui/Skeleton';

export default function AcademicYearsPage() {
  const { academicYears, activeYear, loading: contextLoading, fetchAcademicYears, changeActiveYear } = useAcademicYear();

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({
    year_name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    status: 'UPCOMING',
    description: ''
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenModal = (year = null) => {
    if (year) {
      setEditingYear(year);
      setFormData({
        year_name: year.year_name || '',
        start_date: year.start_date || '',
        end_date: year.end_date || '',
        is_active: year.is_active || false,
        status: year.status || 'UPCOMING',
        description: year.description || ''
      });
    } else {
      setEditingYear(null);
      setFormData({
        year_name: '',
        start_date: '',
        end_date: '',
        is_active: false,
        status: 'UPCOMING',
        description: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const url = editingYear
        ? `http://localhost:5000/api/school/academic-years/${editingYear.id}`
        : 'http://localhost:5000/api/school/academic-years';

      const method = editingYear ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        showNotify(editingYear ? 'Academic Year updated successfully!' : 'Academic Year created successfully!');
        setModalOpen(false);
        await fetchAcademicYears();
      } else {
        showNotify(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showNotify('Failed to save academic year', 'error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleSetActive = async (year) => {
    try {
      const res = await fetch(`http://localhost:5000/api/school/academic-years/${year.id}/active`, {
        method: 'PATCH'
      });
      const data = await res.json();

      if (data.success) {
        showNotify(`Academic Year '${year.year_name}' set as Active!`);
        const activeYearObj = data.data?.activeYear || year;
        changeActiveYear(activeYearObj);
        await fetchAcademicYears();
      } else {
        showNotify(data.message || 'Failed to set active year', 'error');
      }
    } catch (err) {
      console.error('Set active error:', err);
      showNotify('Error setting active year', 'error');
    }
  };

  const handleDelete = async (year) => {
    const isProtected = year.is_active || year.status === 'ACTIVE' || year.status === 'COMPLETED';
    if (isProtected) {
      showNotify('Cannot delete ACTIVE or COMPLETED academic sessions to preserve historical data!', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete '${year.year_name}'?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/school/academic-years/${year.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        showNotify('Academic year deleted successfully');
        await fetchAcademicYears();
      } else {
        showNotify(data.message || 'Failed to delete', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotify('Error deleting academic year', 'error');
    }
  };

  // Filter & Search Logic
  const filteredYears = useMemo(() => {
    return academicYears.filter((year) => {
      const matchesSearch = 
        year.year_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (year.description && year.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'ALL' ? true :
        statusFilter === 'ACTIVE' ? year.is_active :
        year.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [academicYears, searchQuery, statusFilter]);

  // Paginated Data
  const paginatedYears = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredYears.slice(startIdx, startIdx + pageSize);
  }, [filteredYears, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredYears.length / pageSize) || 1;

  // DataTable Columns Definition
  const columns = [
    {
      header: 'Academic Year',
      accessor: 'year_name',
      render: (row) => (
        <div className="flex items-center space-x-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${row.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-primary-500'}`}></span>
          <span className="font-extrabold text-slate-900 text-xs">{row.year_name}</span>
        </div>
      )
    },
    {
      header: 'Start Date',
      accessor: 'start_date',
      render: (row) => <span className="text-slate-600 font-medium">{row.start_date}</span>
    },
    {
      header: 'End Date',
      accessor: 'end_date',
      render: (row) => <span className="text-slate-600 font-medium">{row.end_date}</span>
    },
    {
      header: 'Active Status',
      accessor: 'is_active',
      render: (row) => row.is_active ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={12} className="mr-1 text-emerald-600" /> ACTIVE YEAR
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
          Inactive
        </span>
      )
    },
    {
      header: 'Session Phase',
      accessor: 'status',
      render: (row) => (
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          row.status === 'ACTIVE' 
            ? 'bg-primary-50 text-primary-700 border border-primary-100'
            : row.status === 'UPCOMING'
            ? 'bg-amber-50 text-amber-700 border border-amber-100'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => {
        const isProtected = row.is_active || row.status === 'ACTIVE' || row.status === 'COMPLETED';

        return (
          <div className="flex items-center justify-end space-x-2">
            {!row.is_active && (
              <button
                onClick={() => handleSetActive(row)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition cursor-pointer"
                title="Set as Active Year"
              >
                Make Active
              </button>
            )}

            <button
              onClick={() => handleOpenModal(row)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Edit Year"
            >
              <Edit3 size={15} />
            </button>

            <button
              onClick={() => handleDelete(row)}
              disabled={isProtected}
              className={`p-2 rounded-xl transition ${
                isProtected
                  ? 'text-slate-200 cursor-not-allowed'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
              }`}
              title={isProtected ? "Cannot delete ACTIVE or COMPLETED session" : "Delete Year"}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      }
    }
  ];


  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-3 text-xs font-bold animate-slideDown ${
          notification.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-700' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Page Header Banner - Single Primary Light/Soft Card Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/60 text-slate-900 dark:text-white p-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-bold mb-1 text-xs uppercase tracking-wider">
            <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
            <span>Educational Session Master</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Academic Year Management</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">Configure academic sessions, set active school years, and manage session boundaries.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all shadow-md shadow-primary-600/20 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={16} className="text-white" />
          <span>+ Add Academic Year</span>
        </button>
      </div>

      {/* KPI Cards (With Skeleton Support) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Sessions</p>
            {contextLoading ? (
              <div className="h-6 w-12 bg-slate-200 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-xl font-black text-slate-900 mt-0.5">{academicYears.length}</p>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Academic Year</p>
            {contextLoading ? (
              <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-xl font-black text-emerald-700 mt-0.5">
                {activeYear ? activeYear.year_name : 'None Set'}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Upcoming Sessions</p>
            {contextLoading ? (
              <div className="h-6 w-12 bg-slate-200 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {academicYears.filter(y => y.status === 'UPCOMING').length}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main DataTable Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-5">
        
        {/* Search & Filter Header Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search session name or notes..."
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Filter size={12} /> Phase:
            </span>
            {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => {
                  setStatusFilter(statusKey);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === statusKey
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {statusKey}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic DataTable with Skeleton Loading */}
        <DataTable
          columns={columns}
          data={paginatedYears}
          loading={contextLoading}
          skeletonRows={4}
          emptyMessage="No academic session records match your search."
          emptyIcon={CalendarDays}
          pagination={{
            currentPage,
            pageSize,
            totalRecords: filteredYears.length,
            totalPages,
            onPageChange: setCurrentPage,
            onPageSizeChange: (newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }
          }}
        />
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-primary-600" />
                <span>{editingYear ? 'Edit Academic Year' : 'Create New Academic Year'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025-2026"
                  value={formData.year_name}
                  onChange={(e) => setFormData({ ...formData, year_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Phase Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white transition"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Additional notes about this session..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white transition"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active_check"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <label htmlFor="is_active_check" className="font-semibold text-slate-800 cursor-pointer">
                  Set as Active Academic Year for School
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition shadow-md shadow-primary-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loadingSubmit ? 'Saving...' : editingYear ? 'Update Year' : 'Create Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
