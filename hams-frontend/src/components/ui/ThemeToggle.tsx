import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type ThemeMode } from '../../theme/ThemeContext';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'segmented';
  className?: string;
  size?: 'sm' | 'md';
}

const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle({ variant = 'dropdown', className, size = 'md' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  // Segmented Pill Variant
  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center p-1 bg-surface-secondary border border-border rounded-xl gap-0.5',
          className
        )}
        role="group"
        aria-label="Theme mode switcher"
      >
        {themeOptions.map(({ mode, label, icon: Icon }) => {
          const isActive = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all select-none',
                isActive
                  ? 'bg-surface text-primary shadow-subtle font-semibold border border-border'
                  : 'text-muted hover:text-foreground hover:bg-surface/50'
              )}
              aria-pressed={isActive}
              aria-label={`Switch to ${label} theme`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Current icon to display for compact dropdown button
  const ActiveIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current theme: ${theme}. Click to change theme.`}
        className={cn(
          'inline-flex items-center justify-center rounded-btn border border-border bg-surface text-foreground shadow-subtle transition-all duration-200 min-w-[44px] min-h-[44px]',
          'hover:bg-surface-secondary hover:border-border active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          size === 'sm' ? 'w-11 h-11' : 'w-11 h-11'
        )}
      >
        <ActiveIcon className={cn(size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5', 'text-foreground')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 rounded-xl bg-surface border border-border shadow-modal p-1 z-50 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
          >
            {themeOptions.map(({ mode, label, icon: Icon }) => {
              const isSelected = theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setTheme(mode);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors select-none text-left',
                    isSelected
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'text-foreground hover:bg-surface-secondary'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
