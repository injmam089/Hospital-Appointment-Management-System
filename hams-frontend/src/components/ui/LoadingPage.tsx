import { motion } from 'framer-motion';
import { Stethoscope, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading HAMS clinical services...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="flex flex-col items-center gap-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        role="status"
        aria-live="polite"
      >
        <motion.div
          className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-card"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Stethoscope className="w-7 h-7 text-white" strokeWidth={2} aria-hidden="true" />
        </motion.div>
        <p className="text-sm font-medium text-muted tracking-tight">{message}</p>
      </motion.div>
    </div>
  );
}

export function LoadingSpinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizes[size], className)}
      aria-label="Loading..."
      role="status"
    />
  );
}

export function SectionLoader({
  message = 'Loading data...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-12 px-4 gap-3 text-muted', className)}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="md" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
}
