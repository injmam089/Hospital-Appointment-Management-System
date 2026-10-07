import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Calendar,
  FileText,
  Clock,
  ExternalLink,
  Info,
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

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type: string) => {
    if (type.includes('APPOINTMENT')) {
      return <Calendar className="w-4 h-4 text-primary-600" />;
    }
    if (type.includes('PRESCRIPTION')) {
      return <FileText className="w-4 h-4 text-emerald-600" />;
    }
    return <Info className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 rounded-xl text-navy/70 hover:text-navy hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-medical-red text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-border rounded-2xl shadow-modal z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-navy">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="badge badge-blue text-[10px] py-0.5 px-2">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
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
                    className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                      !item.read ? 'bg-primary-50/40' : ''
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white border border-border flex-shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!item.read ? 'font-semibold text-navy' : 'font-medium text-slate-700'}`}>
                          {item.title}
                        </p>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2 mt-0.5">
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
            <div className="p-2.5 bg-slate-50 border-t border-border text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="w-full py-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1.5 transition-colors"
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
