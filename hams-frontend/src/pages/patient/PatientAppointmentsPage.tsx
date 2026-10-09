import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, Stethoscope,
  X, RefreshCw, AlertTriangle, Pill,
  Eye, Ban, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '../../api/appointment';
import { scheduleApi } from '../../api/schedule';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge, AppointmentStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppointmentSkeleton } from '../../components/ui/LoadingSkeleton';
import { formatDate, formatTime } from '../../lib/utils';
import type { AppointmentResponse, DoctorDaySlots, TimeSlotDto } from '../../types';
import { PatientNavbar } from '../../components/layout/PatientNavbar';

type TabType = 'UPCOMING' | 'PAST' | 'CANCELLED' | 'ALL';

export function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');
  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);

  // Cancellation Modal states
  const [cancelTarget, setCancelTarget] = useState<AppointmentResponse | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Rescheduling Modal states
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentResponse | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<DoctorDaySlots | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedAppt) setSelectedAppt(null);
        if (cancelTarget) setCancelTarget(null);
        if (rescheduleTarget) setRescheduleTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAppt, cancelTarget, rescheduleTarget]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentApi.getPatientAppointments();
      setAppointments(data);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((a) => {
    const isPastDate = a.appointmentDate < todayStr;
    const isTerminal = ['CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED'].includes(a.status);
    const isCompleted = a.status === 'COMPLETED';

    if (activeTab === 'UPCOMING') {
      return !isTerminal && !isCompleted && !isPastDate;
    }
    if (activeTab === 'PAST') {
      return isCompleted || (!isTerminal && isPastDate);
    }
    if (activeTab === 'CANCELLED') {
      return isTerminal;
    }
    return true; // 'ALL'
  });

  // Handle Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await appointmentApi.cancelAppointment(cancelTarget.id, {
        cancellationReason: cancelReason.trim() || undefined,
      });
      toast.success('Appointment cancelled successfully.');
      setCancelTarget(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Reschedule Date Change
  const handleRescheduleDateChange = async (dateVal: string) => {
    setRescheduleDate(dateVal);
    setSelectedSlot(null);
    if (!rescheduleTarget || !dateVal) return;

    setIsLoadingSlots(true);
    try {
      const data = await scheduleApi.getPublicSlots(rescheduleTarget.doctorId, dateVal);
      setRescheduleSlots(data);
    } catch (err) {
      toast.error(extractApiError(err));
      setRescheduleSlots(null);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (appt: AppointmentResponse) => {
    setRescheduleTarget(appt);
    setSelectedSlot(null);
    setRescheduleReason('');
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    handleRescheduleDateChange(dateStr);
  };

  // Confirm Reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDate || !selectedSlot) {
      toast.error('Please select both a date and an available time slot.');
      return;
    }
    setIsRescheduling(true);
    try {
      await appointmentApi.rescheduleAppointment(rescheduleTarget.id, {
        newDate: rescheduleDate,
        newTime: selectedSlot.startTime,
        reason: rescheduleReason.trim() || undefined,
      });
      toast.success('Appointment rescheduled successfully.');
      setRescheduleTarget(null);
      fetchAppointments();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsRescheduling(false);
    }
  };

  const isCancellable = (status: string) => status === 'CONFIRMED' || status === 'PENDING';

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <PatientNavbar currentTab="appointments" />

      <main className="page-container py-8 space-y-6 flex-1">
        {/* Page Title & Booking Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-foreground text-2xl sm:text-3xl tracking-tight">
                My Appointments
              </h1>
              <Badge variant="blue">{appointments.length} Total</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Review your scheduled visits, past medical history, and clinical appointments.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/doctors')}
            leftIcon={<Stethoscope className="w-4 h-4" />}
            className="self-start sm:self-auto"
          >
            Book New Appointment
          </Button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide border-b border-border text-xs sm:text-sm">
          {(
            [
              { key: 'UPCOMING', label: 'Upcoming' },
              { key: 'PAST', label: 'Past & Completed' },
              { key: 'CANCELLED', label: 'Cancelled' },
              { key: 'ALL', label: 'All History' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 font-semibold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-muted hover:text-foreground hover:bg-surface-secondary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <AppointmentSkeleton key={i} />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center shadow-subtle">
            <EmptyState
              icon={<CalendarDays className="w-10 h-10 text-primary" />}
              title={`No ${activeTab.toLowerCase()} appointments found`}
              description={
                activeTab === 'UPCOMING'
                  ? 'You have no upcoming clinical appointments scheduled. Connect with a specialist today.'
                  : 'No appointment records in this category.'
              }
              action={
                activeTab === 'UPCOMING' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/doctors')}
                    leftIcon={<Stethoscope className="w-4 h-4" />}
                  >
                    Find a Doctor
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => (
              <motion.div
                key={appt.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-card-hover transition-all shadow-subtle"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Doctor & Clinical Department */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold text-base flex-shrink-0 border border-primary/20">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-foreground text-base">
                          Dr. {appt.doctorName}
                        </h3>
                        <AppointmentStatusBadge status={appt.status} />
                        <span className="text-xs font-mono bg-surface-secondary px-2.5 py-0.5 rounded-lg border border-border text-foreground font-semibold">
                          {appt.appointmentRef}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1 font-medium">
                        <span className="text-foreground">{appt.doctorSpecialization}</span>
                        {appt.departmentName && ` • ${appt.departmentName}`}
                      </p>
                      {appt.reason && (
                        <p className="text-xs text-foreground/80 mt-2 bg-surface-secondary px-3 py-1.5 rounded-xl border border-border/80 inline-block">
                          <span className="font-semibold text-muted">Reason: </span>
                          {appt.reason}
                        </p>
                      )}
                      {appt.cancellationReason && (
                        <p className="text-xs text-danger mt-2 bg-danger-soft px-3 py-1.5 rounded-xl border border-danger/20 inline-block">
                          <span className="font-semibold">Cancellation note: </span>
                          {appt.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Date, Time & Contextual Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:border-l lg:border-border lg:pl-6 justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center sm:justify-end gap-1.5 text-sm font-bold text-foreground">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span>{formatDate(appt.appointmentDate, 'EEE, MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted mt-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>
                          {formatTime(appt.appointmentTime)}
                          {appt.endTime ? ` – ${formatTime(appt.endTime)}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAppt(appt)}
                        leftIcon={<Eye className="w-3.5 h-3.5 text-muted" />}
                      >
                        Details
                      </Button>

                      {appt.status === 'COMPLETED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate('/patient/prescriptions')}
                          leftIcon={<Pill className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        >
                          Prescription
                        </Button>
                      )}

                      {isCancellable(appt.status) && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openRescheduleModal(appt)}
                            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-primary" />}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setCancelTarget(appt);
                              setCancelReason('');
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 1. APPOINTMENT DETAIL MODAL */}
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
                  aria-label="Close modal"
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
                  <span className="text-muted block mb-0.5">Consulting Physician</span>
                  <span className="font-bold text-foreground text-sm block">Dr. {selectedAppt.doctorName}</span>
                  <span className="text-muted">{selectedAppt.doctorSpecialization} • {selectedAppt.departmentName}</span>
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
                    <span className="text-muted block mb-0.5">Reason for Visit</span>
                    <p className="text-foreground leading-relaxed">{selectedAppt.reason}</p>
                  </div>
                )}

                {selectedAppt.cancellationReason && (
                  <div className="p-3 bg-danger-soft rounded-xl border border-danger/20">
                    <span className="text-danger font-semibold block mb-0.5">Cancellation Reason</span>
                    <p className="text-danger leading-relaxed">{selectedAppt.cancellationReason}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedAppt(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. CANCEL CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {cancelTarget && (
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
                <div className="w-10 h-10 rounded-xl bg-danger-soft text-danger flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">Cancel Appointment?</h3>
                  <p className="text-xs text-muted">This slot will be released back to the clinic schedule.</p>
                </div>
              </div>

              {/* Target appointment summary */}
              <div className="p-3.5 bg-surface-secondary rounded-xl border border-border text-xs space-y-1 mb-4">
                <p className="font-bold text-foreground">Dr. {cancelTarget.doctorName}</p>
                <p className="text-muted">{cancelTarget.doctorSpecialization} • {cancelTarget.departmentName}</p>
                <div className="flex items-center gap-2 pt-1 font-semibold text-foreground">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  <span>{formatDate(cancelTarget.appointmentDate)}</span>
                  <span>•</span>
                  <span>{formatTime(cancelTarget.appointmentTime)}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Provide brief context for the medical department..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCancelTarget(null)}
                  disabled={isCancelling}
                >
                  Keep Appointment
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmCancel}
                  isLoading={isCancelling}
                  loadingText="Cancelling..."
                >
                  Cancel Appointment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 3. RESCHEDULE MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {rescheduleTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-card rounded-2xl max-w-lg w-full my-8 p-6 shadow-modal border border-border text-foreground relative max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-foreground text-lg">Reschedule Appointment</h3>
                </div>
                <button
                  onClick={() => setRescheduleTarget(null)}
                  className="p-1 rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Appointment Summary */}
              <div className="p-3 bg-surface-secondary rounded-xl border border-border text-xs mb-4">
                <span className="text-muted block text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                  Current Schedule
                </span>
                <p className="font-bold text-foreground text-sm">Dr. {rescheduleTarget.doctorName}</p>
                <p className="text-muted">{rescheduleTarget.doctorSpecialization} • {rescheduleTarget.departmentName}</p>
                <p className="text-primary font-semibold mt-1">
                  {formatDate(rescheduleTarget.appointmentDate)} at {formatTime(rescheduleTarget.appointmentTime)}
                </p>
              </div>

              {/* Select New Date */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Select New Consultation Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => handleRescheduleDateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Available Time Slots */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-foreground">
                    Available Time Slots
                  </label>
                  {selectedSlot && (
                    <span className="text-xs font-semibold text-primary">
                      Selected: {selectedSlot.formattedTime}
                    </span>
                  )}
                </div>

                {isLoadingSlots ? (
                  <div className="py-6 text-center text-xs text-muted">
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    Checking open clinic slots...
                  </div>
                ) : !rescheduleSlots ? (
                  <p className="text-xs text-muted py-2">Select a date above to view slots.</p>
                ) : rescheduleSlots.onLeave ? (
                  <div className="p-3 bg-danger-soft text-danger border border-danger/20 rounded-xl text-xs flex items-center gap-2">
                    <Ban className="w-4 h-4 flex-shrink-0" />
                    <span>Doctor is on leave on this date ({rescheduleSlots.leaveReason || 'Absence'}).</span>
                  </div>
                ) : !rescheduleSlots.workingDay ? (
                  <div className="p-3 bg-surface-secondary border border-border rounded-xl text-xs text-muted flex items-center gap-2">
                    <Moon className="w-4 h-4 flex-shrink-0" />
                    <span>Doctor does not have regular clinic hours on {rescheduleSlots.dayOfWeek}s.</span>
                  </div>
                ) : rescheduleSlots.slots.length === 0 ? (
                  <p className="text-xs text-muted py-2">No open slots available on this date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                    {rescheduleSlots.slots.map((slot, idx) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                            !slot.available
                              ? 'bg-surface-secondary text-muted/60 border-border cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-primary text-white border-primary shadow-subtle'
                              : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary-soft/30'
                          }`}
                        >
                          {slot.formattedTime}
                          {!slot.available && (
                            <span className="block text-[9px] no-underline font-normal text-muted/60">
                              Booked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Optional Reason */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Reason for Rescheduling (Optional)
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Schedule conflict, work emergency"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRescheduleTarget(null)}
                  disabled={isRescheduling}
                >
                  Keep Current Slot
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmReschedule}
                  disabled={!selectedSlot}
                  isLoading={isRescheduling}
                  loadingText="Rescheduling..."
                >
                  Confirm Reschedule
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
