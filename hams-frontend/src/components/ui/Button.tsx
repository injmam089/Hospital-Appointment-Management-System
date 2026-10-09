import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props
  },
  ref
) => {
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 font-medium rounded-btn transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm active:bg-primary-hover/90',
    secondary: 'bg-surface text-foreground border border-border shadow-subtle hover:bg-surface-secondary hover:border-border active:bg-surface-secondary/80',
    ghost: 'text-muted hover:bg-surface-secondary hover:text-foreground active:bg-surface-secondary/80',
    danger: 'bg-danger text-white hover:opacity-90 shadow-sm active:opacity-80',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 min-h-[34px]',
    md: 'text-sm px-5 py-2.5 min-h-[40px]',
    lg: 'text-base px-6 py-3 min-h-[48px]',
  };

  const isInteractive = !disabled && !isLoading;

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: isInteractive ? 1.01 : 1 }}
      whileTap={{ scale: isInteractive ? 0.98 : 1 }}
      className={cn(baseClasses, variants[variant], sizes[size], isLoading && 'cursor-wait', className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : undefined}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
