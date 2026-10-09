import { motion } from 'framer-motion';
import { CalendarDays, Pill, Stethoscope, Bell, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {icon && (
        <div
          className="w-14 h-14 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center mb-3 text-muted"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-display font-semibold text-foreground mb-1 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm leading-relaxed mb-5">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}

// Preset Clinical Empty States
EmptyState.Appointments = function EmptyAppointments({
  title = 'No upcoming appointments',
  description = "You don't have any scheduled visits yet.",
  action,
  className,
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<CalendarDays className="w-6 h-6 text-primary" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
};

EmptyState.Prescriptions = function EmptyPrescriptions({
  title = 'No prescriptions yet',
  description = 'Your prescribed medications will appear here after clinician consultation.',
  action,
  className,
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<Pill className="w-6 h-6 text-medical-green" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
};

EmptyState.Doctors = function EmptyDoctors({
  title = 'No clinicians found',
  description = 'Try changing your search terms or selecting a different medical department.',
  action,
  className,
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<Stethoscope className="w-6 h-6 text-primary" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
};

EmptyState.Notifications = function EmptyNotifications({
  title = "You're all caught up",
  description = 'No new hospital notifications at the moment.',
  action,
  className,
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<Bell className="w-6 h-6 text-muted" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
};

EmptyState.AuditLogs = function EmptyAuditLogs({
  title = 'No audit logs recorded',
  description = 'System operations and security audit footprints will be tracked here.',
  action,
  className,
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<ShieldCheck className="w-6 h-6 text-slate-500" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
};
