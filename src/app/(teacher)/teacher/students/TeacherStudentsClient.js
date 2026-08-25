'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  Users, 
  Search, 
  Sparkles, 
  Phone, 
  GraduationCap, 
  Bus, 
  ShieldCheck, 
  Layers, 
  RefreshCw, 
  X, 
  MapPin, 
  CheckCircle2, 
  User,
  Eye,
  Hash,
  Filter
} from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';
import Badge from '@/components/ui/Badge';
import { getTeacherStudentsAction } from '@/actions/teacher/studentActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function TeacherStudentsClient({ initialUser, initialData }) {
  const [data, setData] = useState(initialData);
  const [classes, setClasses] = useState(initialData?.classes || []);
  const [selectedClassId, setSelectedClassId] = useState(
    initialData?.selected_class?.id ? String(initialData.selected_class.id) : ''
  );
  const [selectedClassInfo, setSelectedClassInfo] = useState(initialData?.selected_class || null);
  const [students, setStudents] = useState(initialData?.students || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetching, setFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Client-side pagination state for DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch updated student roster when class changes
  const fetchStudents = async (targetClassId) => {
    setFetching(true);
    try {
      const res = await getTeacherStudentsAction({
        classId: targetClassId || selectedClassId
      });

      if (res.success && res.data) {
        setData(res.data);
        setClasses(res.data.classes || []);
        setSelectedClassInfo(res.data.selected_class || null);
        if (res.data.selected_class?.id) {
          setSelectedClassId(String(res.data.selected_class.id));
        }
        setStudents(res.data.students || []);
        setCurrentPage(1);
      } else {
        notifyError(res.message || 'Failed to load class students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      notifyError('Failed to communicate with server');
    } finally {
      setFetching(false);
    }
  };

  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    startTransition(() => {
      fetchStudents(newClassId);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      fetchStudents(selectedClassId);
    });
  };

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter students
  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.roll && String(s.roll).toLowerCase().includes(term)) ||
      (s.adm && s.adm.toLowerCase().includes(term)) ||
      (s.guardian && s.guardian.toLowerCase().includes(term)) ||
      (s.phone && s.phone.includes(term)) ||
      (s.nfc && s.nfc.toLowerCase().includes(term))
    );
  });

  // Client-side pagination slice
  const totalRecords = filteredStudents.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Class options for Select component
  const classOptions = classes.map(c => ({
    value: String(c.id),
    label: `${c.class_name} - Sec ${c.section} ${c.is_class_teacher ? '★ (Class Teacher)' : ''}`
  }));

  // DataTable columns definition
  const columns = [
    {
      header: 'Roll #',
      accessor: 'roll',
      className: 'w-20',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-500/20">
          #{row.roll}
        </span>
      )
    },
    {
      header: 'Student Name',
      accessor: 'name',
      render: (row) => {
        const photoUrl = row.image_url || row.photo;
        const initialChar = (row.name || 'S').trim().charAt(0).toUpperCase();

        return (
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative w-9 h-9 rounded-xl bg-primary-50 border border-primary-500/30 flex items-center justify-center font-black text-xs text-primary-700 shrink-0 overflow-hidden shadow-2xs">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={row.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : null}
              <span className="font-black text-primary-700 select-none">
                {initialChar}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs sm:text-sm truncate leading-tight">
                {row.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <span className="font-mono text-primary-600 font-semibold">{row.adm}</span>
                <span>•</span>
                <span className="uppercase text-[10px] font-bold">{row.gender}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Guardian & Parent',
      accessor: 'guardian',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs truncate">
            {row.guardian}
          </div>
          <div className="text-[11px] text-slate-400">Primary Contact</div>
        </div>
      )
    },
    {
      header: 'Phone / Contact',
      accessor: 'phone',
      render: (row) => (
        <div>
          {row.phone && row.phone !== 'N/A' ? (
            <a
              href={`tel:${row.phone}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 hover:text-primary-600 font-medium transition hover:underline"
            >
              <Phone size={12} className="text-primary-600 shrink-0" />
              <span>{row.phone}</span>
            </a>
          ) : (
            <span className="text-slate-400 text-xs">N/A</span>
          )}
        </div>
      )
    },
    {
      header: 'Smart Bus & NFC',
      accessor: 'bus',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            {row.bus ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                <Bus size={10} className="text-amber-600" /> {row.bus}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/50">
                Self Transit
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] text-slate-400 font-semibold">
            {row.nfc}
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-16 sm:pb-0">
      
      {/* 1. Header Banner & Class Selector */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs shadow-slate-200/50 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border border-slate-100">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700">
            <Sparkles size={12} className="text-primary-600 shrink-0" />
            <span>Class Student Roster</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Assigned Class Students
          </h1>
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap pt-0.5">
            {selectedClassInfo ? (
              <>
                <span className="font-bold text-slate-900 underline decoration-primary-500 decoration-2">
                  {selectedClassInfo.class_name} - Section {selectedClassInfo.section}
                </span>
                <span className="text-slate-300">•</span>
                <span>{selectedClassInfo.room_number || 'Main Classroom'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-primary-700 font-bold">{students.length} Total Enrolled</span>
              </>
            ) : (
              <span className="text-slate-500 font-medium">No class assigned or available</span>
            )}
          </div>
        </div>

        {/* Multi-Class Dropdown & Refresh Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {classes.length > 1 && (
            <div className="w-full sm:w-64">
              <Select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                options={classOptions}
                placeholder="Select Class"
                size="md"
              />
            </div>
          )}

          <button
            onClick={handleRefresh}
            disabled={fetching}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/70 text-slate-600 hover:text-primary-600 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px]"
          >
            <RefreshCw size={15} className={fetching ? 'animate-spin text-primary-600' : ''} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Search Control Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
        <div className="relative flex-1 max-w-lg">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search by student name, roll #, admission ID, guardian, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200/60 rounded-xl py-2.5 pl-10 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
          <Users size={15} className="text-primary-600 shrink-0" />
          <span>{filteredStudents.length} Students in Roster</span>
        </div>
      </div>

      {/* 3. Mobile Touch Cards View (Only on Narrow Mobile Screens: < md) */}
      <div className="block md:hidden space-y-3">
        {filteredStudents.map((s) => {
          const photoUrl = s.image_url || s.photo;
          const initialChar = (s.name || 'S').trim().charAt(0).toUpperCase();

          return (
            <div 
              key={s.id} 
              className="p-4 rounded-2xl bg-white shadow-xs space-y-3 transition hover:shadow-sm border border-slate-100"
            >
              {/* Student Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-xl bg-primary-50 border border-primary-500/30 flex items-center justify-center font-black text-xs text-primary-700 shrink-0 overflow-hidden shadow-2xs">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={s.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-[inherit] z-10"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                    <span className="font-black text-primary-700 select-none">{initialChar}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm truncate leading-tight">{s.name}</h3>
                      <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-500/20">
                        #{s.roll}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-primary-600 font-bold">{s.adm}</span>
                      <span>•</span>
                      <span className="uppercase font-bold text-[10px] text-slate-400">{s.gender}</span>
                    </div>
                  </div>
                </div>

                <Badge variant={s.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                  {s.status}
                </Badge>
              </div>

              {/* Guardian & Call Info */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Guardian</span>
                  <span className="font-bold text-slate-800 truncate block">{s.guardian}</span>
                </div>
                {s.phone && s.phone !== 'N/A' && (
                  <a
                    href={`tel:${s.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                  >
                    <Phone size={12} className="text-emerald-600" /> Call
                  </a>
                )}
              </div>

              {/* Transit & NFC Details (Clean 2-Row Stack for Mobile) */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2 text-xs">
                {/* Transit Details */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
                    Transit
                  </span>
                  {s.bus ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 truncate max-w-[190px]">
                      <Bus size={11} className="text-amber-600 shrink-0" />
                      <span className="truncate">{s.bus}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/50">
                      Self Transit
                    </span>
                  )}
                </div>

                {/* NFC Pass ID */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
                    NFC Pass
                  </span>
                  <span className="font-mono text-[10px] text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 truncate max-w-[190px]">
                    {s.nfc}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-2xl shadow-xs border border-slate-100">
            No students found matching your search.
          </div>
        )}
      </div>

      {/* 4. Desktop / Web Table View (Rule 1: Reusable DataTable Component wrapped in Card with Pagination) */}
      <div className="hidden md:block">
        <Card
          title="Class Student Roster"
          subtitle={`${selectedClassInfo?.class_name || 'Class'} - Section ${selectedClassInfo?.section || 'A'} (${totalRecords} Students)`}
          icon={Users}
        >
          <DataTable
            columns={columns}
            data={paginatedData}
            loading={fetching}
            emptyMessage="No students found in this class."
            pagination={{
              currentPage,
              pageSize,
              totalRecords,
              totalPages,
              onPageChange: (page) => setCurrentPage(page),
              onPageSizeChange: (size) => {
                setPageSize(size);
                setCurrentPage(1);
              }
            }}
          />
        </Card>
      </div>

    </div>
  );
}
