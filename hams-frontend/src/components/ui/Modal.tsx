import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { useModalA11y } from '../../lib/useModalA11y';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Accessible keyboard trap, Escape handling, focus restoration & scroll locking
  useModalA11y({
    isOpen,
    onClose,
    containerRef,
  });

  const maxW = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-navy/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog Panel */}
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            className={cn(
              'relative w-full rounded-2xl bg-surface border border-border shadow-modal p-6 z-10 text-foreground overflow-hidden focus:outline-none',
              maxW[maxWidth],
              className
            )}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {title && (
                  <h3 id="modal-title" className="font-display font-bold text-lg text-foreground tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p id="modal-description" className="text-sm text-muted mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  affectedRecord?: string;
  consequence?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  affectedRecord,
  consequence,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
              isDestructive
                ? 'bg-danger/10 border-danger/20 text-danger'
                : 'bg-primary/10 border-primary/20 text-primary'
            )}
          >
            <TriangleAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-foreground">{title}</h4>
            <p className="text-xs text-muted mt-0.5">{description}</p>
          </div>
        </div>

        {affectedRecord && (
          <div className="p-3 bg-surface-secondary border border-border rounded-xl text-xs space-y-1">
            <span className="text-muted font-medium">Target record:</span>
            <p className="font-mono font-semibold text-foreground break-all">{affectedRecord}</p>
          </div>
        )}

        {consequence && (
          <p className="text-xs text-danger/90 bg-danger/5 border border-danger/20 rounded-xl p-3 leading-relaxed">
            {consequence}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
