import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, hover = false, onClick, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  if (hover || onClick) {
    return (
      <motion.div
        className={cn('card rounded-2xl bg-surface border border-border text-foreground', paddingClasses[padding], onClick && 'cursor-pointer', className)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn('card rounded-2xl bg-surface border border-border text-foreground', paddingClasses[padding], className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'red';
  delay?: number;
}

export function StatCard({ title, value, icon, change, changeType = 'neutral', color = 'blue', delay = 0 }: StatCardProps) {
  const colorConfig = {
    blue:  { bg: 'bg-primary-soft',  text: 'text-primary', border: 'border-primary/20' },
    green: { bg: 'bg-medical-green-light', text: 'text-medical-green', border: 'border-medical-green/20' },
    amber: { bg: 'bg-medical-amber-light', text: 'text-medical-amber', border: 'border-medical-amber/20' },
    red:   { bg: 'bg-medical-red-light',   text: 'text-medical-red', border: 'border-medical-red/20' },
  };

  const changeColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral:  'text-muted',
  };

  return (
    <motion.div
      className="card p-6 bg-surface border border-border text-foreground"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1 tracking-tight">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium mt-2', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', colorConfig[color].bg, colorConfig[color].border)}>
          <span className={colorConfig[color].text}>{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}
