import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Stethoscope, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const navLinks = [
  { label: 'Find a Doctor', href: '/doctors' },
  { label: 'Departments', href: '/#departments' },
  { label: 'How It Works', href: '/#how-it-works' },
];

export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          ? 'bg-white/95 backdrop-blur-md border-[#E5E7EB] shadow-subtle'
          : 'bg-white border-[#E5E7EB]'
      )}
    >
      <nav className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors shadow-sm">
              <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-display font-bold text-navy text-lg leading-none tracking-tight">HAMS</span>
              <span className="text-[11px] text-muted block leading-none font-medium mt-0.5">Healthcare</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-[#475569] hover:text-primary-600 hover:bg-[#F8FAFC] rounded-btn transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
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
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-btn text-[#475569] hover:text-navy hover:bg-[#F8FAFC] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="md:hidden bg-white border border-[#E5E7EB] rounded-xl mt-2 mb-4 p-4 shadow-modal"
            >
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-2 text-sm font-medium text-[#475569] hover:text-primary-600 hover:bg-[#F8FAFC] rounded-btn transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-2">
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
                      Sign in
                    </Button>
                    <Button variant="primary" className="w-full" onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                      Get Started
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
