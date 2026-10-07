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
        className={cn('card rounded-2xl', paddingClasses[padding], onClick && 'cursor-pointer', className)}
        whileHover={{ y: -2, boxShadow: '0 8px 25px -4px rgba(15, 23, 42, 0.08), 0 3px 6px -2px rgba(15, 23, 42, 0.04)' }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn('card rounded-2xl', paddingClasses[padding], className)}>
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
    blue:  { bg: 'bg-medical-blue-light',  text: 'text-primary-600', border: 'border-blue-100' },
    green: { bg: 'bg-medical-green-light', text: 'text-medical-green', border: 'border-emerald-100' },
    amber: { bg: 'bg-medical-amber-light', text: 'text-medical-amber', border: 'border-amber-100' },
    red:   { bg: 'bg-medical-red-light',   text: 'text-medical-red', border: 'border-red-100' },
  };

  const changeColors = {
    positive: 'text-medical-green',
    negative: 'text-medical-red',
    neutral:  'text-muted',
  };

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-navy mt-1 tracking-tight">{value}</p>
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
