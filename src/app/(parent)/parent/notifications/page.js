'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  Search, 
  AlertTriangle, 
  CreditCard, 
  Bus, 
  FileText, 
  Clock, 
  Sparkles, 
  Check, 
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  getParentNotificationsAction, 
  markParentNotificationReadAction, 
  markAllParentNotificationsReadAction 
} from '@/actions/parent/notificationActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import ParentNotificationSkeleton from '@/components/skeletons/parent/ParentNotificationSkeleton';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

export default function ParentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('ALL');
  const [readFilter, setReadFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getParentNotificationsAction({
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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, actionUrl) => {
    try {
      const res = await markParentNotificationReadAction(id);
      if (res && res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        notifySuccess('Marked as read');
        if (actionUrl) {
          router.push(actionUrl);
        }
      }
    } catch (e) {
      notifyError('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllParentNotificationsReadAction();
      if (res && res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        notifySuccess('All notifications marked as read');
      }
    } catch (e) {
      notifyError('Failed to mark all as read');
    }
  };

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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-primary-50/40 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-100/70 text-primary-600 shadow-xs">
              <Bell size={20} />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Guardian Notification & Safety Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Live updates on ward attendance, Smart Bus transit arrivals, fee receipts, and institutional circulars.
          </p>
        </div>

        <Button
          variant="outline"
          icon={CheckCheck}
          onClick={handleMarkAllRead}
          className="!py-2 !px-4 text-xs font-bold shrink-0 self-start sm:self-auto"
        >
          Mark All Read
        </Button>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Updates' },
              { id: 'ATTENDANCE', label: '⚠️ Attendance Alerts' },
              { id: 'FEE', label: '💳 Fee Invoices & Receipts' },
              { id: 'TRANSPORT', label: '🚌 Bus Tracking' },
              { id: 'ANNOUNCEMENT', label: '📢 School Circulars' },
              { id: 'LEAVE', label: '📝 Leave Status' }
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
                placeholder="Search alerts..."
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
        <ParentNotificationSkeleton />
      ) : notifications.length === 0 ? (
        <Card className="p-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Check size={28} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not have any new updates or alerts at the moment.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isUnread = !item.is_read;
            return (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id, item.action_url)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
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

                      {item.priority === 'HIGH' || item.priority === 'URGENT' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {item.priority}
                        </span>
                      ) : null}
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

                      {item.action_url && (
                        <span className="text-primary-600 font-bold flex items-center gap-1">
                          View Details <ExternalLink size={11} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right unread check */}
                {isUnread && (
                  <Tooltip content="Mark as Read">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition cursor-pointer shrink-0"
                    >
                      <Check size={16} />
                    </button>
                  </Tooltip>
                )}
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

    </div>
  );
}
