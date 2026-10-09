import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserRound, CalendarDays, Pill, Stethoscope,
  LogOut, Menu, X, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { NotificationBell } from '../notifications/NotificationBell';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PatientNavbarProps {
  currentTab?: 'dashboard' | 'appointments' | 'prescriptions' | 'profile';
}

export function PatientNavbar({ currentTab }: PatientNavbarProps) {
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
    toast.success('Signed out safely.');
    navigate('/login', { replace: true });
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Patient';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      path: '/patient/dashboard',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'appointments',
      label: 'My Appointments',
      path: '/patient/appointments',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      path: '/patient/prescriptions',
      icon: <Pill className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'Health Profile',
      path: '/patient/profile',
      icon: <UserRound className="w-4 h-4" />,
    },
  ];

  const activeId = currentTab || (
    location.pathname.includes('/appointments')
      ? 'appointments'
      : location.pathname.includes('/prescriptions')
      ? 'prescriptions'
      : location.pathname.includes('/profile')
      ? 'profile'
      : 'dashboard'
  );

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30 shadow-subtle">
      <div className="page-container px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Patient Identity & Branding */}
          <div className="flex items-center gap-3">
            <Link
              to="/patient/dashboard"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary font-bold shadow-subtle group-hover:bg-primary-soft/80 transition-colors">
                <UserRound className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden xs:block sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-foreground text-sm sm:text-base leading-tight truncate max-w-[140px] sm:max-w-[180px]">
                    {displayName}
                  </span>
                  <Badge variant="blue" dot className="hidden md:inline-flex">
                    Patient Portal
                  </Badge>
                </div>
                <p className="text-[11px] text-muted truncate max-w-[160px] sm:max-w-[200px]">
                  {user?.email}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav aria-label="Patient portal primary navigation" className="hidden lg:flex items-center gap-1 bg-surface-secondary p-1 rounded-xl border border-border/60">
            {navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-surface text-primary shadow-subtle border border-border/80'
                      : 'text-muted hover:text-foreground hover:bg-surface/50'
                  }`}
                >
                  <span className={isActive ? 'text-primary' : 'text-muted'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions, Notifications, Theme, User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctors')}
              leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex text-xs"
            >
              Find a Doctor
            </Button>

            <ThemeToggle size="sm" />
            <NotificationBell />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4 text-muted hover:text-foreground" />}
              className="hidden md:inline-flex text-xs text-muted hover:text-foreground"
              aria-label="Sign out of patient session"
            >
              <span className="hidden xl:inline">Sign out</span>
            </Button>

            {/* Mobile Hamburger Button */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border bg-surface px-4 py-3 space-y-2 overflow-hidden shadow-modal"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div>
                <p className="text-xs font-semibold text-foreground">{displayName}</p>
                <p className="text-[11px] text-muted">{user?.email}</p>
              </div>
              <Badge variant="blue" dot>Patient</Badge>
            </div>

            <nav aria-label="Patient portal mobile navigation" className="grid grid-cols-1 gap-1 pt-1">
              {navItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary-soft text-primary font-bold'
                        : 'text-muted hover:text-foreground hover:bg-surface-secondary'
                    }`}
                  >
                    <span className={isActive ? 'text-primary' : 'text-muted'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/doctors');
                }}
                leftIcon={<Stethoscope className="w-4 h-4" />}
              >
                Find a Doctor
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
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
