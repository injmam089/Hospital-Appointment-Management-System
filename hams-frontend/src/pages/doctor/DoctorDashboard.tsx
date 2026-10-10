import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, UsersRound, Clock3, ShieldCheck,
  Stethoscope, ChevronRight, X, CircleCheck, CheckCircle2,
  CalendarClock, UserCheck, TrendingUp,
  FilePlus, Search, ListOrdered, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { appointmentApi } from '../../api/appointment';
import { consultationApi } from '../../api/consultation';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { AppointmentSkeleton } from '../../components/ui/LoadingSkeleton';
import { formatDate, formatTime } from '../../lib/utils';
import type { AppointmentResponse } from '../../types';
import { DoctorPortalLayout } from '../../components/layout/DoctorPortalLayout';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [todayAppointments, setTodayAppointments] = useState<AppointmentResponse[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);

  // Quick Check-in modal state
  const [checkInTarget, setCheckInTarget] = useState<AppointmentResponse | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [today, all] = await Promise.all([
        appointmentApi.getDoctorTodayAppointments(),
        appointmentApi.getDoctorAppointments(),
      ]);
      setTodayAppointments(today);
      setAllAppointments(all);
    } catch {
      // Non-blocking fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInTarget) return;
    setIsCheckingIn(true);
    try {
      const updated = await consultationApi.doctorCheckIn(checkInTarget.id);
      toast.success(`Patient ${updated.patientName} checked in successfully.`);
      setTodayAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setCheckInTarget(null);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsCheckingIn(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const doctorDisplayName = user?.firstName
    ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim()
    : 'Dr. Rajesh Kumar';

  const todayStr = new Date().toISOString().split('T')[0];

  // Metrics calculation from live API data - memoized to prevent re-filtering on state/modal updates
  const waitingPatientsCount = useMemo(() => {
    return todayAppointments.filter(
      (a) => a.status === 'CHECKED_IN' || a.status === 'IN_CONSULTATION'
    ).length;
  }, [todayAppointments]);

  const completedTodayCount = useMemo(() => {
    return todayAppointments.filter(
      (a) => a.status === 'COMPLETED'
    ).length;
  }, [todayAppointments]);

  const upcomingAppointments = useMemo(() => {
    return allAppointments
      .filter(
        (a) =>
          a.appointmentDate > todayStr &&
          !['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(a.status)
      )
      .slice(0, 5);
  }, [allAppointments, todayStr]);

  // Derive initials for patient circle avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (name.substring(0, 2) || 'PT').toUpperCase();
  };

  return (
    <DoctorPortalLayout activeItem="dashboard" appointmentsCount={todayAppointments.length}>
      <div className="space-y-6 sm:space-y-8">
        {/* ============================================================ */}
        {/* 1. DOCTOR DASHBOARD HERO (WELCOME BANNER WITH CLINICAL IMAGE) */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/90 dark:border-[#1b2b48] shadow-xs min-h-[174px] flex items-center">
          {/* Subtle clinical gradient background illumination */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/70 via-sky-50/30 to-transparent dark:from-[#0b172e] dark:via-[#0e1e3b]/70 dark:to-transparent pointer-events-none" />

          {/* Right Hero Clinical Environmental Art (Hospital consultation & environment) */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[460px] pointer-events-none select-none z-10 overflow-hidden">
            <img
              src="/images/patient_hero_consultation.png"
              alt="Clinical Environment"
              className="h-full w-full object-cover object-right dark:opacity-85 dark:brightness-95 transition-opacity"
            />
            {/* Subtle overlay gradient blending left edge */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-[#0c1629] to-transparent pointer-events-none" />
          </div>

          <div className="relative z-20 w-full p-6 sm:p-7 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Content Column */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1d68f2] dark:bg-blue-950/50 dark:text-sky-400 border border-blue-200/80 dark:border-blue-900/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Practitioner
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-400 font-mono">
                  Staff #{user?.id || 1}
                </span>
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight">
                {getGreeting()},{' '}
                <span className="text-[#1d68f2] dark:text-[#38bdf8]">{doctorDisplayName}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Here is your clinical schedule, patient queue, and important updates for today.
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <CalendarDays className="w-3.5 h-3.5 text-[#1d68f2] dark:text-[#38bdf8]" />
                  {formatDate(todayStr, 'EEEE, MMM dd, yyyy')}
                </span>
                <span>•</span>
                <span className="italic text-slate-500 dark:text-slate-400">
                  &ldquo;Care today for a healthier tomorrow.&rdquo;
                </span>
              </div>
            </div>

            {/* Quick Hero CTA Button on mobile/tablet */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/doctor/appointments')}
                leftIcon={<CalendarDays className="w-4 h-4" />}
                className="bg-[#1d68f2] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-4 py-2"
              >
                Open Clinical Desk
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. KPI METRICS CARDS (4 CARDS MATCHING REFERENCE SPEC)       */}
        {/* ============================================================ */}
        <section aria-label="Clinical KPI Metrics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Today's Appointments */}
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-900 transition-all flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Today&apos;s Appointments
                </p>
                <p className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5 leading-none">
                  {todayAppointments.length}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-[#1d68f2] dark:text-[#38bdf8]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ {todayAppointments.length > 0 ? `${todayAppointments.length} booked today` : 'Queue open'}</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1d68f2] dark:bg-blue-950/60 dark:text-[#38bdf8] flex items-center justify-center border border-blue-100 dark:border-blue-900/50 flex-shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 2: Waiting / In Queue */}
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-xs hover:border-amber-300 dark:hover:border-amber-900 transition-all flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Waiting / In Queue
                </p>
                <p className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5 leading-none">
                  {waitingPatientsCount}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>~15 min avg wait</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50 flex-shrink-0">
                <Clock3 className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 3: Completed Consultations */}
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-900 transition-all flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Completed Consultations
                </p>
                <p className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5 leading-none">
                  {completedTodayCount}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CircleCheck className="w-3.5 h-3.5" />
                  <span>↑ Completed today</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 flex-shrink-0">
                <CircleCheck className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 4: Total Patients (Practice Bookings) */}
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-900 transition-all flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Patients (Bookings)
                </p>
                <p className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5 leading-none">
                  {allAppointments.length}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>↑ 12% overall activity</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 flex-shrink-0">
                <UsersRound className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. PRIMARY SPLIT: TODAY'S APPOINTMENTS (LEFT) & UPCOMING (RIGHT) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: TODAY'S APPOINTMENTS CLINICAL TIMELINE */}
          <section aria-labelledby="today-appointments-heading" className="lg:col-span-2">
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] shadow-xs p-5 sm:p-6 h-full flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#16233b]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1d68f2] dark:text-[#38bdf8] flex items-center justify-center font-bold">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <h2
                        id="today-appointments-heading"
                        className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg"
                      >
                        Today&apos;s Appointments
                      </h2>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400">
                        {todayAppointments.length} patients scheduled for consultation
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/doctor/schedule')}
                    className="text-xs font-semibold text-[#1d68f2] dark:text-[#38bdf8] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>View Calendar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                {isLoading ? (
                  <div className="space-y-3 py-2">
                    <AppointmentSkeleton />
                    <AppointmentSkeleton />
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="py-12 px-4 text-center max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                        Your clinical queue is clear
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                        No patient appointments scheduled for today.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/doctor/appointments')}
                        className="text-xs"
                      >
                        View All Records
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((appt) => {
                      const isConfirmed = appt.status === 'CONFIRMED';
                      const isCheckedIn = appt.status === 'CHECKED_IN';
                      const isInConsultation = appt.status === 'IN_CONSULTATION';
                      const isCompleted = appt.status === 'COMPLETED';

                      return (
                        <div
                          key={appt.id}
                          className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-[#182744] bg-slate-50/60 dark:bg-[#0f1b33]/60 hover:bg-white dark:hover:bg-[#12203d] hover:border-blue-300 dark:hover:border-blue-800/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                        >
                          {/* Left: Time + Avatar + Patient Details */}
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            {/* Time Pill */}
                            <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0b1426] border border-slate-200 dark:border-slate-800 text-center flex-shrink-0 shadow-2xs">
                              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                {formatTime(appt.appointmentTime)}
                              </span>
                            </div>

                            {/* Circular Patient Avatar Initials */}
                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[#1d68f2] dark:text-sky-300 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-blue-200 dark:border-blue-900">
                              {getInitials(appt.patientName)}
                            </div>

                            {/* Patient Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-display font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                  {appt.patientName}
                                </h3>
                                <AppointmentStatusBadge status={appt.status} />
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                <span className="font-mono text-slate-600 dark:text-slate-300">
                                  {appt.appointmentRef}
                                </span>
                                {appt.departmentName && ` • ${appt.departmentName}`}
                                {appt.reason && ` • ${appt.reason}`}
                              </p>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedAppt(appt)}
                              className="text-xs px-2.5 py-1.5 h-8"
                            >
                              Details
                            </Button>

                            {isConfirmed && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setCheckInTarget(appt)}
                                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                                className="bg-[#1d68f2] hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-8"
                              >
                                Check In
                              </Button>
                            )}

                            {isCheckedIn && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/doctor/appointments')}
                                leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 h-8"
                              >
                                Start Consultation
                              </Button>
                            )}

                            {isInConsultation && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate('/doctor/appointments')}
                                leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                                className="bg-[#1d68f2] hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-8"
                              >
                                Continue
                              </Button>
                            )}

                            {isCompleted && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <CircleCheck className="w-3.5 h-3.5" />
                                Done
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#16233b] mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Real-time consultation flow active</span>
                <button
                  onClick={() => navigate('/doctor/appointments')}
                  className="font-semibold text-[#1d68f2] dark:text-[#38bdf8] hover:underline flex items-center gap-1"
                >
                  <span>View All Appointments</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT 1 COLUMN: UPCOMING CONSULTATIONS */}
          <section aria-labelledby="upcoming-consultations-heading">
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] shadow-xs p-5 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#16233b]">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-[#1d68f2] dark:text-[#38bdf8]" />
                    <h2
                      id="upcoming-consultations-heading"
                      className="font-display font-bold text-slate-900 dark:text-white text-base"
                    >
                      Upcoming Consultations
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/doctor/schedule')}
                    className="text-xs font-semibold text-[#1d68f2] dark:text-[#38bdf8] hover:underline flex items-center gap-1"
                  >
                    <span>View Calendar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isLoading ? (
                  <AppointmentSkeleton />
                ) : upcomingAppointments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <p>No upcoming appointments beyond today.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcomingAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        onClick={() => setSelectedAppt(appt)}
                        className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#0f1b33]/60 hover:bg-slate-100 dark:hover:bg-[#12203d] border border-slate-200/60 dark:border-[#182744] cursor-pointer transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Date Badge: Day + Month */}
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0b1426] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
                            <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                              {formatDate(appt.appointmentDate, 'dd')}
                            </span>
                            <span className="text-[9px] font-bold uppercase text-[#1d68f2] dark:text-sky-400 leading-none mt-0.5">
                              {formatDate(appt.appointmentDate, 'MMM')}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1d68f2] transition-colors truncate max-w-[140px]">
                              {appt.patientName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {formatTime(appt.appointmentTime)} • {appt.departmentName || 'Consultation'}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1d68f2] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#16233b] mt-4">
                <button
                  onClick={() => navigate('/doctor/schedule')}
                  className="w-full text-center text-xs font-semibold text-[#1d68f2] dark:text-[#38bdf8] hover:underline"
                >
                  View Full Schedule →
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ============================================================ */}
        {/* 4. SECONDARY ROW: QUICK ACTIONS (2x2) & RECENT NOTIFICATIONS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QUICK ACTIONS (2x2 GRID) */}
          <section aria-labelledby="quick-actions-heading" className="lg:col-span-2">
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] shadow-xs p-5 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <h2
                  id="quick-actions-heading"
                  className="font-display font-bold text-slate-900 dark:text-white text-base mb-4 pb-3 border-b border-slate-100 dark:border-[#16233b]"
                >
                  Quick Actions
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Action 1: Open Clinical Desk */}
                  <div
                    onClick={() => navigate('/doctor/appointments')}
                    className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 hover:border-[#1d68f2] dark:hover:border-[#38bdf8] hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0c1933] text-[#1d68f2] dark:text-sky-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Open Clinical Desk
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Diagnoses & consultations
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1d68f2] group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Action 2: Start Queue */}
                  <div
                    onClick={() => navigate('/doctor/appointments')}
                    className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0c1933] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <ListOrdered className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Start Patient Queue
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Real-time check-in flow
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Action 3: New Prescription */}
                  <div
                    onClick={() => navigate('/doctor/appointments')}
                    className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0c1933] text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <FilePlus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Digital Prescription
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Medication & dosage items
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Action 4: Patient Search / Records */}
                  <div
                    onClick={() => navigate('/doctor/appointments')}
                    className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0c1933] text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Patient Search
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Look up clinical history
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#16233b] mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Direct clinical actions</span>
                <span className="font-mono text-[11px]">HAMS v1.0 Clinical Core</span>
              </div>
            </div>
          </section>

          {/* RECENT NOTIFICATIONS CARD */}
          <section aria-labelledby="recent-notifications-heading">
            <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] shadow-xs p-5 sm:p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#16233b]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#1d68f2] dark:text-[#38bdf8]" />
                    <h2
                      id="recent-notifications-heading"
                      className="font-display font-bold text-slate-900 dark:text-white text-base"
                    >
                      Recent Notifications
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/notifications')}
                    className="text-xs font-semibold text-[#1d68f2] dark:text-[#38bdf8] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0f1b33] transition-colors">
                    <span className="w-2 h-2 rounded-full bg-[#1d68f2] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        New appointment booked
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Patient registered for today&apos;s queue
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">5 min ago</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0f1b33] transition-colors">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        Prescription issued
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Digital Rx dispatched to patient portal
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">1 hour ago</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0f1b33] transition-colors">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        Schedule synchronized
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Working slots updated in department roster
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#16233b] mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/notifications')}
                  className="w-full justify-center text-xs"
                >
                  Notification Center
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHECK-IN CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {checkInTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-[#0c1629] rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200 dark:border-[#1b2b48] text-slate-900 dark:text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d68f2] dark:bg-blue-950/60 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg leading-tight">Check in Patient?</h3>
                  <p className="text-xs text-slate-400">Confirm arrival and advance appointment status to CHECKED_IN.</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#0f1b33] rounded-xl border border-slate-200/80 dark:border-[#182744] text-xs space-y-1.5 mb-4">
                <p className="font-bold text-sm text-slate-900 dark:text-white">{checkInTarget.patientName}</p>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Reference:</span>
                  <span className="font-mono font-semibold text-[#1d68f2] dark:text-sky-400">{checkInTarget.appointmentRef}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Time:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatTime(checkInTarget.appointmentTime)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#16233b]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCheckInTarget(null)}
                  disabled={isCheckingIn}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmCheckIn}
                  isLoading={isCheckingIn}
                  className="bg-[#1d68f2] hover:bg-blue-700 text-white"
                  leftIcon={<UserCheck className="w-4 h-4" />}
                >
                  Confirm Check-In
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* APPOINTMENT DETAIL OVERVIEW MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedAppt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-[#0c1629] rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200 dark:border-[#1b2b48] text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#16233b] pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg">Appointment Overview</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedAppt.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0f1b33] rounded-xl border border-slate-200/80 dark:border-[#182744]">
                  <span className="text-slate-500 font-medium">Status</span>
                  <AppointmentStatusBadge status={selectedAppt.status} />
                </div>

                <div className="p-3 bg-white dark:bg-[#0c1629] border border-slate-200 dark:border-[#182744] rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Patient Details</span>
                  <span className="font-bold text-sm block text-slate-900 dark:text-white">{selectedAppt.patientName}</span>
                  {selectedAppt.departmentName && (
                    <span className="text-slate-500">{selectedAppt.departmentName}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white dark:bg-[#0c1629] border border-slate-200 dark:border-[#182744] rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Date</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatDate(selectedAppt.appointmentDate)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#0c1629] border border-slate-200 dark:border-[#182744] rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Time</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatTime(selectedAppt.appointmentTime)}
                      {selectedAppt.endTime ? ` – ${formatTime(selectedAppt.endTime)}` : ''}
                    </span>
                  </div>
                </div>

                {selectedAppt.reason && (
                  <div className="p-3 bg-slate-50 dark:bg-[#0f1b33] rounded-xl border border-slate-200/80 dark:border-[#182744]">
                    <span className="text-slate-400 block mb-0.5">Reported Symptoms / Reason</span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{selectedAppt.reason}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#16233b] flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedAppt(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#1d68f2] hover:bg-blue-700 text-white"
                  onClick={() => {
                    setSelectedAppt(null);
                    navigate('/doctor/appointments');
                  }}
                >
                  Open in Clinical Desk
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DoctorPortalLayout>
  );
}
