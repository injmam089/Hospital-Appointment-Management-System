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
    blue:   'bg-primary',
    green:  'bg-success',
    red:    'bg-danger',
    amber:  'bg-warning',
    purple: 'bg-medical-purple',
    gray:   'bg-muted',
  };

  return (
    <span className={cn(variantClasses[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function AppointmentStatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  const config = getAppointmentStatusConfig(status);
  const StatusIcon = config.icon;
  return (
    <span className={cn('badge gap-1.5 px-2.5 py-0.5', config.className, className)}>
      <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
