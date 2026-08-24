'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bus, Map, MapPin, Users, Plus, Edit3, Trash2, X
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import FormPhoneInput from '@/components/FormPhoneInput';
import Switch from '@/components/ui/Switch';
import { notifySuccess, notifyError } from '@/lib/notify';
import { handleConfirmDelete, formatPhoneNumber } from '@/lib/commonHandlers';
import {
  getRoutesAction, createRouteAction, updateRouteAction, deleteRouteAction,
  getStopsAction, createStopAction, updateStopAction, deleteStopAction,
  getBusesAction, createBusAction, updateBusAction, deleteBusAction,
  getAssignedStudentsAction, updateStudentTransportAction
} from '@/actions/school/transportActions';
import { busSchema, routeSchema, stopSchema } from '@/validators/transportSchemas';
import dynamic from 'next/dynamic';
import { MapPin as MapPinIcon } from 'lucide-react'; // renamed for tab icon 

// Leaflet doesn't support SSR well, so we dynamically import the map components
const LiveTrackingMap = dynamic(() => import('./LiveTrackingMap'), { ssr: false });
const LocationPicker = dynamic(() => import('@/components/ui/LocationPicker'), { ssr: false });

export default function TransportManagementPage() {
  const [activeTab, setActiveTab] = useState('buses');
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data States
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [students, setStudents] = useState([]);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form States
  const [busForm, setBusForm] = useState({ bus_number: '', driver_name: '', driver_phone: '', route_id: '', device_id: '' });
  const [routeForm, setRouteForm] = useState({ route_name: '', route_code: '' });
  const [stopForm, setStopForm] = useState({ route_id: '', stop_name: '', sequence: 1, pickup_time: '', drop_off_time: '', latitude: '', longitude: '' });
  const [studentForm, setStudentForm] = useState({ bus_route_id: '', bus_stop_id: '' });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = async (schema, data) => {
    try {
      await schema.validate(data, { abortEarly: false });
      setFormErrors({});
      return true;
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
      return false;
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resBuses, resRoutes, resStops, resStudents] = await Promise.all([
        getBusesAction(), getRoutesAction(), getStopsAction(), getAssignedStudentsAction()
      ]);
      if (resBuses.success) setBuses(resBuses.data || []);
      if (resRoutes.success) setRoutes(resRoutes.data || []);
      if (resStops.success) setStops(resStops.data || []);
      if (resStudents.success) setStudents(resStudents.data || []);
    } catch (err) {
      notifyError('Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Generic Handlers
  const handleEdit = (item, type) => {
    setEditingItem(item);
    setModalType(type);
    setFormErrors({});
    if (type === 'bus') {
      setBusForm({ bus_number: item.bus_number, driver_name: item.driver_name, driver_phone: item.driver_phone || '', route_id: item.route_id || '', device_id: item.device_id || '' });
    } else if (type === 'route') {
      setRouteForm({ route_name: item.route_name, route_code: item.route_code });
    } else if (type === 'stop') {
      setStopForm({ 
        route_id: item.route_id, 
        stop_name: item.stop_name, 
        sequence: item.sequence, 
        pickup_time: item.pickup_time || '', 
        drop_off_time: item.drop_off_time || '',
        latitude: item.latitude !== undefined && item.latitude !== null ? String(item.latitude) : '',
        longitude: item.longitude !== undefined && item.longitude !== null ? String(item.longitude) : ''
      });
    } else if (type === 'student_transport') {
      setStudentForm({ bus_route_id: item.bus_route_id || '', bus_stop_id: item.bus_stop_id || '' });
    }
    setModalOpen(true);
  };

  const handleCreate = (type) => {
    setEditingItem(null);
    setModalType(type);
    setFormErrors({});
    if (type === 'bus') setBusForm({ bus_number: '', driver_name: '', driver_phone: '', route_id: '', device_id: '' });
    if (type === 'route') setRouteForm({ route_name: '', route_code: '' });
    if (type === 'stop') setStopForm({ route_id: routes.length ? routes[0].id : '', stop_name: '', sequence: (stops.length || 0) + 1, pickup_time: '', drop_off_time: '', latitude: '', longitude: '' });
    setModalOpen(true);
  };

  const handleDelete = (item, type) => {
    const actionMap = { bus: deleteBusAction, route: deleteRouteAction, stop: deleteStopAction };
    handleConfirmDelete(type, item.id, actionMap[type], () => fetchAllData());
  };

  // Submits
  const handleBusSubmit = async (e) => {
    e.preventDefault();
    if (!(await validateForm(busSchema, busForm))) return;
    setSaving(true);
    const res = editingItem ? await updateBusAction(editingItem.id, busForm) : await createBusAction(busForm);
    if (res.success) {
      notifySuccess(res.message);
      setModalOpen(false);
      fetchAllData();
    } else {
      if (res.errors) {
        setFormErrors(res.errors);
        notifyError('Please fix the highlighted errors.');
      } else notifyError(res.message);
    }
    setSaving(false);
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    if (!(await validateForm(routeSchema, routeForm))) return;
    setSaving(true);
    const res = editingItem ? await updateRouteAction(editingItem.id, routeForm) : await createRouteAction(routeForm);
    if (res.success) {
      notifySuccess(res.message);
      setModalOpen(false);
      fetchAllData();
    } else {
      if (res.errors) {
        setFormErrors(res.errors);
        notifyError('Please fix the highlighted errors.');
      } else notifyError(res.message);
    }
    setSaving(false);
  };

  const handleStopSubmit = async (e) => {
    e.preventDefault();
    if (!(await validateForm(stopSchema, stopForm))) return;
    setSaving(true);
    const res = editingItem ? await updateStopAction(editingItem.id, stopForm) : await createStopAction(stopForm);
    if (res.success) {
      notifySuccess(res.message);
      setModalOpen(false);
      fetchAllData();
    } else {
      if (res.errors) {
        setFormErrors(res.errors);
        notifyError('Please fix the highlighted errors.');
      } else notifyError(res.message);
    }
    setSaving(false);
  };

  const handleStudentTransportSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateStudentTransportAction(editingItem.id, studentForm);
    if (res.success) {
      notifySuccess(res.message || "Student transport assigned successfully.");
      setModalOpen(false);
      fetchAllData();
    } else notifyError(res.message);
    setSaving(false);
  };

  // Student toggle
  const toggleStudentTransport = async (student) => {
    const nextVal = !student.is_bus_service_enabled;
    const res = await updateStudentTransportAction(student.id, { is_bus_service_enabled: nextVal });
    if (res.success) {
      notifySuccess(`Bus service ${nextVal ? 'enabled' : 'disabled'} for ${student.first_name}`);
      fetchAllData();
    } else notifyError(res.message);
  };

  // ===================== COLUMNS =====================
  const routeOptions = routes.map(r => ({ value: String(r.id), label: `${r.route_name} (${r.route_code})` }));

  const busCols = [
    { header: 'Bus Number', accessor: 'bus_number', render: row => <span className="font-bold text-slate-900">{row.bus_number}</span> },
    { header: 'Driver Name', accessor: 'driver_name', render: row => <span className="text-slate-600">{row.driver_name}</span> },
    { header: 'Driver Phone', accessor: 'driver_phone', render: row => row.driver_phone ? formatPhoneNumber(row.driver_phone) : 'N/A' },
    { header: 'Assigned Route', accessor: 'route_id', render: row => {
        const r = routes.find(r => r.id === row.route_id);
        return r ? <Badge variant="primary">{r.route_name}</Badge> : <span className="text-slate-500">Unassigned</span>;
      } 
    },
    { header: 'Actions', accessor: 'actions', sortable: false, className: 'text-right', render: row => (
        <div className="flex justify-end gap-2">
          <Tooltip content="Edit Vehicle" position="top">
            <button type="button" onClick={() => handleEdit(row, 'bus')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer">
              <Edit3 size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete Vehicle" position="top" variant="danger">
            <button type="button" onClick={() => handleDelete(row, 'bus')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 text-slate-600 hover:text-rose-600 transition cursor-pointer">
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  const routeCols = [
    { header: 'Route Code', accessor: 'route_code', render: row => <Badge variant="primary" className="font-mono">{row.route_code}</Badge> },
    { header: 'Route Name', accessor: 'route_name', render: row => <span className="font-bold text-slate-900">{row.route_name}</span> },
    { header: 'Total Stops', accessor: 'stops', render: row => {
        const c = stops.filter(s => s.route_id === row.id).length;
        return <span className="text-slate-600">{c} Stops</span>;
      }
    },
    { header: 'Actions', accessor: 'actions', sortable: false, className: 'text-right', render: row => (
        <div className="flex justify-end gap-2">
          <Tooltip content="Edit Route" position="top">
            <button type="button" onClick={() => handleEdit(row, 'route')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer">
              <Edit3 size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete Route" position="top" variant="danger">
            <button type="button" onClick={() => handleDelete(row, 'route')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 text-slate-600 hover:text-rose-600 transition cursor-pointer">
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  const stopCols = [
    { header: 'Stop Name', accessor: 'stop_name', render: row => <span className="font-bold text-slate-900">{row.stop_name}</span> },
    { header: 'Route', accessor: 'route_id', render: row => {
        const r = routes.find(r => r.id === row.route_id);
        return r ? <span className="text-slate-600">{r.route_name}</span> : 'N/A';
      }
    },
    { header: 'Sequence', accessor: 'sequence', render: row => <span className="text-slate-500 text-xs">Stop #{row.sequence}</span> },
    { header: 'GPS Coordinates', accessor: 'latitude', render: row => (
        row.latitude && row.longitude ? (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700 font-bold">
            <MapPin size={11} className="text-primary-600 shrink-0" />
            {parseFloat(row.latitude).toFixed(4)}, {parseFloat(row.longitude).toFixed(4)}
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic">Not Set</span>
        )
      )
    },
    { header: 'Timings', accessor: 'pickup_time', render: row => (
        <div className="text-xs text-slate-500">
          <div>Pick: <span className="text-slate-700">{row.pickup_time || '--:--'}</span></div>
          <div>Drop: <span className="text-slate-700">{row.drop_off_time || '--:--'}</span></div>
        </div>
      )
    },
    { header: 'Actions', accessor: 'actions', sortable: false, className: 'text-right', render: row => (
        <div className="flex justify-end gap-2">
          <Tooltip content="Edit Stop" position="top">
            <button type="button" onClick={() => handleEdit(row, 'stop')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer">
              <Edit3 size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete Stop" position="top" variant="danger">
            <button type="button" onClick={() => handleDelete(row, 'stop')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 text-slate-600 hover:text-rose-600 transition cursor-pointer">
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  const studentCols = [
    { header: 'Student Name', accessor: 'first_name', render: row => <span className="font-bold text-slate-900">{row.first_name} {row.last_name}</span> },
    { header: 'Admission #', accessor: 'admission_number', render: row => <span className="font-mono text-slate-500">{row.admission_number}</span> },
    { header: 'Grade', accessor: 'grade', render: row => <Badge variant="primary">{row.grade}</Badge> },
    { header: 'Route', accessor: 'bus_route_id', render: row => {
        const r = routes.find(r => r.id === row.bus_route_id);
        return r ? <span className="text-slate-600 font-medium">{r.route_name}</span> : <span className="text-slate-400 italic">Unassigned</span>;
      }
    },
    { header: 'Stop', accessor: 'bus_stop_id', render: row => {
        const s = stops.find(s => s.id === row.bus_stop_id);
        return s ? <span className="text-slate-600 font-medium">{s.stop_name}</span> : <span className="text-slate-400 italic">Unassigned</span>;
      }
    },
    { header: 'Bus Access', accessor: 'is_bus_service_enabled', render: row => (
        <div className="flex items-center">
          <Switch checked={row.is_bus_service_enabled} onChange={() => toggleStudentTransport(row)} />
        </div>
      )
    },
    { header: 'Actions', accessor: 'actions', sortable: false, className: 'text-right', render: row => (
        <div className="flex justify-end gap-2">
          <Tooltip content="Assign Route & Stop" position="top">
            <button type="button" onClick={() => handleEdit(row, 'student_transport')} className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:border-primary-500 text-slate-600 hover:text-primary-600 transition cursor-pointer">
              <MapPin size={14} />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      {/* 🌟 Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-primary-50/40">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <Bus className="text-primary-600" size={24} /> Transport Management
          </h1>
          <p className="text-slate-500 text-xs">
            Manage buses, routes, pickup stops, and student subscriptions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'buses', label: 'Vehicles', icon: Bus },
          { id: 'live', label: 'Live Tracking', icon: MapPinIcon },
          { id: 'routes', label: 'Bus Routes', icon: Map },
          { id: 'stops', label: 'Pick/Drop Stops', icon: MapPin },
          { id: 'students', label: 'Student Subscribers', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary-50 text-primary-600 border border-primary-200 shadow-sm' 
                : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {(() => {
        if (activeTab === 'live') {
          return (
            <Card title="Live Bus Tracking" icon={MapPinIcon} subtitle="Monitor real-time locations of all active school buses on the route." className="p-0 overflow-hidden bg-white border-slate-200 shadow-sm">
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
                 <LiveTrackingMap />
              </div>
            </Card>
          );
        }

        let title, icon, subtitle, action, columns, data;
        switch (activeTab) {
          case 'buses':
            title = `Registered Vehicles (${buses.length})`; icon = Bus; subtitle = 'Manage your fleet of buses and transport vehicles.'; action = <Button onClick={() => handleCreate('bus')} icon={Plus} variant="primary">Add Bus</Button>; columns = busCols; data = buses;
            break;
          case 'routes':
            title = `Bus Routes (${routes.length})`; icon = Map; subtitle = 'Define transport paths and geographic routes.'; action = <Button onClick={() => handleCreate('route')} icon={Plus} variant="primary">Add Route</Button>; columns = routeCols; data = routes;
            break;
          case 'stops':
            title = `Pick / Drop Stops (${stops.length})`; icon = MapPin; subtitle = 'Manage pickup and drop-off points assigned to routes.'; action = <Button onClick={() => handleCreate('stop')} icon={Plus} variant="primary">Add Stop</Button>; columns = stopCols; data = stops;
            break;
          case 'students':
            title = `Student Subscribers (${students.length})`; icon = Users; subtitle = 'Manage transport access for enrolled students.'; action = null; columns = studentCols; data = students;
            break;
          default:
            return null;
        }

        const totalRecords = data.length;
        const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
        const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        return (
          <Card title={title} icon={icon} subtitle={subtitle} action={action} className="p-0 overflow-hidden bg-white border-slate-200">
            <DataTable 
              columns={columns} 
              data={paginatedData} 
              loading={loading} 
              emptyMessage={`No ${activeTab} found.`} 
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
        );
      })()}

      {/* Off-Canvas Drawer Modals */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-white border-l border-slate-200 w-full max-w-lg h-full flex flex-col shadow-2xl animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:p-8 pb-4 shrink-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 capitalize">
                  <Bus size={18} className="text-primary-600" />
                  {editingItem && modalType !== 'student_transport' ? 'Edit' : modalType === 'student_transport' ? 'Assign' : 'Add'} {modalType === 'student_transport' ? 'Transport' : modalType}
                </h2>
                <p className="text-xs text-slate-500">
                  {modalType === 'bus' ? 'Configure bus details and assign a route.' : 
                   modalType === 'route' ? 'Define route code and name.' : 
                   modalType === 'student_transport' ? `Assign transport for ${editingItem?.first_name}.` :
                   'Add stop details and timings.'}
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Container */}
            {modalType === 'bus' && (
              <form noValidate onSubmit={handleBusSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                  <Input label="Bus Number" value={busForm.bus_number} error={formErrors.bus_number} onChange={e => { setBusForm({...busForm, bus_number: e.target.value}); setFormErrors({...formErrors, bus_number: ''}); }} required />
                  <Input label="Driver Name" value={busForm.driver_name} error={formErrors.driver_name} onChange={e => { setBusForm({...busForm, driver_name: e.target.value}); setFormErrors({...formErrors, driver_name: ''}); }} required />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Phone</label>
                    <FormPhoneInput value={busForm.driver_phone} error={formErrors.driver_phone} onChange={val => { setBusForm({...busForm, driver_phone: val}); setFormErrors({...formErrors, driver_phone: ''}); }} />
                  </div>
                  <Select label="Assign Route" options={[{value: '', label: 'Select Route'}, ...routeOptions]} value={String(busForm.route_id)} error={formErrors.route_id} onChange={e => { setBusForm({...busForm, route_id: e.target.value}); setFormErrors({...formErrors, route_id: ''}); }} />
                  <Input label="GPS Device ID (Optional)" value={busForm.device_id} error={formErrors.device_id} onChange={e => { setBusForm({...busForm, device_id: e.target.value}); setFormErrors({...formErrors, device_id: ''}); }} />
                </div>
                {/* Footer */}
                <div className="p-4 sm:px-8 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-end space-x-3 shrink-0">
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={saving}>{editingItem ? 'Save Changes' : 'Create Bus'}</Button>
                </div>
              </form>
            )}

            {modalType === 'route' && (
              <form noValidate onSubmit={handleRouteSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                  <Input label="Route Code (Unique)" value={routeForm.route_code} error={formErrors.route_code} onChange={e => { setRouteForm({...routeForm, route_code: e.target.value}); setFormErrors({...formErrors, route_code: ''}); }} required />
                  <Input label="Route Name" value={routeForm.route_name} error={formErrors.route_name} onChange={e => { setRouteForm({...routeForm, route_name: e.target.value}); setFormErrors({...formErrors, route_name: ''}); }} required />
                </div>
                {/* Footer */}
                <div className="p-4 sm:px-8 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-end space-x-3 shrink-0">
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={saving}>{editingItem ? 'Save Changes' : 'Create Route'}</Button>
                </div>
              </form>
            )}

            {modalType === 'stop' && (
              <form noValidate onSubmit={handleStopSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                  <Select label="Bus Route" options={[{value: '', label: 'Select Route'}, ...routeOptions]} value={String(stopForm.route_id)} error={formErrors.route_id} onChange={e => { setStopForm({...stopForm, route_id: e.target.value}); setFormErrors({...formErrors, route_id: ''}); }} required />
                  <Input label="Stop Name" value={stopForm.stop_name} error={formErrors.stop_name} onChange={e => { setStopForm({...stopForm, stop_name: e.target.value}); setFormErrors({...formErrors, stop_name: ''}); }} required />
                  <Input label="Sequence Number" type="number" min="1" value={stopForm.sequence} error={formErrors.sequence} onChange={e => { setStopForm({...stopForm, sequence: e.target.value}); setFormErrors({...formErrors, sequence: ''}); }} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Pickup Time" type="time" value={stopForm.pickup_time} error={formErrors.pickup_time} onChange={e => { setStopForm({...stopForm, pickup_time: e.target.value}); setFormErrors({...formErrors, pickup_time: ''}); }} />
                    <Input label="Drop-off Time" type="time" value={stopForm.drop_off_time} error={formErrors.drop_off_time} onChange={e => { setStopForm({...stopForm, drop_off_time: e.target.value}); setFormErrors({...formErrors, drop_off_time: ''}); }} />
                  </div>

                  {/* Interactive Address Search & Pin-Drop Map Picker */}
                  <LocationPicker 
                    latitude={stopForm.latitude}
                    longitude={stopForm.longitude}
                    onLocationChange={({ latitude, longitude, displayName }) => {
                      setStopForm(prev => ({
                        ...prev,
                        latitude: String(latitude),
                        longitude: String(longitude),
                        stop_name: prev.stop_name || (displayName ? displayName.split(',')[0] : '')
                      }));
                      setFormErrors(prev => ({ ...prev, latitude: '', longitude: '' }));
                    }}
                  />
                </div>
                {/* Footer */}
                <div className="p-4 sm:px-8 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-end space-x-3 shrink-0">
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={saving}>{editingItem ? 'Save Changes' : 'Create Stop'}</Button>
                </div>
              </form>
            )}

            {modalType === 'student_transport' && (
              <form noValidate onSubmit={handleStudentTransportSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                  <Select 
                    label="Assign Bus Route" 
                    options={[{value: '', label: 'Select Route'}, ...routeOptions]} 
                    value={String(studentForm.bus_route_id)} 
                    onChange={e => setStudentForm({...studentForm, bus_route_id: e.target.value, bus_stop_id: ''})} 
                  />
                  
                  <Select 
                    label="Assign Pick/Drop Stop" 
                    options={[
                      {value: '', label: 'Select Stop'}, 
                      ...stops.filter(s => String(s.route_id) === String(studentForm.bus_route_id)).map(s => ({ value: String(s.id), label: s.stop_name }))
                    ]} 
                    value={String(studentForm.bus_stop_id)} 
                    onChange={e => setStudentForm({...studentForm, bus_stop_id: e.target.value})} 
                    disabled={!studentForm.bus_route_id}
                  />
                </div>
                {/* Footer */}
                <div className="p-4 sm:px-8 border-t border-slate-200 bg-slate-50/80 backdrop-blur-md flex items-center justify-end space-x-3 shrink-0">
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={saving}>Save Assignment</Button>
                </div>
              </form>
            )}

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
