import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, CalendarCheck, CircleCheck, ShieldCheck, UserRound,
  Clock, Shield, Stethoscope, ChevronRight, X, Pill,
  Building2, Hash
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { appointmentApi } from '../../api/appointment';
import { StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { AppointmentSkeleton } from '../../components/ui/LoadingSkeleton';
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

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <PatientNavbar currentTab="dashboard" />

      <main className="page-container py-8 space-y-8 flex-1">
        {/* ============================================================ */}
        {/* HERO / WELCOME SECTION */}
        {/* ============================================================ */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
              {getGreeting()}, {patientFirstName}
            </h1>
            <p className="text-sm text-muted mt-1">
              Here is your clinical care overview and upcoming appointments.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctors')}
              leftIcon={<Stethoscope className="w-4 h-4" />}
            >
              Book New Visit
            </Button>
          </div>
        </section>

        {/* Security & Authenticated Account Trust Indicator */}
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Protected Clinical Account</span>
                <span className="w-2 h-2 rounded-full bg-success inline-block" title="Session active" />
              </div>
              <p className="text-xs text-muted">
                Authenticated session active • Secure patient portal • Double-booking protected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono bg-surface-secondary px-3 py-1 rounded-xl border border-border text-foreground font-medium flex items-center gap-1">
              <Hash className="w-3 h-3 text-muted" />
              Patient #{user?.id || 1}
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PRIORITY 1: NEXT APPOINTMENT — PRIMARY FOCUS */}
        {/* ============================================================ */}
        <section aria-labelledby="next-appointment-heading">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 id="next-appointment-heading" className="font-display font-bold text-foreground text-lg">
                  Next Appointment
                </h2>
              </div>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
              >
                <span>View All ({totalAppointments})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading ? (
              <AppointmentSkeleton />
            ) : upcomingAppt ? (
              <div className="p-5 bg-surface-secondary/70 rounded-2xl border border-border/80 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-primary/40">
                {/* Doctor Identity & Clinical Info */}
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold text-lg flex-shrink-0 border border-primary/20">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-foreground text-base sm:text-lg">
                        Dr. {upcomingAppt.doctorName}
                      </h3>
                      <AppointmentStatusBadge status={upcomingAppt.status} />
                      <span className="text-xs font-mono bg-card px-2.5 py-0.5 rounded-lg border border-border text-primary font-semibold">
                        {upcomingAppt.appointmentRef}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted mt-1 font-medium flex-wrap">
                      <span className="text-foreground font-semibold">{upcomingAppt.doctorSpecialization}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-muted" />
                        {upcomingAppt.departmentName}
                      </span>
                    </div>
                    {upcomingAppt.reason && (
                      <p className="text-xs text-foreground/80 mt-2.5 bg-card/80 px-3 py-1.5 rounded-xl border border-border/80 inline-block">
                        <span className="font-semibold text-muted">Consultation Note: </span>
                        {upcomingAppt.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Schedule Timing & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:border-l lg:border-border lg:pl-6 justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-1.5 text-sm font-bold text-foreground">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span>{formatDate(upcomingAppt.appointmentDate, 'EEE, MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted mt-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {formatTime(upcomingAppt.appointmentTime)}
                        {upcomingAppt.endTime ? ` – ${formatTime(upcomingAppt.endTime)}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedDetails(upcomingAppt)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/patient/appointments')}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Calm Clinical Empty State */
              <div className="py-8 px-4 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base">No upcoming appointments</h3>
                  <p className="text-xs text-muted mt-1">
                    You have no scheduled clinical visits at this time. Browse our medical directory to book a consultation.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/doctors')}
                    leftIcon={<Stethoscope className="w-4 h-4" />}
                  >
                    Find a Doctor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* PRIORITY 2: FOUR CLEAN STATS CARDS */}
        {/* ============================================================ */}
        <section aria-label="Care statistics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active / Upcoming"
              value={upcomingAppt ? '1' : '0'}
              icon={<CalendarDays className="w-5 h-5 text-primary" />}
              color="blue"
              delay={0}
            />
            <StatCard
              title="Total Booked"
              value={totalAppointments}
              icon={<CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              color="green"
              delay={0.05}
            />
            <StatCard
              title="Completed Visits"
              value={completedCount}
              icon={<CircleCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              color="amber"
              delay={0.1}
            />
            <StatCard
              title="Account Status"
              value="Active"
              icon={<ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              color="green"
              delay={0.15}
            />
          </div>
        </section>

        {/* ============================================================ */}
        {/* PRIORITY 3: QUICK ACTIONS */}
        {/* ============================================================ */}
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Find a Doctor */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between hover:border-primary/40 hover:shadow-card-hover transition-all">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-base">Find a Doctor</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Browse hospital specialists, verified credentials, and real-time appointment slots.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/doctors')}
                >
                  <span>Browse Clinicians</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Digital Prescriptions */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-card-hover transition-all">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-base">Digital Prescriptions</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Review doctor advice, prescribed medications, dosages, and clinical instructions.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/patient/prescriptions')}
                >
                  <span>Review Prescriptions</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Health Profile */}
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between hover:border-border-hover hover:shadow-card-hover transition-all">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary text-foreground flex items-center justify-center mb-3">
                  <UserRound className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-base">Health Profile</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Manage personal demographics, phone number, emergency contacts, and residential address.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/patient/profile')}
                >
                  <span>Manage Health Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-appt-title"
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
                  <h3 id="modal-appt-title" className="font-display font-bold text-foreground text-lg">
                    Appointment Details
                  </h3>
                  <p className="text-xs text-muted font-mono">{selectedDetails.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedDetails(null)}
                  className="p-1 rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground transition-colors"
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

                <div className="p-3 bg-card border border-border rounded-xl">
                  <span className="text-muted block mb-0.5">Consulting Physician</span>
                  <span className="font-bold text-foreground text-sm block">Dr. {selectedDetails.doctorName}</span>
                  <span className="text-muted">{selectedDetails.doctorSpecialization} • {selectedDetails.departmentName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-card border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Date</span>
                    <span className="font-semibold text-foreground">{formatDate(selectedDetails.appointmentDate)}</span>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-xl">
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
