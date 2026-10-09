import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex="0"]',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'summary',
].join(',');

export interface UseModalA11yOptions<T extends HTMLElement = HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  containerRef?: React.RefObject<T | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  lockScroll?: boolean;
}

/**
 * Custom hook to enforce robust accessible modal / dialog behavior:
 * - Traps focus strictly within container during Tab / Shift+Tab cycling.
 * - Handles Escape key dismissal.
 * - Captures and restores trigger focus on close.
 * - Locks background scroll safely while open.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
  lockScroll = true,
}: UseModalA11yOptions<T>): React.RefObject<T | null> {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const fallbackRef = useRef<T | null>(null);
  const activeRef = containerRef || fallbackRef;

  useEffect(() => {
    if (!isOpen) return;

    // Capture element focused prior to modal open
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    if (lockScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, lockScroll]);

  // Set initial focus when opened
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      if (activeRef.current) {
        const focusable = activeRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          activeRef.current.focus();
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, activeRef, initialFocusRef]);

  // Keydown listener for Escape and Focus Trap (Tab)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && activeRef.current) {
        const focusable = Array.from(
          activeRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !activeRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !activeRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, activeRef]);

  // Restore focus when modal closes
  useEffect(() => {
    return () => {
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
      }
    };
  }, []);

  return activeRef;
}
