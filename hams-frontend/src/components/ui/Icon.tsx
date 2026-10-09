import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
export type IconColorVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'current' | 'white';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  icon: LucideIcon;
  size?: IconSize | number;
  strokeWidth?: number;
  variant?: IconColorVariant;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

const sizeMap: Record<IconSize, string> = {
  xs: 'w-3.5 h-3.5', // 14px
  sm: 'w-4 h-4',     // 16px
  md: 'w-4.5 h-4.5', // 18px
  lg: 'w-5 h-5',     // 20px
  xl: 'w-6 h-6',     // 24px
  '2xl': 'w-8 h-8',  // 32px
  hero: 'w-11 h-11', // 44px
};

const variantColorMap: Record<IconColorVariant, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  muted: 'text-muted',
  current: 'currentColor',
  white: 'text-white',
};

export function Icon({
  icon: IconComponent,
  size = 'md',
  strokeWidth = 2,
  variant = 'current',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...props
}: IconProps) {
  const isAriaHidden = ariaHidden !== undefined ? ariaHidden : !ariaLabel;
  const sizeClasses = typeof size === 'string' ? sizeMap[size] : undefined;
  const style = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <IconComponent
      strokeWidth={strokeWidth}
      className={cn(
        'flex-shrink-0 transition-colors',
        sizeClasses,
        variant !== 'current' && variantColorMap[variant],
        className
      )}
      style={style}
      aria-hidden={isAriaHidden}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    />
  );
}
