'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  Bus, 
  FileText, 
  Megaphone, 
  Sparkles, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

// Server Actions imports
import { 
  getSchoolNotificationsAction, 
  getSchoolUnreadCountAction, 
  markSchoolNotificationReadAction, 
  markAllSchoolNotificationsReadAction 
} from '@/actions/school/notificationActions';
import { 
  getTeacherNotificationsAction, 
  getTeacherUnreadCountAction, 
  markTeacherNotificationReadAction, 
  markAllTeacherNotificationsReadAction 
} from '@/actions/teacher/notificationActions';
import { 
  getStudentNotificationsAction, 
  getStudentUnreadCountAction, 
  markStudentNotificationReadAction, 
  markAllStudentNotificationsReadAction 
} from '@/actions/student/notificationActions';
import { 
  getParentNotificationsAction, 
  getParentUnreadCountAction, 
  markParentNotificationReadAction, 
  markAllParentNotificationsReadAction 
} from '@/actions/parent/notificationActions';

// Static dictionary of role-specific actions
const ROLE_ACTIONS_MAP = {
  teacher: {
    getNotifications: getTeacherNotificationsAction,
    getUnreadCount: getTeacherUnreadCountAction,
    markRead: markTeacherNotificationReadAction,
    markAllRead: markAllTeacherNotificationsReadAction,
    viewAllPath: '/teacher/notifications'
  },
  student: {
    getNotifications: getStudentNotificationsAction,
    getUnreadCount: getStudentUnreadCountAction,
    markRead: markStudentNotificationReadAction,
    markAllRead: markAllStudentNotificationsReadAction,
    viewAllPath: '/student/notifications'
  },
  parent: {
    getNotifications: getParentNotificationsAction,
    getUnreadCount: getParentUnreadCountAction,
    markRead: markParentNotificationReadAction,
    markAllRead: markAllParentNotificationsReadAction,
    viewAllPath: '/parent/notifications'
  },
  school: {
    getNotifications: getSchoolNotificationsAction,
    getUnreadCount: getSchoolUnreadCountAction,
    markRead: markSchoolNotificationReadAction,
    markAllRead: markAllSchoolNotificationsReadAction,
    viewAllPath: '/notifications'
  }
};

export default function NotificationBellDropdown({ role = 'school' }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'ANNOUNCEMENT'

  const dropdownRef = useClickOutside(() => setIsOpen(false));

  const actions = ROLE_ACTIONS_MAP[role] || ROLE_ACTIONS_MAP.school;

  // Load unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await actions.getUnreadCount();
      if (res && res.success && res.data) {
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (e) {
      console.warn('Failed to fetch unread count:', e);
    }
  }, [actions]);

  // Load notifications for preview
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await actions.getNotifications({
        page: 1,
        limit: 8,
        type: activeTab === 'ANNOUNCEMENT' ? 'ANNOUNCEMENT' : 'ALL',
        is_read: activeTab === 'UNREAD' ? 'false' : ''
      });
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [actions, activeTab]);

  // Periodic polling for unread badge count
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch items when dropdown opens or active tab changes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (id, actionUrl) => {
    try {
      await actions.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (actionUrl) {
        setIsOpen(false);
        router.push(actionUrl);
      }
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await actions.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  // Helper for notification category icon & color
  const getIcon = (type) => {
    switch (type) {
      case 'ATTENDANCE':
        return <AlertTriangle size={15} className="text-amber-600" />;
      case 'FEE':
        return <CreditCard size={15} className="text-emerald-600" />;
      case 'TRANSPORT':
        return <Bus size={15} className="text-blue-600" />;
      case 'LEAVE':
        return <FileText size={15} className="text-purple-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone size={15} className="text-rose-600" />;
      case 'TIMETABLE':
        return <Clock size={15} className="text-indigo-600" />;
      default:
        return <Sparkles size={15} className="text-primary-600" />;
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

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Header Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer relative shadow-2xs group"
        title="Notifications"
        type="button"
      >
        <Bell size={18} className="group-hover:rotate-12 transition-transform duration-300" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 📋 Dropdown Flyout */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-[100] animate-fadeIn overflow-hidden flex flex-col max-h-[540px]">
          
          {/* Header */}
          <div className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shadow-xs">
                <Bell size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Notifications</h4>
                <p className="text-[11px] text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'You are all caught up'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('UNREAD')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'UNREAD'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ANNOUNCEMENT')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                activeTab === 'ANNOUNCEMENT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Broadcasts
            </button>
          </div>

          {/* Notification List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {loading ? (
              <div className="p-1 space-y-2 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-200/80 shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="h-3 w-32 bg-slate-200 rounded" />
                        <div className="h-2.5 w-10 bg-slate-200/60 rounded" />
                      </div>
                      <div className="h-2.5 w-full bg-slate-200/70 rounded" />
                      <div className="h-2 w-3/4 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                  <Check size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications found</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  {activeTab === 'UNREAD' ? 'You have read all your alerts.' : 'Important activity updates will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.is_read;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id, n.action_url)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 relative ${
                      isUnread
                        ? 'bg-primary-50/40 hover:bg-primary-50/70 border border-primary-200/50'
                        : 'bg-white hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {/* Category Icon */}
                    <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${getBgColor(n.type)}`}>
                      {getIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className={`text-xs truncate ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                          {n.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                          {formatTimeAgo(n.created_at || n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      
                      {n.targetClass && (
                        <span className="inline-block mt-1 text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                          Class {n.targetClass.class_name}-{n.targetClass.section}
                        </span>
                      )}
                    </div>

                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(actions.viewAllPath);
              }}
              className="w-full py-2 text-xs font-black text-primary-600 hover:text-primary-800 flex items-center justify-center gap-1.5 transition hover:underline cursor-pointer"
            >
              <span>View All Notifications</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
