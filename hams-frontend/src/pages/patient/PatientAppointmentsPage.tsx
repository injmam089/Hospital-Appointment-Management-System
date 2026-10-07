import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Stethoscope, ArrowLeft,
  X, RefreshCw, AlertTriangle, Pill
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '../../api/appointment';
import { scheduleApi } from '../../api/schedule';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge, AppointmentStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatTime } from '../../lib/utils';
import type { AppointmentResponse, DoctorDaySlots, TimeSlotDto } from '../../types';

type TabType = 'UPCOMING' | 'PAST' | 'CANCELLED' | 'ALL';

export function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');
  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);

  // Modal states
  const [cancelTarget, setCancelTarget] = useState<AppointmentResponse | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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

  // Filter appointments according to active tab
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
    // Default to tomorrow or appointment date + 1 day
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
    <div className="min-h-screen bg-surface">
      {/* Top Header */}
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="page-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-navy text-xl">My Appointments</h1>
                <Badge variant="blue">{appointments.length} Total</Badge>
              </div>
              <p className="text-xs text-muted">Manage your clinical visits, schedules, and past consultations</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/doctors')}
            leftIcon={<Stethoscope className="w-4 h-4" />}
          >
            Book New Appointment
          </Button>
        </div>
      </header>

      <main className="page-container py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-2">
          {(
            [
              { key: 'UPCOMING', label: 'Upcoming' },
              { key: 'PAST', label: 'Past & Completed' },
              { key: 'CANCELLED', label: 'Cancelled' },
              { key: 'ALL', label: 'All History' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-muted hover:text-navy hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse flex flex-col gap-3">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-8 bg-slate-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="card p-12 text-center">
            <EmptyState
              icon={<Calendar className="w-10 h-10 text-muted" />}
              title={`No ${activeTab.toLowerCase()} appointments found`}
              description={
                activeTab === 'UPCOMING'
                  ? 'You have no pending clinical appointments. Book an appointment with a verified doctor today.'
                  : 'No appointment records in this category.'
              }
              action={
                activeTab === 'UPCOMING' ? (
                  <Button variant="primary" onClick={() => navigate('/doctors')} leftIcon={<Stethoscope className="w-4 h-4" />}>
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 hover:border-primary-200 transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Doctor & Clinic Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-navy text-base">
                          Dr. {appt.doctorName}
                        </h3>
                        <AppointmentStatusBadge status={appt.status} />
                        <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                          {appt.appointmentRef}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {appt.doctorSpecialization} • <span className="font-medium text-navy">{appt.departmentName}</span>
                      </p>
                      {appt.reason && (
                        <p className="text-xs text-slate-700 mt-2 bg-surface p-2 rounded-lg border border-border inline-block max-w-xl">
                          <span className="font-semibold text-muted">Reason: </span>
                          {appt.reason}
                        </p>
                      )}
                      {appt.cancellationReason && (
                        <p className="text-xs text-medical-red mt-2 bg-red-50 p-2 rounded-lg border border-red-200 inline-block">
                          <span className="font-semibold">Cancellation Note: </span>
                          {appt.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date, Time & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:border-l md:border-border md:pl-6 justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center sm:justify-end gap-1.5 text-sm font-semibold text-navy">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span>{formatDate(appt.appointmentDate, 'EEE, MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTime(appt.appointmentTime)} {appt.endTime ? `– ${formatTime(appt.endTime)}` : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAppt(appt)}
                      >
                        Details
                      </Button>

                      {isCancellable(appt.status) && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openRescheduleModal(appt)}
                            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-primary-600" />}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-medical-red hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setCancelTarget(appt);
                              setCancelReason('');
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {appt.status === 'COMPLETED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate('/patient/prescriptions')}
                          leftIcon={<Pill className="w-3.5 h-3.5 text-emerald-600" />}
                        >
                          View Prescription
                        </Button>
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
      {/* APPOINTMENT DETAILS MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-modal border border-border"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">Appointment Details</h3>
                  <p className="text-xs text-muted">Reference: {selectedAppt.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="p-1 rounded-lg hover:bg-surface text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                  <span className="text-xs text-muted font-medium">Status</span>
                  <AppointmentStatusBadge status={selectedAppt.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <span className="text-muted block mb-1">Doctor</span>
                    <span className="font-semibold text-navy text-sm block">Dr. {selectedAppt.doctorName}</span>
                    <span className="text-muted">{selectedAppt.doctorSpecialization}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <span className="text-muted block mb-1">Department</span>
                    <span className="font-semibold text-navy text-sm block">{selectedAppt.departmentName}</span>
                    <span className="text-muted">Clinical Wing</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <span className="text-muted block mb-1">Date</span>
                    <span className="font-semibold text-navy text-sm block">
                      {formatDate(selectedAppt.appointmentDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <span className="text-muted block mb-1">Scheduled Time</span>
                    <span className="font-semibold text-navy text-sm block">
                      {formatTime(selectedAppt.appointmentTime)}
                    </span>
                  </div>
                </div>

                {selectedAppt.reason && (
                  <div className="p-3 bg-surface rounded-xl border border-border text-xs">
                    <span className="text-muted block mb-1 font-medium">Reason for Consultation</span>
                    <p className="text-navy leading-relaxed">{selectedAppt.reason}</p>
                  </div>
                )}

                {selectedAppt.cancellationReason && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs">
                    <span className="text-medical-red block mb-1 font-semibold">Cancellation Reason</span>
                    <p className="text-red-800">{selectedAppt.cancellationReason}</p>
                  </div>
                )}

                <div className="text-[11px] text-muted flex items-center justify-between pt-2">
                  <span>Booked on: {formatDate(selectedAppt.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                  {selectedAppt.updatedAt && <span>Updated: {formatDate(selectedAppt.updatedAt, 'MMM dd, yyyy HH:mm')}</span>}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelectedAppt(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* CANCELLATION CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {cancelTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-border"
            >
              <div className="flex items-center gap-3 text-medical-red mb-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-display font-bold text-navy text-lg">Cancel Appointment?</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                Are you sure you want to cancel your appointment with <strong>Dr. {cancelTarget.doctorName}</strong> on{' '}
                <strong>{formatDate(cancelTarget.appointmentDate)}</strong> at{' '}
                <strong>{formatTime(cancelTarget.appointmentTime)}</strong>? This slot will be released for other patients.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-navy mb-1.5">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Work schedule conflict, feeling better, personal emergency..."
                  rows={3}
                  className="input-field text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
                >
                  Confirm Cancellation
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* RESCHEDULING MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {rescheduleTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-modal border border-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">Reschedule Appointment</h3>
                  <p className="text-xs text-muted">
                    Dr. {rescheduleTarget.doctorName} • {rescheduleTarget.departmentName}
                  </p>
                </div>
                <button
                  onClick={() => setRescheduleTarget(null)}
                  className="p-1 rounded-lg hover:bg-surface text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current slot alert */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-medical-amber flex-shrink-0" />
                <span>
                  Currently booked for: <strong>{formatDate(rescheduleTarget.appointmentDate)}</strong> at{' '}
                  <strong>{formatTime(rescheduleTarget.appointmentTime)}</strong>
                </span>
              </div>

              {/* New Date Picker */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  Select New Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => handleRescheduleDateChange(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              {/* Time Slot Picker */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  Select Available Time Slot
                </label>
                {isLoadingSlots ? (
                  <div className="p-6 text-center text-xs text-muted animate-pulse">
                    Loading doctor's availability for {rescheduleDate}...
                  </div>
                ) : rescheduleSlots?.onLeave ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-medical-red">
                    Doctor is on leave on this date: {rescheduleSlots.leaveReason || 'Not available'}. Please select another date.
                  </div>
                ) : !rescheduleSlots?.workingDay ? (
                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-muted">
                    Doctor does not have consultation hours on this day of week. Please choose another date.
                  </div>
                ) : rescheduleSlots.slots.length === 0 ? (
                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-muted">
                    No time slots configured for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {rescheduleSlots.slots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                            !slot.available
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                              : 'bg-white text-navy border-border hover:border-primary-400 hover:bg-primary-50/50'
                          }`}
                        >
                          {slot.formattedTime}
                          {!slot.available && <span className="block text-[9px] no-underline font-normal">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reschedule reason */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-navy mb-1.5">
                  Reason for Rescheduling (Optional)
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Schedule adjustment, earlier consultation needed..."
                  rows={2}
                  className="input-field text-xs resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRescheduleTarget(null)}
                  disabled={isRescheduling}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmReschedule}
                  isLoading={isRescheduling}
                  disabled={!selectedSlot}
                >
                  Confirm New Slot
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
