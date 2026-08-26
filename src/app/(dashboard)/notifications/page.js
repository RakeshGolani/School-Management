'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Megaphone, 
  Send, 
  CheckCheck, 
  Trash2, 
  Search, 
  AlertTriangle, 
  CreditCard, 
  Bus, 
  FileText, 
  Clock, 
  Sparkles, 
  Check, 
  Plus, 
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react';
import { 
  getSchoolNotificationsAction, 
  markSchoolNotificationReadAction, 
  markAllSchoolNotificationsReadAction, 
  broadcastAnnouncementAction, 
  deleteSchoolNotificationAction 
} from '@/actions/school/notificationActions';
import { getClassesAction } from '@/actions/school/classActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import NotificationPageSkeleton from '@/components/skeletons/school/NotificationPageSkeleton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';

export default function SchoolNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [readFilter, setReadFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Announcement Composer Modal state
  const [composerOpen, setComposerOpen] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [targetRoles, setTargetRoles] = useState(['TEACHER', 'PARENT', 'STUDENT']);
  const [targetClassId, setTargetClassId] = useState('');
  const [classesList, setClassesList] = useState([]);

  // Confirm delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSchoolNotificationsAction({
        page: currentPage,
        limit: 15,
        type: activeType,
        is_read: readFilter,
        search: searchTerm
      });

      if (res && res.success) {
        setNotifications(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalCount(res.meta?.total || 0);
      } else {
        notifyError(res?.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error(err);
      notifyError('Network error while loading notifications');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeType, readFilter, searchTerm]);

  const loadClasses = async () => {
    try {
      const res = await getClassesAction();
      if (res && res.success && Array.isArray(res.data)) {
        setClassesList(res.data);
      }
    } catch (e) {
      console.warn('Error loading classes:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    loadClasses();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markSchoolNotificationReadAction(id);
      if (res && res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        notifySuccess('Marked as read');
      }
    } catch (e) {
      notifyError('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllSchoolNotificationsReadAction();
      if (res && res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        notifySuccess('All notifications marked as read');
      }
    } catch (e) {
      notifyError('Failed to mark all as read');
    }
  };

  const handleDelete = async () => {
    if (!selectedNotifId) return;
    try {
      const res = await deleteSchoolNotificationAction(selectedNotifId);
      if (res && res.success) {
        notifySuccess('Notification deleted');
        setNotifications(prev => prev.filter(n => n.id !== selectedNotifId));
        setDeleteModalOpen(false);
      } else {
        notifyError(res?.message || 'Failed to delete notification');
      }
    } catch (e) {
      notifyError('Error deleting notification');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      notifyError('Please fill in title and message');
      return;
    }
    if (targetRoles.length === 0 && !targetClassId) {
      notifyError('Please select at least one recipient audience');
      return;
    }

    setSendingAnnouncement(true);
    try {
      const res = await broadcastAnnouncementAction({
        title: title.trim(),
        message: message.trim(),
        priority,
        target_roles: targetRoles,
        target_class_id: targetClassId ? parseInt(targetClassId, 10) : null
      });

      if (res && res.success) {
        notifySuccess('Announcement broadcasted successfully!');
        setComposerOpen(false);
        setTitle('');
        setMessage('');
        setPriority('NORMAL');
        setTargetClassId('');
        setTargetRoles(['TEACHER', 'PARENT', 'STUDENT']);
        fetchNotifications();
      } else {
        notifyError(res?.message || 'Failed to broadcast announcement');
      }
    } catch (err) {
      console.error(err);
      notifyError('Network error while broadcasting announcement');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const toggleRole = (role) => {
    setTargetRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  // Helper for notification category icon & color
  const getIcon = (type) => {
    switch (type) {
      case 'ATTENDANCE':
        return <AlertTriangle size={18} className="text-amber-600" />;
      case 'FEE':
        return <CreditCard size={18} className="text-emerald-600" />;
      case 'TRANSPORT':
        return <Bus size={18} className="text-blue-600" />;
      case 'LEAVE':
        return <FileText size={18} className="text-purple-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone size={18} className="text-rose-600" />;
      case 'TIMETABLE':
        return <Clock size={18} className="text-indigo-600" />;
      default:
        return <Sparkles size={18} className="text-primary-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'ATTENDANCE':
        return 'bg-amber-50 border-amber-200/60';
      case 'FEE':
        return 'bg-emerald-50 border-emerald-200/60';
      case 'TRANSPORT':
        return 'bg-blue-50 border-blue-200/60';
      case 'LEAVE':
        return 'bg-purple-50 border-purple-200/60';
      case 'ANNOUNCEMENT':
        return 'bg-rose-50 border-rose-200/60';
      case 'TIMETABLE':
        return 'bg-indigo-50 border-indigo-200/60';
      default:
        return 'bg-primary-50 border-primary-200/60';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🌟 Header Banner Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-100/70 text-primary-600 shadow-xs">
              <Bell size={20} />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Institutional Notification & Circular Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Live stream of attendance telemetry, automated fee reminders, transit logs, leave requests, and institutional broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
            className="!py-2 !px-4 text-xs font-bold"
          >
            Mark All Read
          </Button>

          <Button
            variant="primary"
            icon={Megaphone}
            onClick={() => setComposerOpen(true)}
            className="!py-2 !px-4 text-xs font-bold shadow-md shadow-primary-500/20"
          >
            Send Announcement
          </Button>
        </div>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Updates' },
              { id: 'ANNOUNCEMENT', label: '📢 Circulars' },
              { id: 'ATTENDANCE', label: '⚠️ Attendance' },
              { id: 'FEE', label: '💳 Fees' },
              { id: 'LEAVE', label: '📝 Leaves' },
              { id: 'TRANSPORT', label: '🚌 Transport' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveType(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Read status filter */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search updates..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-primary-500"
              />
            </div>

            <div className="w-40 shrink-0">
              <Select
                options={[
                  { value: '', label: 'Status: All' },
                  { value: 'false', label: 'Unread Only' },
                  { value: 'true', label: 'Read Only' }
                ]}
                value={readFilter}
                onChange={(e) => {
                  setReadFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Status: All"
                searchable={false}
                clearable={false}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 📋 Notification Stream List */}
      {loading ? (
        <NotificationPageSkeleton />
      ) : notifications.length === 0 ? (
        <Card className="p-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Check size={28} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Notifications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no activity logs or circulars matching the selected filters.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isUnread = !item.is_read;
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-primary-50/30 hover:bg-primary-50/50 border-primary-200/70 shadow-xs'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-2xs'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center border ${getBgColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-sm tracking-tight ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                        {item.title}
                      </h4>

                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-600 text-white uppercase tracking-wider">
                          New
                        </span>
                      )}

                      {item.priority === 'URGENT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Urgent
                        </span>
                      )}

                      {item.recipient_type === 'BROADCAST' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Users size={11} />
                          Broadcast
                        </span>
                      )}

                      {item.targetClass && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          Class {item.targetClass.class_name}-{item.targetClass.section}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={12} />
                        {new Date(item.created_at || item.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      {item.sender_type && (
                        <span>Sender: <strong className="text-slate-600 font-semibold">{item.sender_type}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {isUnread && (
                    <Tooltip content="Mark as Read">
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition cursor-pointer"
                      >
                        <Check size={16} />
                      </button>
                    </Tooltip>
                  )}

                  <Tooltip content="Delete Notification" variant="danger">
                    <button
                      onClick={() => {
                        setSelectedNotifId(item.id);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalCount} updates)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 📢 Broadcast Announcement Drawer Modal */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-slideLeft">
            
            {/* Drawer Header (Fixed) */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Broadcast Announcement
                  </h3>
                  <p className="text-xs text-slate-500">
                    Send circular to teachers, parents, students or specific classes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setComposerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <form id="broadcast-form" onSubmit={handleSendBroadcast} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Target Audience Checkboxes */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  1. Target Audience Roles
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'TEACHER', label: '👨‍🏫 Teachers' },
                    { key: 'PARENT', label: '👨‍👩‍👧 Parents' },
                    { key: 'STUDENT', label: '🎓 Students' }
                  ].map((role) => (
                    <button
                      type="button"
                      key={role.key}
                      onClick={() => toggleRole(role.key)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        targetRoles.includes(role.key)
                          ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-xs ring-1 ring-primary-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Class Scope (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  2. Specific Class Scope (Optional)
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 cursor-pointer"
                >
                  <option value="">All Classes / School-wide</option>
                  {classesList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Class {cls.class_name} - {cls.section} ({cls.room_number || 'Room'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Select a class if this circular only pertains to a particular grade/section.
                </p>
              </div>

              {/* Priority Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  3. Urgency / Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['NORMAL', 'HIGH', 'URGENT'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        priority === p
                          ? p === 'URGENT'
                            ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-500'
                            : 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  4. Circular Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Sports Day Schedule & Instructions"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 font-semibold"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  5. Detailed Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type the full announcement message here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-primary-500 leading-relaxed resize-none"
                />
              </div>
            </form>

            {/* Drawer Footer (Fixed) */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                type="button"
                onClick={() => setComposerOpen(false)}
                disabled={sendingAnnouncement}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                form="broadcast-form"
                disabled={sendingAnnouncement}
                className="flex items-center gap-2 shadow-md shadow-primary-500/20"
              >
                {sendingAnnouncement ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Announcement</span>
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        type="danger"
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />

    </div>
  );
}
