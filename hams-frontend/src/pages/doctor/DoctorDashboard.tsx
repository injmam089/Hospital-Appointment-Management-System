import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, UsersRound, UserRound, Clock3, ShieldCheck,
  Clock, Stethoscope, ChevronRight, X, CircleCheck, CheckCircle2,
  CalendarClock, Hash, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { appointmentApi } from '../../api/appointment';
import { consultationApi } from '../../api/consultation';
import { extractApiError } from '../../api/client';
import { StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { AppointmentSkeleton } from '../../components/ui/LoadingSkeleton';
import { formatDate, formatTime } from '../../lib/utils';
import type { AppointmentResponse } from '../../types';
import { DoctorNavbar } from '../../components/layout/DoctorNavbar';

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
    : 'Dr. Clinician';

  // Metrics calculation from live API data
  const waitingPatientsCount = todayAppointments.filter(
    (a) => a.status === 'CHECKED_IN' || a.status === 'IN_CONSULTATION'
  ).length;

  const completedTodayCount = todayAppointments.filter(
    (a) => a.status === 'COMPLETED'
  ).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = allAppointments
    .filter(
      (a) =>
        a.appointmentDate > todayStr &&
        !['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(a.status)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <DoctorNavbar currentTab="dashboard" />

      <main className="page-container py-8 space-y-8 flex-1">
        {/* ============================================================ */}
        {/* WORKSTATION HEADER */}
        {/* ============================================================ */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                {getGreeting()}, {doctorDisplayName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Practitioner
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              Here is your clinical schedule, live patient queue, and appointments for today.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
              leftIcon={<CalendarDays className="w-4 h-4" />}
            >
              Open Clinical Desk
            </Button>
          </div>
        </section>

        {/* Clinical Trust Indicator */}
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Verified Clinical Account</span>
                <span className="w-2 h-2 rounded-full bg-success inline-block" title="Session active" />
              </div>
              <p className="text-xs text-muted">
                Secure clinician session active • Consultation recording and digital prescription issuance enabled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono bg-surface-secondary px-3 py-1 rounded-xl border border-border text-foreground font-medium flex items-center gap-1">
              <Hash className="w-3 h-3 text-muted" />
              Staff #{user?.id || 1}
            </span>
            <span className="text-xs text-muted bg-surface-secondary px-3 py-1 rounded-xl border border-border">
              {formatDate(todayStr, 'EEE, MMM dd, yyyy')}
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PRIORITY 1: TODAY'S CLINICAL QUEUE (MOST IMPORTANT) */}
        {/* ============================================================ */}
        <section aria-labelledby="today-queue-heading">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
              <div>
                <h2 id="today-queue-heading" className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Today&apos;s Clinical Queue
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Ordered patient timeline for real-time check-in and consultations
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/doctor/appointments')}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                <span>Full Desk ({todayAppointments.length})</span>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <AppointmentSkeleton />
                <AppointmentSkeleton />
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="py-8 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base">Your clinical queue is clear</h3>
                  <p className="text-xs text-muted mt-1">
                    No patient appointments are scheduled for today. Review upcoming visits or update your schedule.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/doctor/appointments')}
                  >
                    View All Appointments
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
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-surface-secondary/70 rounded-2xl border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/40 shadow-subtle"
                    >
                      {/* Timeline block: Time + Patient */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-card border border-border flex flex-col items-center justify-center flex-shrink-0 shadow-subtle">
                          <Clock className="w-3.5 h-3.5 text-primary mb-0.5" />
                          <span className="text-[10px] font-bold text-foreground leading-none">
                            {formatTime(appt.appointmentTime)}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-foreground text-sm sm:text-base">
                              {appt.patientName}
                            </h3>
                            <AppointmentStatusBadge status={appt.status} />
                            <span className="text-[11px] font-mono text-muted bg-card px-2 py-0.5 rounded-lg border border-border">
                              {appt.appointmentRef}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                            {appt.departmentName && <span>{appt.departmentName}</span>}
                            {appt.reason && (
                              <>
                                <span>•</span>
                                <span className="text-foreground/80 truncate max-w-xs sm:max-w-md">
                                  &ldquo;{appt.reason}&rdquo;
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Workflow Actions */}
                      <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedAppt(appt)}
                        >
                          Details
                        </Button>

                        {isConfirmed && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setCheckInTarget(appt)}
                            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                          >
                            Continue Consultation
                          </Button>
                        )}

                        {isCompleted && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedAppt(appt)}
                            leftIcon={<CircleCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                          >
                            View Notes
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* PRIORITY 2: TODAY'S OVERVIEW (KPI STATS) */}
        {/* ============================================================ */}
        <section aria-label="Today care overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Appointments"
              value={todayAppointments.length}
              icon={<CalendarDays className="w-5 h-5 text-primary" />}
              color="blue"
              delay={0}
            />
            <StatCard
              title="Waiting / In Queue"
              value={waitingPatientsCount}
              icon={<Clock3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              color="amber"
              delay={0.05}
            />
            <StatCard
              title="Completed Consultations"
              value={completedTodayCount}
              icon={<CircleCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              color="green"
              delay={0.1}
            />
            <StatCard
              title="Total Practice Bookings"
              value={allAppointments.length}
              icon={<UsersRound className="w-5 h-5 text-primary" />}
              color="blue"
              delay={0.15}
            />
          </div>
        </section>

        {/* ============================================================ */}
        {/* PRIORITY 3 & 4: UPCOMING SCHEDULE & CLINICAL SHORTCUTS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Schedule (2 cols) */}
          <section aria-labelledby="upcoming-schedule-heading" className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-primary" />
                    <h2 id="upcoming-schedule-heading" className="font-display font-bold text-foreground text-base sm:text-lg">
                      Upcoming Consultations
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                  >
                    <span>View Calendar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isLoading ? (
                  <AppointmentSkeleton />
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-xs text-muted py-6 text-center">
                    No upcoming appointments beyond today.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {upcomingAppointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center font-bold text-muted text-[11px]">
                            {formatDate(appt.appointmentDate, 'dd')}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{appt.patientName}</p>
                            <p className="text-[11px] text-muted">
                              {formatDate(appt.appointmentDate, 'EEE, MMM dd')} at {formatTime(appt.appointmentTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <AppointmentStatusBadge status={appt.status} />
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            className="p-1 rounded-lg hover:bg-surface-secondary text-muted hover:text-foreground"
                            aria-label="View appointment details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-muted">
                <span>Synchronized with hospital schedule</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/doctor/schedule')}
                  leftIcon={<CalendarClock className="w-4 h-4" />}
                >
                  Manage Availability
                </Button>
              </div>
            </div>
          </section>

          {/* Clinical Shortcuts (1 col) */}
          <section aria-labelledby="clinical-shortcuts-heading">
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 h-full flex flex-col justify-between">
              <div>
                <h2 id="clinical-shortcuts-heading" className="font-display font-bold text-foreground text-base sm:text-lg mb-4 pb-3 border-b border-border">
                  Clinical Shortcuts
                </h2>
                <div className="space-y-3">
                  <div
                    onClick={() => navigate('/doctor/appointments')}
                    className="p-3 bg-surface-secondary rounded-xl border border-border hover:border-primary/40 hover:bg-surface cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Clinical Desk</p>
                        <p className="text-[11px] text-muted">Consultation notes & Rx issuing</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>

                  <div
                    onClick={() => navigate('/doctor/schedule')}
                    className="p-3 bg-surface-secondary rounded-xl border border-border hover:border-emerald-500/40 hover:bg-surface cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
                        <CalendarClock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Weekly Schedule</p>
                        <p className="text-[11px] text-muted">Working days, slots & leaves</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>

                  <div
                    onClick={() => navigate('/doctor/profile')}
                    className="p-3 bg-surface-secondary rounded-xl border border-border hover:border-border-hover hover:bg-surface cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-secondary text-foreground flex items-center justify-center">
                        <UserRound className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Practitioner Profile</p>
                        <p className="text-[11px] text-muted">Bio, credentials & fee</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => navigate('/doctor/appointments')}
                  leftIcon={<Stethoscope className="w-4 h-4" />}
                >
                  Start Consultation Queue
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ============================================================ */}
      {/* CHECK-IN CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {checkInTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-card rounded-2xl max-w-md w-full p-6 shadow-modal border border-border text-foreground"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">Check in Patient?</h3>
                  <p className="text-xs text-muted">Confirm arrival and advance appointment status to CHECKED_IN.</p>
                </div>
              </div>

              <div className="p-3.5 bg-surface-secondary rounded-xl border border-border text-xs space-y-1 mb-4">
                <p className="font-bold text-foreground text-sm">{checkInTarget.patientName}</p>
                <div className="flex items-center justify-between text-muted pt-1">
                  <span>Reference:</span>
                  <span className="font-mono font-semibold text-primary">{checkInTarget.appointmentRef}</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span>Time:</span>
                  <span className="font-semibold text-foreground">{formatTime(checkInTarget.appointmentTime)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
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
                  loadingText="Checking In..."
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-card rounded-2xl max-w-md w-full p-6 shadow-modal border border-border text-foreground"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">Appointment Overview</h3>
                  <p className="text-xs text-muted font-mono">{selectedAppt.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="p-1 rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-xl border border-border">
                  <span className="text-muted font-medium">Status</span>
                  <AppointmentStatusBadge status={selectedAppt.status} />
                </div>

                <div className="p-3 bg-card border border-border rounded-xl">
                  <span className="text-muted block mb-0.5">Patient Details</span>
                  <span className="font-bold text-foreground text-sm block">{selectedAppt.patientName}</span>
                  {selectedAppt.departmentName && (
                    <span className="text-muted">{selectedAppt.departmentName}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Date</span>
                    <span className="font-semibold text-foreground">{formatDate(selectedAppt.appointmentDate)}</span>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Time</span>
                    <span className="font-semibold text-foreground">
                      {formatTime(selectedAppt.appointmentTime)}
                      {selectedAppt.endTime ? ` – ${formatTime(selectedAppt.endTime)}` : ''}
                    </span>
                  </div>
                </div>

                {selectedAppt.reason && (
                  <div className="p-3 bg-surface-secondary rounded-xl border border-border">
                    <span className="text-muted block mb-0.5">Reported Symptoms / Reason</span>
                    <p className="text-foreground leading-relaxed">{selectedAppt.reason}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedAppt(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
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
    </div>
  );
}
