import { forwardRef } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  { label, error, success, hint, className, id, rows = 3, ...props },
  ref
) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="label">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full px-4 py-2.5 bg-surface border border-border rounded-btn text-sm text-foreground',
          'placeholder:text-muted transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-primary',
          'disabled:bg-surface-secondary disabled:cursor-not-allowed resize-y',
          error && 'border-danger focus:border-danger focus:ring-2 focus:ring-red-500/20',
          success && !error && 'border-success/60 focus:border-success focus:ring-2 focus:ring-emerald-500/20',
          className
        )}
        aria-required={props.required}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : success
            ? `${textareaId}-success`
            : hint
            ? `${textareaId}-hint`
            : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} role="alert" className="mt-1.5 text-xs text-danger flex items-center gap-1.5 font-medium">
          <CircleAlert className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {success && !error && (
        <p id={`${textareaId}-success`} className="mt-1.5 text-xs text-success flex items-center gap-1.5 font-medium">
          <CircleCheck className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </p>
      )}
      {hint && !error && !success && (
        <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
