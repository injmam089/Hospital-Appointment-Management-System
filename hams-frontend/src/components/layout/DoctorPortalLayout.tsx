import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, LayoutDashboard, CalendarDays, UsersRound,
  FileText, ClipboardList, CalendarClock, ListOrdered,
  FileBarChart, MessageSquare, Clock, UserRound, HelpCircle,
  Search, LogOut, ChevronDown, Menu, X,
  Sparkles, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { NotificationBell } from '../notifications/NotificationBell';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { Button } from '../ui/Button';

export interface DoctorPortalLayoutProps {
  children: React.ReactNode;
  activeItem?: 'dashboard' | 'appointments' | 'schedule' | 'profile';
  appointmentsCount?: number;
}

export function DoctorPortalLayout({
  children,
  activeItem = 'dashboard',
  appointmentsCount,
}: DoctorPortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  // Close profile dropdown on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (profileDropdownOpen) setProfileDropdownOpen(false);
        if (mobileSidebarOpen) {
          setMobileSidebarOpen(false);
          mobileToggleRef.current?.focus();
        }
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, mobileSidebarOpen]);

  // Global search keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('doctor-global-search') as HTMLInputElement | null;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out safely.');
    navigate('/login', { replace: true });
  };

  const doctorDisplayName = user?.firstName
    ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim()
    : 'Dr. Rajesh Kumar';

  // Navigation Items matching the clinical SaaS reference
  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/doctor/dashboard',
      icon: LayoutDashboard,
      badge: null,
      implemented: true,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      path: '/doctor/appointments',
      icon: CalendarDays,
      badge: appointmentsCount !== undefined && appointmentsCount > 0 ? `${appointmentsCount}` : '2',
      implemented: true,
    },
    {
      id: 'patients',
      label: 'Patients',
      path: '/doctor/appointments',
      icon: UsersRound,
      badge: null,
      implemented: true,
    },
    {
      id: 'clinical-desk',
      label: 'Clinical Desk',
      path: '/doctor/appointments',
      icon: ClipboardList,
      badge: null,
      implemented: true,
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      path: '/doctor/appointments',
      icon: FileText,
      badge: null,
      implemented: true,
    },
    {
      id: 'records',
      label: 'Medical Records',
      path: '/doctor/appointments',
      icon: Stethoscope,
      badge: null,
      implemented: true,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      path: '/doctor/schedule',
      icon: CalendarClock,
      badge: null,
      implemented: true,
    },
    {
      id: 'queue',
      label: 'Queue Management',
      path: '/doctor/appointments',
      icon: ListOrdered,
      badge: null,
      implemented: true,
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/doctor/appointments',
      icon: FileBarChart,
      badge: null,
      implemented: true,
    },
    {
      id: 'messages',
      label: 'Messages',
      path: '/notifications',
      icon: MessageSquare,
      badge: '5',
      implemented: true,
    },
  ];

  const quickNavItems = [
    {
      id: 'weekly-schedule',
      label: 'Weekly Schedule',
      path: '/doctor/schedule',
      icon: Clock,
    },
    {
      id: 'profile-settings',
      label: 'Profile & Settings',
      path: '/doctor/profile',
      icon: UserRound,
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      path: '/doctor/profile',
      icon: HelpCircle,
    },
  ];

  const currentActiveId =
    activeItem ||
    (location.pathname.includes('/appointments')
      ? 'appointments'
      : location.pathname.includes('/schedule')
      ? 'schedule'
      : location.pathname.includes('/profile')
      ? 'profile'
      : 'dashboard');

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18] text-[#0f172a] dark:text-slate-100 font-sans flex transition-colors selection:bg-blue-500 selection:text-white">
      {/* ============================================================ */}
      {/* 1. DESKTOP FIXED/STICKY SIDEBAR (248px)                     */}
      {/* ============================================================ */}
      <aside
        className="hidden lg:flex flex-col w-[248px] bg-white dark:bg-[#0b1324] border-r border-slate-200/90 dark:border-[#16233b] fixed inset-y-0 left-0 z-30 shadow-xs"
        aria-label="Doctor portal sidebar navigation"
      >
        {/* Brand / Logo Area */}
        <div className="h-[70px] px-5 flex items-center gap-3 border-b border-slate-200/70 dark:border-[#16233b]">
          <Link
            to="/doctor/dashboard"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d68f2] rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1d68f2] text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
              <Stethoscope className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  HAMS
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#1d68f2] dark:bg-blue-950/60 dark:text-sky-400">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium leading-none mt-1">
                Hospital Management
              </p>
            </div>
          </Link>
        </div>

        {/* Sidebar Nav Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-hide">
          {/* MAIN NAV SECTION */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
              Main Menu
            </p>
            <nav className="space-y-1" aria-label="Main navigation">
              {mainNavItems.map((item) => {
                const isActive =
                  (item.id === 'dashboard' && currentActiveId === 'dashboard') ||
                  (item.id === 'appointments' && currentActiveId === 'appointments') ||
                  (item.id === 'schedule' && currentActiveId === 'schedule');
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d68f2] ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1d68f2] dark:text-[#38bdf8] font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132038]'
                    }`}
                  >
                    {/* Active Left Pill Accent */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#1d68f2] dark:bg-[#38bdf8]" />
                    )}

                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-[#1d68f2] dark:text-[#38bdf8]'
                            : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#1d68f2] text-white'
                            : 'bg-slate-100 dark:bg-[#192742] text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-[#1d68f2]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* QUICK LINKS SECTION */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
              Quick Links
            </p>
            <nav className="space-y-1" aria-label="Quick links">
              {quickNavItems.map((item) => {
                const IconComponent = item.icon;
                const isActive =
                  (item.id === 'weekly-schedule' && currentActiveId === 'schedule') ||
                  (item.id === 'profile-settings' && currentActiveId === 'profile');

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d68f2] ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1d68f2] dark:text-[#38bdf8] font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-[#132038]'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* BOTTOM SIDEBAR HEALTHCARE CARD */}
        <div className="p-3.5 border-t border-slate-200/70 dark:border-[#16233b]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-[#132c5e] dark:to-[#0f2147] p-3.5 text-white shadow-xs">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                Clinical Care
              </span>
            </div>
            <p className="text-xs font-bold leading-tight">Better Care</p>
            <p className="text-xs font-medium text-sky-100/90 leading-tight">
              Brighter Tomorrow
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-sky-200 font-medium">
              <span>HAMS Hospital ERP</span>
              <Building2 className="w-3.5 h-3.5 opacity-80" />
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE DRAWER / SIDEBAR (OVERLAY)                          */}
      {/* ============================================================ */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2 }}
              className="relative w-[280px] bg-white dark:bg-[#0b1324] border-r border-slate-200 dark:border-[#16233b] flex flex-col h-full z-10 shadow-modal"
            >
              <div className="h-[70px] px-5 flex items-center justify-between border-b border-slate-200/70 dark:border-[#16233b]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1d68f2] text-white flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                      HAMS ERP
                    </span>
                    <p className="text-[11px] text-slate-400">Doctor Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="min-w-[44px] min-h-[44px] p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl flex items-center justify-center"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <nav className="space-y-1">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132038]"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-slate-500" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1d68f2] dark:text-sky-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-[#16233b]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. MAIN CONTENT WRAPPER (OFFSET BY 248px ON DESKTOP)        */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[248px]">
        {/* ============================================================ */}
        {/* TOP STICKY HEADER (68px)                                    */}
        {/* ============================================================ */}
        <header className="sticky top-0 z-20 h-[68px] bg-white/95 dark:bg-[#0b1324]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#16233b] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
          {/* Left: Mobile Toggle & Global Search Command Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Hamburger Button */}
            <button
              ref={mobileToggleRef}
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132038] transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d68f2]"
              aria-label="Open mobile navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search SaaS Input */}
            <div className="relative flex-1 hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="doctor-global-search"
                type="text"
                placeholder="Search patients, appointments, clinical records..."
                className="w-full pl-10 pr-16 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-[#121c33] border border-slate-200/80 dark:border-[#1c2c4d] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1d68f2]/30 focus:border-[#1d68f2] transition-all"
                aria-label="Global search across patients and appointments"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-700 text-slate-400 shadow-2xs pointer-events-none">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right: Quick Queue CTA, Theme Toggle, Notifications, Doctor Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
              leftIcon={<CalendarDays className="w-3.5 h-3.5" />}
              className="hidden md:inline-flex bg-[#1d68f2] hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-xl shadow-xs"
            >
              Open Queue
            </Button>

            {/* Theme Switch Pill */}
            <ThemeToggle size="sm" />

            {/* Notification Bell */}
            <NotificationBell />

            {/* Doctor Profile Pill Menu */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#132038] border border-transparent hover:border-slate-200 dark:hover:border-[#1c2c4d] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d68f2]"
                aria-expanded={profileDropdownOpen}
                aria-label="Doctor profile menu"
              >
                <ProfileAvatar
                  role="doctor"
                  name={doctorDisplayName}
                  size="compact"
                  image="/images/doctor_avatar_anime.png"
                  animated={false}
                  className="ring-2 ring-blue-100 dark:ring-blue-950"
                />
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {doctorDisplayName}
                    </p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight">
                    General Physician
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200 dark:border-[#1b2b48] shadow-modal py-2 z-50 text-xs"
                    role="menu"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-[#16233b]">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {doctorDisplayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/doctor/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132038] hover:text-[#1d68f2]"
                        role="menuitem"
                      >
                        <UserRound className="w-4 h-4 text-slate-400" />
                        <span>Practitioner Profile</span>
                      </Link>
                      <Link
                        to="/doctor/schedule"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#132038] hover:text-[#1d68f2]"
                        role="menuitem"
                      >
                        <CalendarClock className="w-4 h-4 text-slate-400" />
                        <span>Weekly Schedule</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-[#16233b]">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-medium"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* MAIN BODY OUTLET                                            */}
        {/* ============================================================ */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
