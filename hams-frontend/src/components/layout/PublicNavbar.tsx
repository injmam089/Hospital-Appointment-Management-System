import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Stethoscope, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Platform', href: '/#workspaces' },
  { label: 'Features', href: '/#features' },
  { label: 'Security', href: '/#security' },
  { label: 'How It Works', href: '/#how-it-works' },
];

export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape and restore focus
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const getDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'DOCTOR') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b',
        isScrolled
          ? 'bg-surface/95 dark:bg-[#07111F]/95 backdrop-blur-md border-border shadow-subtle'
          : 'bg-surface/90 dark:bg-[#07111F]/90 backdrop-blur-sm border-border/80'
      )}
    >
      <nav aria-label="Public website primary navigation" className="page-container">
        {/* ~80px Desktop Navbar Height (h-20) */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20">
              <Stethoscope className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-xl leading-none tracking-tight">HAMS</span>
              <span className="text-[11px] text-muted block leading-none font-medium mt-0.5">Healthcare</span>
            </div>
          </Link>

          {/* Desktop Nav Center Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-secondary/70 rounded-btn transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle variant="switch" />
            {isAuthenticated ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => navigate(getDashboardPath())}
                  leftIcon={<LayoutDashboard className="w-4 h-4" />}
                >
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-sm px-5 py-2.5 rounded-xl border border-border"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm shadow-primary/20"
                >
                  Create Patient Account
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions / Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle variant="switch" />
            <button
              ref={mobileMenuButtonRef}
              className="min-w-[44px] min-h-[44px] p-2 rounded-btn text-muted hover:text-foreground hover:bg-surface-secondary transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="md:hidden bg-surface border border-border rounded-xl mt-2 mb-4 p-4 shadow-modal text-foreground"
            >
              <nav aria-label="Public website mobile navigation" className="space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-2 text-sm font-medium text-muted hover:text-primary hover:bg-surface-secondary rounded-btn transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => { navigate(getDashboardPath()); setMobileOpen(false); }}
                      leftIcon={<LayoutDashboard className="w-4 h-4" />}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => { logout(); setMobileOpen(false); }}
                      leftIcon={<LogOut className="w-4 h-4" />}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" className="w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="primary" className="w-full" onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                      Create Patient Account
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
