import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, CalendarDays, CalendarCheck,
  CalendarX, CalendarClock, Pill, Clock,
  ExternalLink, Info
} from 'lucide-react';
import { notificationApi } from '../../api/notification';
import type { NotificationItem } from '../../types';
import { formatDateTime } from '../../lib/utils';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore network errors on badge polling
    }
  };

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications({ page: 0, size: 5 });
      setNotifications(res.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchRecent();
      fetchUnreadCount();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('CANCELLED')) {
      return <CalendarX className="w-4 h-4 text-danger" />;
    }
    if (t.includes('REMINDER')) {
      return <CalendarClock className="w-4 h-4 text-warning" />;
    }
    if (t.includes('CONFIRMED')) {
      return <CalendarCheck className="w-4 h-4 text-primary" />;
    }
    if (t.includes('APPOINTMENT')) {
      return <CalendarDays className="w-4 h-4 text-primary" />;
    }
    if (t.includes('PRESCRIPTION')) {
      return <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    return <Info className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative min-w-[44px] min-h-[44px] p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            aria-live="polite"
            className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-modal z-50 overflow-hidden text-foreground"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-secondary">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="badge badge-blue text-[10px] py-0.5 px-2">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {loading ? (
                <div className="py-8 text-center text-xs text-muted">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted">
                  No notifications
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.read) handleMarkAsRead(item.id, { stopPropagation: () => {} } as any);
                    }}
                    className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-surface-secondary/70 cursor-pointer ${
                      !item.read ? 'bg-primary-soft/30' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-surface border border-border flex-shrink-0 mt-0.5 shadow-subtle">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!item.read ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                          {item.title}
                        </p>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-surface-secondary border-t border-border text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="w-full py-1.5 text-xs font-semibold text-primary hover:text-primary-hover flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View All Notifications</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
