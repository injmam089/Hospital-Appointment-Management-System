import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, LayoutDashboard, UsersRound, Stethoscope,
  Building2, CalendarDays, FileBarChart, LogOut, Menu, X, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { NotificationBell } from '../notifications/NotificationBell';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type AdminTab =
  | 'dashboard'
  | 'users'
  | 'doctors'
  | 'departments'
  | 'appointments'
  | 'reports'
  | 'audit'
  | 'notifications';

interface AdminNavbarProps {
  currentTab?: AdminTab;
}

export function AdminNavbar({ currentTab }: AdminNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile drawer on Escape and restore focus
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    toast.success('Signed out of administration console.');
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'Users',
      path: '/admin/users',
      icon: <UsersRound className="w-4 h-4" />,
    },
    {
      id: 'doctors',
      label: 'Doctors',
      path: '/admin/doctors',
      icon: <Stethoscope className="w-4 h-4" />,
    },
    {
      id: 'departments',
      label: 'Departments',
      path: '/admin/departments',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      path: '/admin/appointments',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/admin/reports',
      icon: <FileBarChart className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Audit',
      path: '/admin/audit-logs',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const activeId = currentTab || (
    location.pathname.includes('/users')
      ? 'users'
      : location.pathname.includes('/doctors')
      ? 'doctors'
      : location.pathname.includes('/departments')
      ? 'departments'
      : location.pathname.includes('/appointments')
      ? 'appointments'
      : location.pathname.includes('/reports')
      ? 'reports'
      : location.pathname.includes('/audit-logs')
      ? 'audit'
      : location.pathname.includes('/notifications')
      ? 'notifications'
      : 'dashboard'
  );

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30 shadow-subtle">
      <div className="page-container px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Admin Identity & Branding */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shadow-subtle group-hover:bg-amber-500/20 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="hidden xs:block sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-foreground text-sm sm:text-base leading-tight">
                    HAMS Operations
                  </span>
                  <Badge variant="amber" dot className="hidden md:inline-flex">
                    Admin Console
                  </Badge>
                </div>
                <p className="text-[11px] text-muted truncate max-w-[160px] sm:max-w-[220px]">
                  {user?.email || 'admin@hams.local'}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav aria-label="Administrator console primary navigation" className="hidden xl:flex items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-border/60">
            {navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-card text-foreground shadow-subtle border border-border/80'
                      : 'text-muted hover:text-foreground hover:bg-surface/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Tools & Profile Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle size="sm" />
            <NotificationBell />

            <div className="hidden sm:block h-5 w-[1px] bg-border mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-flex text-muted hover:text-danger"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign out
            </Button>

            {/* Mobile Hamburger Button */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden border-t border-border bg-card px-4 py-4 space-y-3"
          >
            {/* Identity in Drawer */}
            <div className="p-3 bg-surface-secondary rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Administrator</p>
                <p className="text-[11px] text-muted">{user?.email}</p>
              </div>
              <Badge variant="amber" dot>Admin Console</Badge>
            </div>

            {/* Navigation links */}
            <nav aria-label="Administrator console mobile navigation" className="grid grid-cols-2 gap-1.5 pt-1">
              {navItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-subtle'
                        : 'text-muted hover:text-foreground hover:bg-surface-secondary'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeId === 'notifications'
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-muted hover:text-foreground hover:bg-surface-secondary'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </Link>
            </nav>

            {/* Sign Out in Drawer */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-danger border-danger/20 hover:bg-danger/10"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
