'use client';
import { useState, useEffect, useRef } from 'react';
import { useAcademicYear } from '@/context/AcademicYearContext';
import { createPortal } from 'react-dom';
import { 
  Landmark, 
  PlusCircle, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Printer, 
  BookOpen, 
  Users, 
  DollarSign, 
  FileSpreadsheet,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Skeleton, { SkeletonTableRow } from '@/components/ui/Skeleton';
import { 
  getFeeCategoriesAction, 
  createFeeCategoryAction, 
  updateFeeCategoryAction, 
  deleteFeeCategoryAction, 
  getFeeAllocationsAction, 
  allocateFeeAction, 
  deleteFeeAllocationAction, 
  recordPaymentAction, 
  getPaymentTransactionsAction, 
  getFeeStatsAction 
} from '@/actions/feeActions';
import { getClassesAction } from '@/actions/classActions';
import { getStudentsAction } from '@/actions/studentActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { feeCategorySchema, feeAllocationSchema, feePaymentSchema } from '@/validators/feeSchemas';

export default function StudentFeesPage() {
  // Academic Year Session (from header dropdown)
  const { activeYear } = useAcademicYear();

  // Navigation
  const [activeTab, setActiveTab] = useState('overview');

  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  // Allocation Filters
  const [allocSearch, setAllocSearch] = useState('');
  const [allocClass, setAllocClass] = useState('all');
  const [allocStatus, setAllocStatus] = useState('all');
  const [allocPage, setAllocPage] = useState(1);
  const [allocLimit, setAllocLimit] = useState(10);
  const [allocTotal, setAllocTotal] = useState(0);
  const [allocPages, setAllocPages] = useState(1);

  // Ledger Filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerMode, setLedgerMode] = useState('all');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLimit, setLedgerLimit] = useState(10);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [ledgerPages, setLedgerPages] = useState(1);

  // Modal Dialog States
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  // Form States
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    amount: '',
    due_date: '',
    description: ''
  });

  const [allocateForm, setAllocateForm] = useState({
    fee_category_id: '',
    target_type: 'class', // 'class' or 'student'
    class_id: '',
    student_id: '',
    amount: '',
    due_date: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_mode: 'cash',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  // Form Validation Error States
  const [categoryErrors, setCategoryErrors] = useState({});
  const [allocateErrors, setAllocateErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});

  // Load basic school config details
  useEffect(() => {
    fetchStats();
    fetchClasses();
  }, []);

  // Re-fetch all visible data whenever the active academic year changes
  useEffect(() => {
    if (!activeYear) return;
    fetchStats();
    if (activeTab === 'setup') fetchCategories();
    if (activeTab === 'allocations') fetchAllocations();
    if (activeTab === 'ledger') fetchLedger();
  }, [activeYear?.id]);

  // Sync tab loading
  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'setup') fetchCategories();
    if (activeTab === 'allocations') fetchAllocations();
    if (activeTab === 'ledger') fetchLedger();
  }, [activeTab]);

  // Sync allocation filters
  useEffect(() => {
    if (activeTab === 'allocations') {
      fetchAllocations();
    }
  }, [allocSearch, allocClass, allocStatus, allocPage, allocLimit]);

  // Sync ledger filters
  useEffect(() => {
    if (activeTab === 'ledger') {
      fetchLedger();
    }
  }, [ledgerSearch, ledgerMode, ledgerPage, ledgerLimit]);

  // Fetch student lists when allocate target changes or class changes
  useEffect(() => {
    if (allocateForm.target_type === 'student' && allocateForm.class_id) {
      fetchStudentsForClass(allocateForm.class_id);
    } else {
      setStudentsList([]);
      setAllocateForm(prev => ({ ...prev, student_id: '' }));
    }
  }, [allocateForm.target_type, allocateForm.class_id]);

  const fetchStats = async () => {
    setLoadingStats(true);
    const res = await getFeeStatsAction({ academic_year_id: activeYear?.id });
    if (res.success) {
      setStats(res.data);
    } else {
      notifyError(res.message);
    }
    setLoadingStats(false);
  };

  const fetchClasses = async () => {
    const res = await getClassesAction();
    if (res.success) {
      setClassesList(res.data || []);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    const res = await getFeeCategoriesAction({ academic_year_id: activeYear?.id });
    if (res.success) {
      setCategories(res.data || []);
    } else {
      notifyError(res.message);
    }
    setLoadingCategories(false);
  };

  const fetchAllocations = async () => {
    setLoadingAllocations(true);
    const res = await getFeeAllocationsAction({
      search: allocSearch,
      class_id: allocClass,
      status: allocStatus,
      page: allocPage,
      limit: allocLimit,
      academic_year_id: activeYear?.id
    });
    if (res.success) {
      setAllocations(res.data || []);
      setAllocTotal(res.meta?.total || 0);
      setAllocPages(res.meta?.totalPages || 1);
    } else {
      notifyError(res.message);
    }
    setLoadingAllocations(false);
  };

  const fetchLedger = async () => {
    setLoadingLedger(true);
    const res = await getPaymentTransactionsAction({
      search: ledgerSearch,
      payment_mode: ledgerMode,
      page: ledgerPage,
      limit: ledgerLimit,
      academic_year_id: activeYear?.id
    });
    if (res.success) {
      setLedger(res.data || []);
      setLedgerTotal(res.meta?.total || 0);
      setLedgerPages(res.meta?.totalPages || 1);
    } else {
      notifyError(res.message);
    }
    setLoadingLedger(false);
  };

  const fetchStudentsForClass = async (classId) => {
    const res = await getStudentsAction({ grade: classId, limit: 100 });
    if (res.success) {
      setStudentsList(res.data || []);
    }
  };

  // Category Actions
  const handleOpenCategoryModal = (cat = null) => {
    setCategoryErrors({});
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        amount: cat.amount.toString(),
        due_date: cat.due_date || '',
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', amount: '', due_date: '', description: '' });
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCategoryErrors({});
    try {
      await feeCategorySchema.validate(categoryForm, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errs = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errs[err.path]) {
            errs[err.path] = err.message;
          }
        });
        setCategoryErrors(errs);
        notifyError('Please fix the highlighted validation errors.');
      } else {
        notifyError(yupErr.message);
      }
      return;
    }

    setSubmitting(true);
    let res;
    if (editingCategory) {
      res = await updateFeeCategoryAction(editingCategory.id, categoryForm);
    } else {
      res = await createFeeCategoryAction(categoryForm);
    }

    if (res.success) {
      notifySuccess(res.message);
      setCategoryModalOpen(false);
      fetchCategories();
      fetchStats();
    } else {
      notifyError(res.message);
    }
    setSubmitting(false);
  };

  const handleDeleteCategory = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Fee Category Delete',
      message: 'Are you sure you want to delete this fee structure? This action cannot be undone.',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await deleteFeeCategoryAction(id);
          if (res.success) {
            notifySuccess(res.message);
            fetchCategories();
            fetchStats();
          } else {
            notifyError(res.message);
          }
        } catch (err) {
          notifyError('Error deleting fee category');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  // Allocation Actions
  const handleOpenAllocateModal = () => {
    setAllocateErrors({});
    setAllocateForm({
      target_type: 'class',
      class_id: '',
      student_id: '',
      fee_category_id: '',
      amount_override: '',
      due_date: '',
      remarks: ''
    });
    setAllocateModalOpen(true);
  };

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    setAllocateErrors({});
    try {
      await feeAllocationSchema.validate(allocateForm, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errs = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errs[err.path]) {
            errs[err.path] = err.message;
          }
        });
        setAllocateErrors(errs);
        notifyError('Please fix the highlighted validation errors.');
      } else {
        notifyError(yupErr.message);
      }
      return;
    }

    setSubmitting(true);
    const payload = {
      academic_year_id: activeYear?.id,
      fee_category_id: parseInt(allocateForm.fee_category_id),
      target_type: allocateForm.target_type,
      class_id: allocateForm.class_id ? parseInt(allocateForm.class_id) : undefined,
      student_id: allocateForm.target_type === 'student' && allocateForm.student_id ? parseInt(allocateForm.student_id) : undefined,
      amount_override: allocateForm.amount_override ? parseFloat(allocateForm.amount_override) : undefined,
      due_date: allocateForm.due_date || undefined,
      remarks: allocateForm.remarks || undefined
    };

    const res = await allocateFeeAction(payload);
    if (res.success) {
      notifySuccess(res.message);
      setAllocateModalOpen(false);
      fetchAllocations();
      fetchStats();
    } else {
      notifyError(res.message);
    }
    setSubmitting(false);
  };

  const handleVoidAllocation = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Void Fee Allocation',
      message: 'Are you sure you want to void this student fee allocation?',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await deleteFeeAllocationAction(id);
          if (res.success) {
            notifySuccess(res.message);
            fetchAllocations();
            fetchStats();
          } else {
            notifyError(res.message);
          }
        } catch (err) {
          notifyError('Error voiding fee allocation');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
      }
    });
  };

  // Payment Actions
  const handleOpenPaymentModal = (alloc) => {
    const balance = parseFloat(alloc.amount) - parseFloat(alloc.paid_amount) - parseFloat(alloc.discount_amount);
    setSelectedAllocation(alloc);
    setPaymentErrors({});
    setPaymentForm({
      amount_paid: balance.toString(),
      payment_mode: 'cash',
      reference_number: '',
      payment_date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setPaymentModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setPaymentErrors({});
    try {
      await feePaymentSchema.validate(paymentForm, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errs = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errs[err.path]) {
            errs[err.path] = err.message;
          }
        });
        setPaymentErrors(errs);
        notifyError('Please fix the highlighted validation errors.');
      } else {
        notifyError(yupErr.message);
      }
      return;
    }

    setSubmitting(true);
    const payload = {
      student_fee_id: selectedAllocation.id,
      amount_paid: parseFloat(paymentForm.amount_paid),
      payment_date: paymentForm.payment_date,
      payment_mode: paymentForm.payment_mode,
      reference_number: paymentForm.reference_number || undefined,
      remarks: paymentForm.remarks || undefined
    };

    const res = await recordPaymentAction(payload);
    if (res.success) {
      notifySuccess(res.message || 'Payment recorded successfully');
      setPaymentModalOpen(false);
      fetchAllocations();
      fetchStats();
    } else {
      notifyError(res.message);
    }
    setSubmitting(false);
  };

  // Rendering Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="emerald" dot>Fully Paid</Badge>;
      case 'partially_paid':
        return <Badge variant="warning" dot>Partially Paid</Badge>;
      case 'unpaid':
      default:
        return <Badge variant="danger" dot>Unpaid</Badge>;
    }
  };

  // Columns Definitions
  const categoryColumns = [
    { header: 'Structure Name', accessor: 'name', className: 'font-bold text-slate-800' },
    { header: 'Amount', render: (row) => <span className="font-extrabold text-slate-900">₹{parseFloat(row.amount).toLocaleString('en-IN')}</span> },
    { header: 'Default Due Date', render: (row) => row.due_date ? <span>{new Date(row.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> : <span className="text-slate-400">Not set</span> },
    { header: 'Description', render: (row) => <span className="text-slate-500 block max-w-xs truncate">{row.description || 'No description'}</span> },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end space-x-2">
          <Tooltip content="Edit Category" position="top">
            <Button variant="secondary" size="xs" icon={Edit3} onClick={() => handleOpenCategoryModal(row)} />
          </Tooltip>
          <Tooltip content="Delete Category" position="top">
            <Button variant="danger" size="xs" icon={Trash2} onClick={() => handleDeleteCategory(row.id)} />
          </Tooltip>
        </div>
      )
    }
  ];

  const allocationColumns = [
    {
      header: 'Student',
      render: (row) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
            <img src={row.student?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.student?.first_name + ' ' + row.student?.last_name)}&background=0284c7&color=fff&bold=true`} alt="photo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-[11px] sm:text-xs">
              {row.student?.first_name} {row.student?.last_name}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Adm No: {row.student?.admission_number}</div>
          </div>
        </div>
      )
    },
    { header: 'Class / Grade', render: (row) => <Badge variant="primary">{row.student?.schoolClass?.class_name} - {row.student?.schoolClass?.section}</Badge> },
    { header: 'Fee Category', render: (row) => <span className="font-semibold text-slate-700">{row.feeCategory?.name}</span> },
    {
      header: 'Fee Financials',
      render: (row) => {
        const balance = parseFloat(row.amount) - parseFloat(row.paid_amount) - parseFloat(row.discount_amount);
        return (
          <div className="space-y-0.5">
            <div className="text-slate-800">Total: <span className="font-extrabold">₹{parseFloat(row.amount).toLocaleString('en-IN')}</span></div>
            <div className="text-slate-500 text-[10px]">Paid: ₹{parseFloat(row.paid_amount).toLocaleString('en-IN')} | Bal: <span className="text-rose-600 font-bold">₹{balance.toLocaleString('en-IN')}</span></div>
          </div>
        );
      }
    },
    { header: 'Due Date', render: (row) => row.due_date ? <span className="font-medium text-slate-600">{new Date(row.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> : '-' },
    { header: 'Status', render: (row) => getStatusBadge(row.status) },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => {
        const balance = parseFloat(row.amount) - parseFloat(row.paid_amount) - parseFloat(row.discount_amount);
        return (
          <div className="flex justify-end space-x-1.5">
            {balance > 0 ? (
              <Button 
                variant="emerald" 
                size="xs" 
                icon={CreditCard}
                onClick={() => handleOpenPaymentModal(row)}
              >
                Pay
              </Button>
            ) : (
              <span className="text-emerald-600 text-xs font-black px-3 py-1 flex items-center gap-1"><CheckCircle2 size={13}/> Cleared</span>
            )}
            {parseFloat(row.paid_amount) === 0 && (
              <Button variant="danger" size="xs" icon={Trash2} onClick={() => handleVoidAllocation(row.id)} title="Void Allocation" />
            )}
          </div>
        );
      }
    }
  ];

  const ledgerColumns = [
    { header: 'Receipt No', accessor: 'receipt_number', className: 'font-mono font-bold text-slate-800 uppercase' },
    {
      header: 'Student & Class',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.studentFee?.student?.first_name} {row.studentFee?.student?.last_name}</div>
          <div className="text-[10px] text-slate-400">Class {row.studentFee?.student?.schoolClass?.class_name}-{row.studentFee?.student?.schoolClass?.section}</div>
        </div>
      )
    },
    { header: 'Fee Category', render: (row) => <span className="font-semibold text-slate-600">{row.studentFee?.feeCategory?.name}</span> },
    { header: 'Amount Paid', render: (row) => <span className="font-extrabold text-slate-900">₹{parseFloat(row.amount_paid).toLocaleString('en-IN')}</span> },
    { header: 'Date', render: (row) => <span>{new Date(row.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
    { header: 'Mode', render: (row) => <Badge variant="primary" className="capitalize">{row.payment_mode}</Badge> },
    { header: 'Reference ID', render: (row) => <span className="font-mono text-slate-500">{row.reference_number || '-'}</span> },
    {
      header: 'Receipt',
      className: 'text-right',
      render: (row) => (
        <Link href={`/fees/receipt/${row.id}/print`} target="_blank">
          <Button variant="secondary" size="xs" icon={Printer}>Receipt</Button>
        </Link>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 🌟 Professional Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-primary-50/40 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="emerald" dot>Real-time Billing Sync</Badge>
            <Badge variant="primary">Institution ERP</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <Landmark className="text-primary-600 animate-pulse" size={24} /> Student Fee Management Portal
          </h1>
          <p className="text-slate-500 text-xs">
            Manage tuition models, bulk assign fee structures, collect cash/card payments, and audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'setup' && (
            <Button variant="primary" icon={PlusCircle} onClick={() => handleOpenCategoryModal()}>
              Create Fee Structure
            </Button>
          )}
          {activeTab === 'allocations' && (
            <Button variant="primary" icon={Users} onClick={handleOpenAllocateModal}>
              Allocate / Assign Fee
            </Button>
          )}
        </div>
      </div>

      {/* 📁 Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto scrollbar-none pb-0.5">
        {[
          { id: 'overview', label: 'Dashboard & Stats', icon: Landmark },
          { id: 'setup', label: 'Fee Setup (Categories)', icon: DollarSign },
          { id: 'allocations', label: 'Fee Allocations (Collect)', icon: Users },
          { id: 'ledger', label: 'Payment Transactions ledger', icon: FileSpreadsheet }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2.5 py-3 px-1 border-b-2 font-bold transition duration-200 text-xs sm:text-sm whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 🚀 Tab Contents */}

      {/* Tab 1: Overview Dashboard */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-24" />
                  <div className="h-6 bg-slate-200 rounded animate-pulse w-32" />
                  <div className="h-2 bg-slate-200 rounded animate-pulse w-full" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Financial Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Expected */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Expected Revenue</p>
                    <h3 className="text-2xl font-black text-slate-800">
                      ₹{parseFloat(stats.summary.expected).toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">For current academic year</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
                    <DollarSign size={20} />
                  </div>
                </div>

                {/* Collected */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Revenue Collected</p>
                      <h3 className="text-2xl font-black text-slate-800">
                        ₹{parseFloat(stats.summary.collected).toLocaleString('en-IN')}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stats.summary.collectionRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 font-bold">
                    <span>{stats.summary.collectionRate}% Collected</span>
                    <span>Discounts: ₹{parseFloat(stats.summary.discount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Pending */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outstanding Balance</p>
                    <h3 className="text-2xl font-black text-rose-600">
                      ₹{parseFloat(stats.summary.pending).toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle size={10} /> Requires attention
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
                    <AlertCircle size={20} />
                  </div>
                </div>

                {/* Collection Performance */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payments Rate</p>
                    <h3 className="text-2xl font-black text-primary-600">
                      {stats.summary.collectionRate}%
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">Target: 95% collection rate</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shadow-2xs">
                    <Landmark size={20} />
                  </div>
                </div>

              </div>

              {/* Status Allocations and info alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Student Status Pie/Bar representation */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Allocations Summary
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Status Bars */}
                    {[
                      { label: 'Fully Paid Student Accounts', count: stats.statuses.paid, color: 'bg-emerald-500', total: stats.statuses.paid + stats.statuses.partially_paid + stats.statuses.unpaid },
                      { label: 'Partial Fee Defaulters', count: stats.statuses.partially_paid, color: 'bg-amber-500', total: stats.statuses.paid + stats.statuses.partially_paid + stats.statuses.unpaid },
                      { label: 'Complete Fee Defaulters', count: stats.statuses.unpaid, color: 'bg-rose-500', total: stats.statuses.paid + stats.statuses.partially_paid + stats.statuses.unpaid }
                    ].map((status, idx) => {
                      const percentage = status.total > 0 ? Math.round((status.count / status.total) * 100) : 0;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{status.label}</span>
                            <span className="font-bold text-slate-900">{status.count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className={`${status.color} h-full rounded-full`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600 mt-2">
                    <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <p>
                      Use the <b>Fee Allocations</b> tab to generate dynamic payment invoice slips or settle default balances via Cash/Card options.
                    </p>
                  </div>
                </div>

                {/* Collection Method Breakdown */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    revenue collected by payment channel
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['cash', 'card', 'bank_transfer', 'online', 'other'].map(mode => {
                      const modeTotal = stats.modes.find(m => m.mode === mode)?.total || 0;
                      return (
                        <div key={mode} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 capitalize">{mode.replace('_', ' ')}</p>
                          <h4 className="font-black text-slate-800 text-sm sm:text-base">
                            ₹{modeTotal.toLocaleString('en-IN')}
                          </h4>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quick Actions</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button variant="secondary" size="xs" onClick={() => setActiveTab('setup')}>Modify Fee Templates</Button>
                      <Button variant="secondary" size="xs" onClick={() => setActiveTab('allocations')}>Audit Outstanding Accounts</Button>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl">
              No statistical fee logs available. Set up dynamic billing categories first.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Setup Fee Structure */}
      {activeTab === 'setup' && (
        <Card className="p-0 border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-800">Fee Categories / Structures</h3>
              <p className="text-slate-400 text-[10px]">Define structures e.g. Tuition Fee, Exam Fees, Bus Fees</p>
            </div>
            <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => handleOpenCategoryModal()}>
              New Structure
            </Button>
          </div>
          <div className="p-4">
            <DataTable 
              columns={categoryColumns} 
              data={categories} 
              loading={loadingCategories}
              skeletonRow={SkeletonTableRow}
              emptyMessage="No fee structures set up. Add your first fee structure to allocate it."
            />
          </div>
        </Card>
      )}

      {/* Tab 3: Allocations List */}
      {activeTab === 'allocations' && (
        <Card className="p-0 border border-slate-200 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center space-x-2 w-full md:max-w-md bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <Search size={15} className="text-slate-400" />
              <input 
                type="text" 
                value={allocSearch}
                onChange={(e) => { setAllocSearch(e.target.value); setAllocPage(1); }}
                placeholder="Search student name or admission ID..."
                className="w-full bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="w-36">
                <Select
                  value={allocClass}
                  onChange={(e) => { setAllocClass(e.target.value); setAllocPage(1); }}
                  options={[
                    { label: 'All Classes', value: 'all' },
                    ...classesList.map(c => ({ label: `${c.class_name}-${c.section}`, value: c.id.toString() }))
                  ]}
                  searchable={false}
                  clearable={false}
                  placeholder="Filter Class"
                />
              </div>

              <div className="w-36">
                <Select
                  value={allocStatus}
                  onChange={(e) => { setAllocStatus(e.target.value); setAllocPage(1); }}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Fully Paid', value: 'paid' },
                    { label: 'Partially Paid', value: 'partially_paid' },
                    { label: 'Unpaid', value: 'unpaid' }
                  ]}
                  searchable={false}
                  clearable={false}
                  placeholder="Filter Status"
                />
              </div>

              <Button variant="primary" icon={PlusCircle} onClick={handleOpenAllocateModal}>
                Assign Fee
              </Button>
            </div>
          </div>

          <div className="p-4">
            <DataTable 
              columns={allocationColumns}
              data={allocations}
              loading={loadingAllocations}
              skeletonRow={SkeletonTableRow}
              emptyMessage="No fee allocations found matching the filters."
              pagination={{
                currentPage: allocPage,
                pageSize: allocLimit,
                totalRecords: allocTotal,
                totalPages: allocPages,
                onPageChange: (p) => setAllocPage(p),
                onPageSizeChange: (s) => { setAllocLimit(s); setAllocPage(1); }
              }}
            />
          </div>
        </Card>
      )}

      {/* Tab 4: Transactions Ledger */}
      {activeTab === 'ledger' && (
        <Card className="p-0 border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center space-x-2 w-full md:max-w-md bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <Search size={15} className="text-slate-400" />
              <input 
                type="text" 
                value={ledgerSearch}
                onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
                placeholder="Search student or receipt number..."
                className="w-full bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="w-40">
              <Select
                value={ledgerMode}
                onChange={(e) => { setLedgerMode(e.target.value); setLedgerPage(1); }}
                options={[
                  { label: 'All Modes', value: 'all' },
                  { label: 'Cash', value: 'cash' },
                  { label: 'Card Payment', value: 'card' },
                  { label: 'Bank Transfer', value: 'bank_transfer' },
                  { label: 'Online / UPI', value: 'online' },
                  { label: 'Other', value: 'other' }
                ]}
                searchable={false}
                clearable={false}
                placeholder="Payment Mode"
              />
            </div>
          </div>

          <div className="p-4">
            <DataTable 
              columns={ledgerColumns}
              data={ledger}
              loading={loadingLedger}
              skeletonRow={SkeletonTableRow}
              emptyMessage="No payment transaction records found in the ledger."
              pagination={{
                currentPage: ledgerPage,
                pageSize: ledgerLimit,
                totalRecords: ledgerTotal,
                totalPages: ledgerPages,
                onPageChange: (p) => setLedgerPage(p),
                onPageSizeChange: (s) => { setLedgerLimit(s); setLedgerPage(1); }
              }}
            />
          </div>
        </Card>
      )}

      {/* 📁 MODALS SECTION */}

      {/* Modal 1: Create/Edit Category Structure */}
      {categoryModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              {editingCategory ? 'Edit Fee Structure' : 'Create New Fee Structure'}
            </h3>

            <form noValidate onSubmit={handleSaveCategory} className="space-y-4">
              <Input 
                label="Fee Structure Name" 
                placeholder="e.g. Tuition Fee Term 1, Sports Fee" 
                value={categoryForm.name}
                error={categoryErrors.name}
                onChange={(e) => {
                  setCategoryForm(prev => ({ ...prev, name: e.target.value }));
                  setCategoryErrors(prev => ({ ...prev, name: '' }));
                }}
                required
              />

              <Input 
                label="Amount (₹)" 
                type="number"
                step="0.01"
                placeholder="0.00" 
                value={categoryForm.amount}
                error={categoryErrors.amount}
                onChange={(e) => {
                  setCategoryForm(prev => ({ ...prev, amount: e.target.value }));
                  setCategoryErrors(prev => ({ ...prev, amount: '' }));
                }}
                required
              />

              <Input 
                label="Due Date (Optional)" 
                type="date"
                value={categoryForm.due_date}
                error={categoryErrors.due_date}
                onChange={(e) => {
                  setCategoryForm(prev => ({ ...prev, due_date: e.target.value }));
                  setCategoryErrors(prev => ({ ...prev, due_date: '' }));
                }}
              />

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Description
                </label>
                <textarea 
                  rows={3}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Details regarding fee scope, refund policy, etc."
                  className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setCategoryModalOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Structure'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Allocate Fee to Students / Classes */}
      {allocateModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Allocate / Assign Fee Category
            </h3>

            <form noValidate onSubmit={handleSaveAllocation} className="space-y-4">
              <Select 
                label="Select Fee Structure"
                value={allocateForm.fee_category_id}
                error={allocateErrors.fee_category_id}
                onChange={(e) => {
                  setAllocateForm(prev => ({ ...prev, fee_category_id: e.target.value }));
                  setAllocateErrors(prev => ({ ...prev, fee_category_id: '' }));
                }}
                options={categories.map(c => ({ label: `${c.name} (₹${c.amount})`, value: c.id.toString() }))}
                placeholder="Choose template"
                searchable={false}
                clearable={false}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Target Assignment"
                  value={allocateForm.target_type}
                  error={allocateErrors.target_type}
                  onChange={(e) => {
                    setAllocateForm(prev => ({ ...prev, target_type: e.target.value, class_id: '', student_id: '' }));
                    setAllocateErrors(prev => ({ ...prev, target_type: '', class_id: '', student_id: '' }));
                  }}
                  options={[
                    { label: 'Entire Class / Section', value: 'class' },
                    { label: 'Specific Student Only', value: 'student' }
                  ]}
                  searchable={false}
                  clearable={false}
                />

                <Select 
                  label="Target Class"
                  value={allocateForm.class_id}
                  error={allocateErrors.class_id}
                  onChange={(e) => {
                    setAllocateForm(prev => ({ ...prev, class_id: e.target.value, student_id: '' }));
                    setAllocateErrors(prev => ({ ...prev, class_id: '', student_id: '' }));
                  }}
                  options={classesList.map(c => ({ label: `${c.class_name} - ${c.section}`, value: c.id.toString() }))}
                  placeholder="Select Class"
                  searchable={false}
                  clearable={false}
                />
              </div>

              {allocateForm.target_type === 'student' && (
                <Select 
                  label="Select Student"
                  value={allocateForm.student_id}
                  error={allocateErrors.student_id}
                  onChange={(e) => {
                    setAllocateForm(prev => ({ ...prev, student_id: e.target.value }));
                    setAllocateErrors(prev => ({ ...prev, student_id: '' }));
                  }}
                  options={studentsList.map(s => ({ label: `${s.first_name} ${s.last_name} (Adm: ${s.admission_number || '-'})`, value: s.id.toString() }))}
                  placeholder={allocateForm.class_id ? "Choose Student" : "Select class first"}
                  disabled={!allocateForm.class_id}
                  searchable={true}
                  clearable={false}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Custom Amount (Leave blank for default)" 
                  type="number"
                  placeholder="Default category rate"
                  value={allocateForm.amount}
                  error={allocateErrors.amount}
                  onChange={(e) => {
                    setAllocateForm(prev => ({ ...prev, amount: e.target.value }));
                    setAllocateErrors(prev => ({ ...prev, amount: '' }));
                  }}
                />

                <Input 
                  label="Custom Due Date (Optional)" 
                  type="date"
                  value={allocateForm.due_date}
                  error={allocateErrors.due_date}
                  onChange={(e) => {
                    setAllocateForm(prev => ({ ...prev, due_date: e.target.value }));
                    setAllocateErrors(prev => ({ ...prev, due_date: '' }));
                  }}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setAllocateModalOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Allocating...' : 'Allocate Fee'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 3: Record payment details */}
      {paymentModalOpen && selectedAllocation && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Record Fee Payment
            </h3>

            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-medium">
                <span>Student:</span>
                <span className="font-bold text-slate-800">{selectedAllocation.student?.first_name} {selectedAllocation.student?.last_name}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Fee Category:</span>
                <span className="font-semibold text-slate-800">{selectedAllocation.feeCategory?.name}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Allocated Amount:</span>
                <span className="font-semibold text-slate-800">₹{parseFloat(selectedAllocation.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Paid So Far:</span>
                <span className="font-semibold text-emerald-600">₹{parseFloat(selectedAllocation.paid_amount).toLocaleString('en-IN')}</span>
              </div>
              {parseFloat(selectedAllocation.discount_amount) > 0 && (
                <div className="flex justify-between font-medium">
                  <span>Discounts:</span>
                  <span className="font-semibold text-slate-500">₹{parseFloat(selectedAllocation.discount_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200/80 pt-2 font-bold text-slate-800">
                <span>Outstanding Balance:</span>
                <span className="text-rose-600 font-black">
                  ₹{(parseFloat(selectedAllocation.amount) - parseFloat(selectedAllocation.paid_amount) - parseFloat(selectedAllocation.discount_amount)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form noValidate onSubmit={handleSavePayment} className="space-y-4">
              <Input 
                label="Amount Paid (₹)" 
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentForm.amount_paid}
                error={paymentErrors.amount_paid}
                onChange={(e) => {
                  setPaymentForm(prev => ({ ...prev, amount_paid: e.target.value }));
                  setPaymentErrors(prev => ({ ...prev, amount_paid: '' }));
                }}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Payment Channel"
                  value={paymentForm.payment_mode}
                  error={paymentErrors.payment_mode}
                  onChange={(e) => {
                    setPaymentForm(prev => ({ ...prev, payment_mode: e.target.value, reference_number: '' }));
                    setPaymentErrors(prev => ({ ...prev, payment_mode: '', reference_number: '' }));
                  }}
                  options={[
                    { label: 'Cash Payment', value: 'cash' },
                    { label: 'Credit/Debit Card', value: 'card' },
                    { label: 'Bank Transfer', value: 'bank_transfer' },
                    { label: 'Online / UPI', value: 'online' },
                    { label: 'Other', value: 'other' }
                  ]}
                  searchable={false}
                  clearable={false}
                />

                <Input 
                  label="Payment Date" 
                  type="date"
                  value={paymentForm.payment_date}
                  error={paymentErrors.payment_date}
                  onChange={(e) => {
                    setPaymentForm(prev => ({ ...prev, payment_date: e.target.value }));
                    setPaymentErrors(prev => ({ ...prev, payment_date: '' }));
                  }}
                  required
                />
              </div>

              {paymentForm.payment_mode !== 'cash' && (
                <Input 
                  label="Reference / Transaction Number" 
                  placeholder="Cheque No, Txn ID, etc."
                  value={paymentForm.reference_number}
                  error={paymentErrors.reference_number}
                  onChange={(e) => {
                    setPaymentForm(prev => ({ ...prev, reference_number: e.target.value }));
                    setPaymentErrors(prev => ({ ...prev, reference_number: '' }));
                  }}
                />
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Remarks / Notes
                </label>
                <textarea 
                  rows={2}
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Add internal ledger notes here..."
                  className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setPaymentModalOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record Payment'}
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
