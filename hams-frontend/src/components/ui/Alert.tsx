import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const configs = {
    info: {
      bg: 'bg-info/10 border-info/30 text-info',
      text: 'text-foreground',
      icon: Info,
    },
    success: {
      bg: 'bg-success/10 border-success/30 text-success',
      text: 'text-foreground',
      icon: CircleCheck,
    },
    warning: {
      bg: 'bg-warning/10 border-warning/30 text-warning',
      text: 'text-foreground',
      icon: TriangleAlert,
    },
    danger: {
      bg: 'bg-danger/10 border-danger/30 text-danger',
      text: 'text-foreground',
      icon: CircleAlert,
    },
  };

  const { bg, text, icon: Icon } = configs[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border transition-colors shadow-subtle',
        bg,
        className
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        {title && <h5 className={cn('font-semibold mb-1 leading-tight', text)}>{title}</h5>}
        <div className={cn('text-sm leading-relaxed opacity-90', text)}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-muted hover:text-foreground transition-colors -mr-1 -mt-1"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
