import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Calendar,
  FileText,
  Clock,
  ArrowLeft,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { notificationApi } from '../../api/notification';
import type { NotificationItem, PageResponse } from '../../types';
import { formatDateTime } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export function NotificationCenterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [pageData, setPageData] = useState<PageResponse<NotificationItem> | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async (page = 0, unreadOnly = false) => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications({
        page,
        size: 15,
        unreadOnly: unreadOnly ? true : undefined,
      });
      setPageData(data);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(currentPage, tab === 'UNREAD');
  }, [currentPage, tab]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setPageData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          content: prev.content.map((n) => (n.id === id ? { ...n, read: true } : n)),
        };
      });
      toast.success('Marked as read');
    } catch {
      toast.error('Could not update notification.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setPageData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          content: prev.content.map((n) => ({ ...n, read: true })),
        };
      });
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('APPOINTMENT')) {
      return <Calendar className="w-5 h-5 text-primary-600" />;
    }
    if (type.includes('PRESCRIPTION')) {
      return <FileText className="w-5 h-5 text-emerald-600" />;
    }
    return <Info className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="page-container max-w-4xl">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white border border-border text-navy hover:bg-slate-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-display text-navy flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary-600" />
                Notification Center
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Updates regarding your hospital appointments and medical prescriptions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 p-1 bg-white border border-border rounded-xl mb-6 w-fit shadow-sm">
          <button
            onClick={() => {
              setTab('ALL');
              setCurrentPage(0);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'ALL'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-muted hover:text-navy hover:bg-slate-50'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => {
              setTab('UNREAD');
              setCurrentPage(0);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'UNREAD'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-muted hover:text-navy hover:bg-slate-50'
            }`}
          >
            Unread
          </button>
        </div>

        {/* Content */}
        <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !pageData || pageData.content.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8 text-muted" />}
              title={tab === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
              description="You will receive alerts here when your appointments change or prescriptions are created."
            />
          ) : (
            <div className="divide-y divide-border">
              {pageData.content.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/80 ${
                    !item.read ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="p-3 rounded-xl bg-white border border-border shadow-sm flex-shrink-0">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm ${!item.read ? 'font-bold text-navy' : 'font-medium text-slate-800'}`}>
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="badge badge-blue text-[10px] py-0.5 px-2">New</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted bg-slate-100 px-2 py-0.5 rounded">
                        {item.type.replace(/_/g, ' ')}
                      </span>

                      {!item.read && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pageData && pageData.totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted">
                Showing Page <span className="font-semibold text-navy">{pageData.number + 1}</span> of{' '}
                <span className="font-semibold text-navy">{pageData.totalPages}</span> ({pageData.totalElements} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageData.first}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageData.last}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
