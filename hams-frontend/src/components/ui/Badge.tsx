import { cn } from '../../lib/utils';
import type { AppointmentStatus } from '../../types';
import { getAppointmentStatusConfig } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray';
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = 'gray', className, dot }: BadgeProps) {
  const variantClasses = {
    blue:   'badge-blue',
    green:  'badge-green',
    red:    'badge-red',
    amber:  'badge-amber',
    purple: 'badge-purple',
    gray:   'badge-gray',
  };
  const dotColors = {
    blue:   'bg-primary-600',
    green:  'bg-emerald-500',
    red:    'bg-red-500',
    amber:  'bg-amber-500',
    purple: 'bg-purple-600',
    gray:   'bg-slate-400',
  };

  return (
    <span className={cn(variantClasses[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config = getAppointmentStatusConfig(status);
  return (
    <span className={cn('badge', config.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}
