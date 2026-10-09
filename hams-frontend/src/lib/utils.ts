import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import type { AppointmentStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, fmt = 'MMM dd, yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr: string): string {
  try {
    // timeStr is HH:mm:ss or HH:mm
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM dd, yyyy • h:mm a');
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

import { getAppointmentStatusIcon } from '../config/iconRegistry';
import type { LucideIcon } from 'lucide-react';

export function getAppointmentStatusConfig(status: AppointmentStatus): { label: string; className: string; dotColor: string; icon: LucideIcon } {
  const icon = getAppointmentStatusIcon(status);
  const config: Record<AppointmentStatus, { label: string; className: string; dotColor: string; icon: LucideIcon }> = {
    PENDING:         { label: 'Pending',         className: 'badge-amber',  dotColor: 'bg-amber-500', icon },
    CONFIRMED:       { label: 'Confirmed',       className: 'badge-blue',   dotColor: 'bg-primary-600', icon },
    CHECKED_IN:      { label: 'Checked In',      className: 'badge-amber',  dotColor: 'bg-amber-500', icon },
    IN_CONSULTATION: { label: 'In Consultation', className: 'badge-purple', dotColor: 'bg-purple-600', icon },
    COMPLETED:       { label: 'Completed',       className: 'badge-green',  dotColor: 'bg-emerald-500', icon },
    CANCELLED:       { label: 'Cancelled',       className: 'badge-red',    dotColor: 'bg-red-500', icon },
    REJECTED:        { label: 'Rejected',        className: 'badge-red',    dotColor: 'bg-red-500', icon },
    NO_SHOW:         { label: 'No Show',         className: 'badge-gray',   dotColor: 'bg-slate-400', icon },
    RESCHEDULED:     { label: 'Rescheduled',     className: 'badge-blue',   dotColor: 'bg-primary-500', icon },
  };
  return config[status] || { label: status, className: 'badge-gray', dotColor: 'bg-slate-400', icon };
}

export function generateInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
