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

export function getAppointmentStatusConfig(status: AppointmentStatus) {
  const config: Record<AppointmentStatus, { label: string; className: string; dotColor: string }> = {
    PENDING:         { label: 'Pending',         className: 'badge-amber',  dotColor: 'bg-amber-500' },
    CONFIRMED:       { label: 'Confirmed',       className: 'badge-blue',   dotColor: 'bg-primary-600' },
    CHECKED_IN:      { label: 'Checked In',      className: 'badge-amber',  dotColor: 'bg-amber-500' },
    IN_CONSULTATION: { label: 'In Consultation', className: 'badge-purple', dotColor: 'bg-purple-600' },
    COMPLETED:       { label: 'Completed',       className: 'badge-green',  dotColor: 'bg-emerald-500' },
    CANCELLED:       { label: 'Cancelled',       className: 'badge-red',    dotColor: 'bg-red-500' },
    REJECTED:        { label: 'Rejected',        className: 'badge-red',    dotColor: 'bg-red-500' },
    NO_SHOW:         { label: 'No Show',         className: 'badge-gray',   dotColor: 'bg-slate-400' },
    RESCHEDULED:     { label: 'Rescheduled',     className: 'badge-blue',   dotColor: 'bg-primary-500' },
  };
  return config[status] || { label: status, className: 'badge-gray', dotColor: 'bg-slate-400' };
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
