'use client';
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  UserCheck, 
  UserX, 
  Save, 
  RefreshCw, 
  Filter, 
  BookOpen, 
  Sparkles,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  getAttendanceAction, 
  saveBulkAttendanceAction, 
  getAttendanceSummaryAction 
} from '@/actions/school/attendanceActions';

import { useAcademicYear } from '@/context/AcademicYearContext';

export default function AttendancePage() {
  // Academic Year Context
  const { activeYear } = useAcademicYear();

  // Filters & Control States
  const [activeTab, setActiveTab] = useState('STUDENT'); // 'STUDENT' | 'STAFF'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch Attendance Records
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceAction({
        date: selectedDate,
        entity_type: activeTab,
        class_name: activeTab === 'STUDENT' ? selectedClass : '',
        section: activeTab === 'STUDENT' ? selectedSection : '',
        academic_year_id: activeYear?.id
      });

      if (res.success && res.data?.records) {
        setRecords(res.data.records);
      } else {
        setRecords([]);
      }

      // Fetch Summary Stats
      const summaryRes = await getAttendanceSummaryAction(selectedDate, activeYear?.id);
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error(err);
      notifyError('Attendance load karne me error aaya');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [activeTab, selectedDate, selectedClass, selectedSection, activeYear?.id]);

  // Bulk Status Toggler (e.g. Mark All Present)
  const handleMarkAll = (statusToSet) => {
    setRecords(prev => prev.map(rec => ({ ...rec, status: statusToSet })));
    notifySuccess(`Sabhi ${activeTab === 'STUDENT' ? 'Students' : 'Staff'} ko '${statusToSet.toUpperCase()}' mark kar diya gaya hai.`);
  };

  // Change individual record status
  const handleStatusChange = (id, newStatus) => {
    setRecords(prev => prev.map(rec => rec.id === id ? { ...rec, status: newStatus } : rec));
  };

  // Save Attendance to Backend
  const handleSaveAttendance = async () => {
    if (records.length === 0) return;
    setSaving(true);
    try {
      const res = await saveBulkAttendanceAction({
        date: selectedDate,
        entity_type: activeTab,
        class_name: activeTab === 'STUDENT' ? selectedClass : '',
        section: activeTab === 'STUDENT' ? selectedSection : '',
        academic_year_id: activeYear?.id,
        records
      });

      if (res.success) {
        notifySuccess('Attendance successfully saved and updated in database!');
        fetchAttendance();
      } else {
        notifyError(res.message || 'Save karne me error aaya');
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Filtered records by search query
  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.roll_number && r.roll_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.employee_id && r.employee_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Status Badge Colors & Icons mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge variant="success" className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Present</Badge>;
      case 'absent':
        return <Badge variant="danger" className="flex items-center gap-1 font-bold"><XCircle className="w-3.5 h-3.5" /> Absent</Badge>;
      case 'late':
        return <Badge variant="warning" className="flex items-center gap-1 font-bold"><Clock className="w-3.5 h-3.5" /> Late</Badge>;
      case 'half_day':
        return <Badge variant="info" className="flex items-center gap-1 font-bold"><AlertCircle className="w-3.5 h-3.5" /> Half Day</Badge>;
      case 'leave':
        return <Badge variant="neutral" className="flex items-center gap-1 font-bold">On Leave</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      {/* Header Banner - Single Primary Light/Soft Card Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/60 text-slate-900 dark:text-white p-6 rounded-2xl shadow-2xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-bold mb-1 text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" /> Dynamic School Management
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Attendance Management</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 font-medium">
            Real-time daily attendance tracking for Students & Staff with live analytics logs.
          </p>
        </div>

        {/* Header Actions with clear high-contrast buttons & icons */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button 
            type="button"
            onClick={fetchAttendance} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button 
            type="button"
            onClick={handleSaveAttendance} 
            disabled={saving || loading || records.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-primary-600/20 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total {activeTab === 'STUDENT' ? 'Students' : 'Staff'}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {activeTab === 'STUDENT' ? (summary?.students?.total || 0) : (summary?.staff?.total || 0)}
              </h3>
            </div>
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl dark:bg-primary-950/50 dark:text-primary-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {activeTab === 'STUDENT' ? (summary?.students?.present || 0) : (summary?.staff?.present || 0)}
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Absent Today</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                {activeTab === 'STUDENT' ? (summary?.students?.absent || 0) : (summary?.staff?.absent || 0)}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl dark:bg-rose-950/50 dark:text-rose-400">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-100 dark:border-slate-800 shadow-xs rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-2xl font-black text-primary-600 dark:text-primary-400 mt-1">
                {activeTab === 'STUDENT' ? `${summary?.students?.attendance_rate || 0}%` : `${summary?.staff?.attendance_rate || 0}%`}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/50 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Control Panel & Filter Bar */}
      <Card className="p-6 space-y-6 shadow-xs rounded-2xl border border-slate-100 dark:border-slate-800">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4 gap-4">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'STUDENT' 
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-2xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student Attendance
            </button>
            <button
              onClick={() => setActiveTab('STAFF')}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'STAFF' 
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-2xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Staff / Teacher Attendance
            </button>
          </div>

          {/* Quick Mark Shortcuts */}
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => handleMarkAll('present')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mark All Present</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleMarkAll('absent')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-rose-300 text-rose-700 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Mark All Absent</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filters Row with proper field labels & Select inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Attendance Date
            </label>
            <Input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full font-medium"
            />
          </div>

          {activeTab === 'STUDENT' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Class / Grade
                </label>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full font-medium"
                >
                  <option value="all">All Classes</option>
                  <option value="10">Grade 10</option>
                  <option value="9">Grade 9</option>
                  <option value="8">Grade 8</option>
                  <option value="5">Grade 5</option>
                  <option value="1">Grade 1</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Section
                </label>
                <Select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full font-medium"
                >
                  <option value="all">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </Select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Search Record
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full font-medium"
              />
            </div>
          </div>
        </div>

        {/* Interactive Attendance Sheet Table */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {activeTab === 'STUDENT' ? 'Student Info' : 'Staff Member'}
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {activeTab === 'STUDENT' ? 'Roll / Code' : 'Employee ID'}
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status Indicator
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Attendance Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <>
                  <SkeletonTableRow columns={5} />
                  <SkeletonTableRow columns={5} />
                  <SkeletonTableRow columns={5} />
                </>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    No attendance records found for this date or selection.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950/70 dark:text-primary-300 font-bold flex items-center justify-center text-sm shadow-2xs">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {activeTab === 'STUDENT' ? `Class ${item.class_name || 'N/A'}-${item.section || 'N/A'}` : item.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      {item.roll_number || item.employee_id}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'present')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            item.status === 'present'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'absent')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            item.status === 'absent'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'late')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            item.status === 'late'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'half_day')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            item.status === 'half_day'
                              ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-primary-950/30'
                          }`}
                        >
                          Half Day
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
