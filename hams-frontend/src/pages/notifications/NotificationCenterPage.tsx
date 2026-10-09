import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, CheckCheck, CalendarDays, Pill,
  Clock, ArrowLeft, Info, CheckCircle2,
  ChevronLeft, ChevronRight, CalendarCheck,
  CalendarX, CalendarClock
} from 'lucide-react';
import { notificationApi } from '../../api/notification';
import type { NotificationItem, PageResponse } from '../../types';
import { formatDateTime } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/LoadingSkeleton';
import { useAuthStore } from '../../store/authStore';
import { PatientNavbar } from '../../components/layout/PatientNavbar';
import { DoctorNavbar } from '../../components/layout/DoctorNavbar';
import { AdminNavbar } from '../../components/layout/AdminNavbar';
import toast from 'react-hot-toast';

export function NotificationCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [pageData, setPageData] = useState<PageResponse<NotificationItem> | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';

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
    const t = type.toUpperCase();
    if (t.includes('CANCELLED')) {
      return <CalendarX className="w-5 h-5 text-danger" />;
    }
    if (t.includes('REMINDER')) {
      return <CalendarClock className="w-5 h-5 text-warning" />;
    }
    if (t.includes('CONFIRMED')) {
      return <CalendarCheck className="w-5 h-5 text-primary" />;
    }
    if (t.includes('APPOINTMENT')) {
      return <CalendarDays className="w-5 h-5 text-primary" />;
    }
    if (t.includes('PRESCRIPTION')) {
      return <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    return <Info className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      {isPatient && <PatientNavbar />}
      {isDoctor && <DoctorNavbar />}
      {isAdmin && <AdminNavbar currentTab="notifications" />}

      <main className="page-container max-w-4xl py-8 space-y-6 flex-1">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-surface-secondary transition-colors"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                Notification Center
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Updates regarding your hospital appointments, schedules, and digital prescriptions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
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
        <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-xl w-fit shadow-subtle">
          <button
            onClick={() => {
              setTab('ALL');
              setCurrentPage(0);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'ALL'
                ? 'bg-primary text-white shadow-subtle'
                : 'text-muted hover:text-foreground hover:bg-surface-secondary'
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
                ? 'bg-primary text-white shadow-subtle'
                : 'text-muted hover:text-foreground hover:bg-surface-secondary'
            }`}
          >
            Unread
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border rounded-2xl shadow-subtle overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/40">
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
            <div className="p-8 text-center">
              <EmptyState.Notifications />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pageData.content.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-5 flex items-start gap-4 transition-colors hover:bg-surface-secondary/60 ${
                    !item.read ? 'bg-primary-soft/30' : ''
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-surface border border-border shadow-subtle flex-shrink-0">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm ${!item.read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
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

                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted bg-surface-secondary px-2 py-0.5 rounded-lg border border-border">
                        {item.type.replace(/_/g, ' ')}
                      </span>

                      {!item.read && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
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
            <div className="p-4 bg-surface-secondary border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted">
                Showing Page <span className="font-semibold text-foreground">{pageData.number + 1}</span> of{' '}
                <span className="font-semibold text-foreground">{pageData.totalPages}</span> ({pageData.totalElements} total)
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
      </main>
    </div>
  );
}
