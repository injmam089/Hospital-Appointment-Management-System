import { forwardRef } from 'react';
import { ChevronDown, CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>((
  { label, error, success, hint, options, className, id, children, ...props },
  ref
) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'input-field appearance-none pr-10 bg-surface text-foreground border-border cursor-pointer',
            error && 'border-danger focus:border-danger focus:ring-2 focus:ring-red-500/20',
            success && !error && 'border-success/60 focus:border-success focus:ring-2 focus:ring-emerald-500/20',
            className
          )}
          aria-required={props.required}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${selectId}-error`
              : success
              ? `${selectId}-success`
              : hint
              ? `${selectId}-hint`
              : undefined
          }
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-surface text-foreground">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p id={`${selectId}-error`} role="alert" className="mt-1.5 text-xs text-danger flex items-center gap-1.5 font-medium">
          <CircleAlert className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {success && !error && (
        <p id={`${selectId}-success`} className="mt-1.5 text-xs text-success flex items-center gap-1.5 font-medium">
          <CircleCheck className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </p>
      )}
      {hint && !error && !success && (
        <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
