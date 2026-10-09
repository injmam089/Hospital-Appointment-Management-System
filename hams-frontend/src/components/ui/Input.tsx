import { forwardRef, useState } from 'react';
import { Eye, EyeOff, CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((
  { label, error, success, hint, leftIcon, rightElement, className, type, id, ...props },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" aria-hidden="true">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={cn(
            'input-field',
            leftIcon && 'pl-10',
            (isPassword || rightElement) && 'pr-10',
            error && 'border-danger focus:border-danger focus:ring-2 focus:ring-red-500/20',
            success && !error && 'border-success/60 focus:border-success focus:ring-2 focus:ring-emerald-500/20',
            className
          )}
          aria-required={props.required}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : success
              ? `${inputId}-success`
              : hint
              ? `${inputId}-hint`
              : undefined
          }
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {!isPassword && rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-danger flex items-center gap-1.5 font-medium">
          <CircleAlert className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {success && !error && (
        <p id={`${inputId}-success`} className="mt-1.5 text-xs text-success flex items-center gap-1.5 font-medium">
          <CircleCheck className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </p>
      )}
      {hint && !error && !success && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
