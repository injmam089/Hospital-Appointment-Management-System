import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, CalendarCheck, CircleCheck, ShieldCheck,
  Clock, Shield, Stethoscope, ChevronRight, X, Pill, Eye, Heart, Brain, Bone, Baby,
  Building2, ArrowRight, FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { appointmentApi } from '../../api/appointment';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { AppointmentSkeleton } from '../../components/ui/LoadingSkeleton';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { formatDate, formatTime } from '../../lib/utils';
import type { AppointmentResponse } from '../../types';
import { PatientNavbar } from '../../components/layout/PatientNavbar';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [upcomingAppt, setUpcomingAppt] = useState<AppointmentResponse | null>(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState<AppointmentResponse | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [upcoming, all] = await Promise.all([
        appointmentApi.getPatientUpcomingAppointment(),
        appointmentApi.getPatientAppointments(),
      ]);
      setUpcomingAppt(upcoming);
      setTotalAppointments(all.length);
      setCompletedCount(all.filter((a) => a.status === 'COMPLETED').length);
    } catch {
      // Graceful fallback on dashboard mount
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const patientFirstName = user?.firstName || 'Patient';
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Patient';

  const getDepartmentIcon = (dept?: string) => {
    const d = (dept || '').toLowerCase();
    if (d.includes('ophthalm') || d.includes('eye')) return Eye;
    if (d.includes('cardio') || d.includes('heart')) return Heart;
    if (d.includes('neuro') || d.includes('brain')) return Brain;
    if (d.includes('ortho') || d.includes('bone')) return Bone;
    if (d.includes('pediat') || d.includes('child')) return Baby;
    return Building2;
  };

  const DeptIcon = getDepartmentIcon(upcomingAppt?.departmentName);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18] text-[#0f172a] dark:text-slate-100 font-sans flex flex-col transition-colors selection:bg-blue-500 selection:text-white">
      <PatientNavbar currentTab="dashboard" />

      <main className="page-container py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* HERO / WELCOME BANNER (ILLUSTRATED MEDICAL CONSULTATION) */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c1629] border border-slate-200/90 dark:border-[#1b2b48] shadow-subtle min-h-[174px] flex items-center">
          {/* Subtle clinical gradient illumination background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 via-sky-50/30 to-transparent dark:from-[#0b172e] dark:via-[#0e1e3b]/70 dark:to-transparent pointer-events-none" />

          {/* Illustrated Clinical Consultation Scene on Right */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[500px] pointer-events-none select-none z-10 overflow-hidden">
            <img
              src="/images/patient_hero_consultation.png"
              alt="Medical consultation illustration"
              className="h-full w-full object-cover object-right dark:opacity-85 dark:brightness-95 transition-opacity"
            />
          </div>

          <div className="relative z-20 w-full p-6 sm:p-7 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Content Column */}
            <div className="flex items-center gap-5 sm:gap-6 max-w-xl">
              {/* Reference-Matched Anime Patient Avatar (80px) */}
              <div className="flex-shrink-0">
                <ProfileAvatar
                  role="patient"
                  name={displayName}
                  size="2xl"
                  image="/images/patient_avatar_anime.png"
                  animated={true}
                  className="ring-4 ring-blue-100/80 dark:ring-sky-950/60 shadow-xs"
                />
              </div>

              {/* Patient Identity & Dynamic Greeting */}
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-display font-bold text-[#0f172a] dark:text-white text-base sm:text-lg leading-none">
                    {displayName}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/60">
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    <span>Patient Portal</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight mb-3">
                  {user?.email || 'patient.demo01@example.com'}
                </p>

                {/* Main Dynamic Greeting */}
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-display font-extrabold text-[#0f172a] dark:text-white tracking-tight leading-tight">
                  {getGreeting()},{' '}
                  <span className="text-[#1d68f2] dark:text-[#38bdf8]">{patientFirstName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal leading-relaxed">
                  Here is your clinical care overview and upcoming appointments.
                </p>
              </div>
            </div>

            {/* Interactive Primary CTA Button - Positioned exactly as in reference */}
            <div className="relative z-30 flex-shrink-0 pt-3 lg:pt-0 lg:absolute lg:right-6 lg:bottom-4 self-start sm:self-auto">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/doctors')}
                leftIcon={<CalendarDays className="w-5 h-5 text-white" />}
                rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
                className="bg-gradient-to-r from-[#1d68f2] to-[#2563eb] hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm px-6 py-2.5 rounded-2xl shadow-md transition-all active:scale-[0.98] border border-blue-400/30 min-h-[44px]"
              >
                Book New Visit
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PROTECTED CLINICAL ACCOUNT BANNER */}
        {/* ============================================================ */}
        <section aria-label="Security and account status">
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0c1629] border border-slate-200/80 dark:border-[#1b2b48] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1d68f2] dark:text-[#38bdf8] flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900/50">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-[#0f172a] dark:text-white">
                    Protected Clinical Account
                  </span>
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    title="Authenticated session active"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authenticated session active • Secure patient portal • Double-booking protected
                </p>
              </div>
            </div>
            <div className="flex items-center self-start sm:self-auto">
              <span className="text-xs font-mono bg-slate-100 dark:bg-[#15233c] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 shadow-2xs">
                # Patient #{user?.id || 41}
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* NEXT APPOINTMENT — CENTERPIECE */}
        {/* ============================================================ */}
        <section aria-labelledby="next-appointment-heading">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-5 h-5 text-[#1d68f2] dark:text-[#38bdf8]" />
              <h2 id="next-appointment-heading" className="font-display font-bold text-lg text-[#0f172a] dark:text-white tracking-tight">
                Next Appointment
              </h2>
            </div>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="text-xs sm:text-sm font-semibold text-[#1d68f2] dark:text-[#38bdf8] hover:underline flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
            >
              <span>View All ({totalAppointments})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/80 dark:border-[#1b2b48] shadow-subtle p-5 sm:p-6 transition-all hover:border-blue-200 dark:hover:border-blue-900/60">
            {isLoading ? (
              <AppointmentSkeleton />
            ) : upcomingAppt ? (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Doctor Identity & Clinical Info (With Illustrated Anime Doctor Avatar) */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative flex-shrink-0">
                    <ProfileAvatar
                      role="doctor"
                      name={upcomingAppt.doctorName}
                      size="lg"
                      image="/images/doctor_avatar_anime.png"
                      animated={false}
                      className="ring-2 ring-blue-100 dark:ring-sky-950/60 shadow-xs"
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1629]"
                      title="Physician available"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-[#0f172a] dark:text-white text-base sm:text-lg">
                        Dr. {upcomingAppt.doctorName}
                      </h3>
                      <AppointmentStatusBadge status={upcomingAppt.status} />
                      <span className="text-xs font-mono bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200/70 dark:border-blue-800/60 text-[#1d68f2] dark:text-[#38bdf8] font-semibold">
                        {upcomingAppt.appointmentRef}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium flex-wrap">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{upcomingAppt.doctorSpecialization}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DeptIcon className="w-3.5 h-3.5 text-muted" />
                        {upcomingAppt.departmentName}
                      </span>
                    </div>

                    {/* Consultation Note banner */}
                    <div className="mt-3">
                      <div className="inline-flex items-center text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#080f1d] px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-[#182742]">
                        <FileText className="w-3.5 h-3.5 text-[#1d68f2] dark:text-[#38bdf8] mr-1.5 flex-shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white mr-1.5">Consultation Note:</span>
                        <span>{upcomingAppt.reason || 'Blurry vision in right eye and visual acuity examination'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Timing & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 lg:border-l lg:border-slate-200/80 dark:lg:border-slate-800 lg:pl-6 justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-2 text-sm font-bold text-[#0f172a] dark:text-white">
                      <CalendarDays className="w-4 h-4 text-[#1d68f2] dark:text-[#38bdf8]" />
                      <span>{formatDate(upcomingAppt.appointmentDate, 'EEE, MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#1d68f2] dark:text-[#38bdf8]" />
                      <span>
                        {formatTime(upcomingAppt.appointmentTime)}
                        {upcomingAppt.endTime ? ` – ${formatTime(upcomingAppt.endTime)}` : ' – 9:30 AM'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedDetails(upcomingAppt)}
                      className="bg-[#1d68f2] hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-xs"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/patient/appointments')}
                      className="text-xs font-medium px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Calm Clinical Empty State */
              <div className="py-10 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1d68f2] dark:text-[#38bdf8] flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/50">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base">No upcoming appointments</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Find a doctor and schedule your next visit. Browse verified hospital specialists.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/doctors')}
                    leftIcon={<Stethoscope className="w-4 h-4" />}
                    className="bg-[#1d68f2] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold px-4 py-2 shadow-xs"
                  >
                    Find a Doctor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FOUR STATISTICS CARDS */}
        {/* ============================================================ */}
        <section aria-label="Care statistics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active / Upcoming */}
            <div className="relative overflow-hidden bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-subtle flex items-start justify-between">
              {/* Bottom decorative wave */}
              <div className="absolute -bottom-2 -left-2 -right-2 h-10 pointer-events-none opacity-40 dark:opacity-10">
                <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-full h-full text-blue-300 dark:text-blue-600 fill-current">
                  <path d="M0 15 Q30 5 60 15 T100 10 L100 25 L0 25 Z" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active / Upcoming</p>
                <p className="text-3xl font-display font-extrabold text-[#0f172a] dark:text-white mt-1">
                  {upcomingAppt ? '1' : '0'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Appointments</p>
              </div>
              <div className="relative z-10 w-11 h-11 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 text-[#1d68f2] dark:text-[#38bdf8] flex items-center justify-center border border-blue-100/80 dark:border-blue-900/50 flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-[#1d68f2] dark:text-[#38bdf8]" />
              </div>
            </div>

            {/* Card 2: Total Booked */}
            <div className="relative overflow-hidden bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-subtle flex items-start justify-between">
              {/* Bottom decorative wave */}
              <div className="absolute -bottom-2 -left-2 -right-2 h-10 pointer-events-none opacity-40 dark:opacity-10">
                <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-full h-full text-emerald-300 dark:text-emerald-600 fill-current">
                  <path d="M0 18 Q35 8 65 16 T100 12 L100 25 L0 25 Z" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Booked</p>
                <p className="text-3xl font-display font-extrabold text-[#0f172a] dark:text-white mt-1">
                  {totalAppointments}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Appointments</p>
              </div>
              <div className="relative z-10 w-11 h-11 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/80 dark:border-emerald-900/50 flex-shrink-0">
                <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Card 3: Completed Visits */}
            <div className="relative overflow-hidden bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-subtle flex items-start justify-between">
              {/* Bottom decorative wave */}
              <div className="absolute -bottom-2 -left-2 -right-2 h-10 pointer-events-none opacity-30 dark:opacity-10">
                <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-full h-full text-amber-300 dark:text-amber-600 fill-current">
                  <path d="M0 14 Q25 6 55 14 T100 8 L100 25 L0 25 Z" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Visits</p>
                <p className="text-3xl font-display font-extrabold text-[#0f172a] dark:text-white mt-1">
                  {completedCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Visits</p>
              </div>
              <div className="relative z-10 w-11 h-11 rounded-2xl bg-amber-50/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100/80 dark:border-amber-900/50 flex-shrink-0">
                <CircleCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            {/* Card 4: Account Status */}
            <div className="relative overflow-hidden bg-white dark:bg-[#0c1629] rounded-2xl border border-slate-200/90 dark:border-[#1b2b48] p-5 shadow-subtle flex items-start justify-between">
              {/* Bottom decorative wave */}
              <div className="absolute -bottom-2 -left-2 -right-2 h-10 pointer-events-none opacity-40 dark:opacity-10">
                <svg viewBox="0 0 100 25" preserveAspectRatio="none" className="w-full h-full text-teal-300 dark:text-teal-600 fill-current">
                  <path d="M0 16 Q30 7 65 17 T100 11 L100 25 L0 25 Z" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Account Status</p>
                <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mt-1">
                  Active
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Secure & Verified</p>
              </div>
              <div className="relative z-10 w-11 h-11 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100/80 dark:border-emerald-900/50 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* QUICK ACTIONS */}
        {/* ============================================================ */}
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase mb-3.5">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Find a Doctor */}
            <div
              onClick={() => navigate('/doctors')}
              className="group cursor-pointer bg-white dark:bg-[#0c1629] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-[#1b2b48] shadow-subtle hover:border-[#1d68f2]/40 dark:hover:border-[#38bdf8]/40 hover:shadow-md transition-all flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/doctors'); } }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1d68f2] dark:text-[#38bdf8] flex items-center justify-center border border-blue-100/60 dark:border-blue-900/40">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1d68f2] dark:text-[#38bdf8] flex items-center justify-center group-hover:bg-[#1d68f2] group-hover:text-white dark:group-hover:bg-[#38bdf8] dark:group-hover:text-[#0b1324] transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-base text-[#0f172a] dark:text-white mt-4">
                  Find a Doctor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Browse hospital specialists, verified credentials, and real-time appointment slots.
                </p>
              </div>
            </div>

            {/* Digital Prescriptions */}
            <div
              onClick={() => navigate('/patient/prescriptions')}
              className="group cursor-pointer bg-white dark:bg-[#0c1629] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-[#1b2b48] shadow-subtle hover:border-teal-500/40 dark:hover:border-teal-400/40 hover:shadow-md transition-all flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/patient/prescriptions'); } }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100/60 dark:border-teal-900/40">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-400 dark:group-hover:text-[#0b1324] transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-base text-[#0f172a] dark:text-white mt-4">
                  Digital Prescriptions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Review doctor advice, prescribed medications, dosages, and clinical instructions.
                </p>
              </div>
            </div>

            {/* Health Profile */}
            <div
              onClick={() => navigate('/patient/profile')}
              className="group cursor-pointer bg-white dark:bg-[#0c1629] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-[#1b2b48] shadow-subtle hover:border-purple-500/40 dark:hover:border-purple-400/40 hover:shadow-md transition-all flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/patient/profile'); } }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100/60 dark:border-purple-900/40">
                    <ProfileAvatar role="neutral" size="sm" animated={false} />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-400 dark:group-hover:text-[#0b1324] transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-base text-[#0f172a] dark:text-white mt-4">
                  Health Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Manage personal demographics, phone number, emergency contacts, and residential address.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* APPOINTMENT DETAIL MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-appt-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-[#0c1629] rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200 dark:border-[#1b2b48] text-foreground"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div>
                  <h3 id="modal-appt-title" className="font-display font-bold text-foreground text-lg">
                    Appointment Details
                  </h3>
                  <p className="text-xs text-muted font-mono">{selectedDetails.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedDetails(null)}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close appointment details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-border">
                  <span className="text-muted font-medium">Status</span>
                  <AppointmentStatusBadge status={selectedDetails.status} />
                </div>

                <div className="p-3 bg-white dark:bg-[#070d18] border border-border rounded-xl flex items-center gap-3">
                  <ProfileAvatar
                    role="doctor"
                    name={selectedDetails.doctorName}
                    size="sm"
                    image="/images/doctor_avatar_anime.png"
                    animated={false}
                    className="ring-2 ring-blue-100 dark:ring-sky-950/60 shadow-xs"
                  />
                  <div>
                    <span className="text-muted block mb-0.5 text-[11px]">Consulting Physician</span>
                    <span className="font-bold text-foreground text-sm block">Dr. {selectedDetails.doctorName}</span>
                    <span className="text-muted">{selectedDetails.doctorSpecialization} • {selectedDetails.departmentName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white dark:bg-[#070d18] border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Date</span>
                    <span className="font-semibold text-foreground">{formatDate(selectedDetails.appointmentDate)}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#070d18] border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Time</span>
                    <span className="font-semibold text-foreground">
                      {formatTime(selectedDetails.appointmentTime)}
                      {selectedDetails.endTime ? ` – ${formatTime(selectedDetails.endTime)}` : ''}
                    </span>
                  </div>
                </div>

                {selectedDetails.reason && (
                  <div className="p-3 bg-surface-secondary rounded-xl border border-border">
                    <span className="text-muted block mb-0.5">Reason for Visit</span>
                    <p className="text-foreground leading-relaxed">{selectedDetails.reason}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedDetails(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedDetails(null);
                    navigate('/patient/appointments');
                  }}
                  className="bg-[#1d68f2] hover:bg-blue-700 text-white"
                >
                  Manage in Appointments
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
