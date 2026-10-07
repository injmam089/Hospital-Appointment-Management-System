import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-navy mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
