import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Calendar, Clock, Search, X,
  Stethoscope, Plus, Trash2, Pill,
  FileText, CircleCheck, UserCheck,
  FileHeart, ClipboardList,
  UserRound, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '../../api/appointment';
import { consultationApi } from '../../api/consultation';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge, AppointmentStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppointmentSkeleton } from '../../components/ui/LoadingSkeleton';
import { formatDate, formatTime } from '../../lib/utils';
import type {
  AppointmentResponse,
  ConsultationResponse,
  CreatePrescriptionItemPayload
} from '../../types';
import { DoctorNavbar } from '../../components/layout/DoctorNavbar';

type DoctorTab = 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'ALL';

interface MedicineRow extends CreatePrescriptionItemPayload {
  tempId: string;
}

export function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DoctorTab>('TODAY');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Selected appointment details modal
  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);

  // Check-In confirmation modal
  const [checkInTarget, setCheckInTarget] = useState<AppointmentResponse | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Active consultation clinical workspace modal
  const [consultationAppt, setConsultationAppt] = useState<AppointmentResponse | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);

  // Complete consultation confirmation modal
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);

  // View existing consultation modal
  const [viewConsultation, setViewConsultation] = useState<ConsultationResponse | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmCompleteOpen) {
          setConfirmCompleteOpen(false);
        } else if (viewConsultation) {
          setViewConsultation(null);
        } else if (consultationAppt) {
          setConsultationAppt(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmCompleteOpen, viewConsultation, consultationAppt]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await appointmentApi.getDoctorAppointments(
        selectedDate ? { date: selectedDate } : undefined
      );
      setAppointments(data);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Workflow Action 1: Check In
  const handleConfirmCheckIn = async () => {
    if (!checkInTarget) return;
    setIsCheckingIn(true);
    try {
      const updated = await consultationApi.doctorCheckIn(checkInTarget.id);
      toast.success(`Patient ${updated.patientName} checked in successfully.`);
      updateAppointmentInState(updated);
      setCheckInTarget(null);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Workflow Action 2: Start Consultation
  const handleStartConsultation = async (appt: AppointmentResponse) => {
    try {
      const updated = await consultationApi.doctorStartConsultation(appt.id);
      toast.success(`Consultation started for ${updated.patientName}`);
      updateAppointmentInState(updated);
      openConsultationDesk(updated);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  // Workflow Action 3: Complete Appointment
  const handleCompleteAppointment = async (apptId: number) => {
    try {
      const updated = await consultationApi.doctorCompleteAppointment(apptId);
      toast.success(`Appointment ${updated.appointmentRef} marked COMPLETED.`);
      updateAppointmentInState(updated);
      setConsultationAppt(null);
      setConfirmCompleteOpen(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const updateAppointmentInState = (updated: AppointmentResponse) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (selectedAppt?.id === updated.id) {
      setSelectedAppt(updated);
    }
  };

  // Open Consultation Clinical Desk
  const openConsultationDesk = (appt: AppointmentResponse) => {
    setConsultationAppt(appt);
    setSymptoms(appt.reason || '');
    setDiagnosis('');
    setClinicalNotes('');
    setTreatmentNotes('');
    setFollowUpDate('');
    setGeneralInstructions('');
    setMedicines([
      {
        tempId: 'med-1',
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  // Open View Consultation
  const handleViewConsultation = async (consultationId: number) => {
    try {
      const data = await consultationApi.doctorGetConsultationById(consultationId);
      setViewConsultation(data);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  // Add / Remove medicine row
  const addMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        tempId: `med-${Date.now()}`,
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const removeMedicineRow = (tempId: string) => {
    setMedicines((prev) => prev.filter((m) => m.tempId !== tempId));
  };

  const updateMedicineField = (
    tempId: string,
    field: keyof CreatePrescriptionItemPayload,
    value: string
  ) => {
    setMedicines((prev) =>
      prev.map((m) => (m.tempId === tempId ? { ...m, [field]: value } : m))
    );
  };

  // Submit Consultation Form (Save or Complete)
  const handleSaveConsultation = async (andComplete: boolean = false) => {
    if (!consultationAppt) return;
    if (!diagnosis.trim()) {
      toast.error('Diagnosis is required to record a clinical consultation.');
      return;
    }

    const validMeds = medicines
      .filter((m) => m.medicineName.trim().length > 0)
      .map(({ medicineName, dosage, frequency, duration, instructions }) => ({
        medicineName: medicineName.trim(),
        dosage: dosage.trim() || '1 unit',
        frequency: frequency.trim() || 'As directed',
        duration: duration.trim() || '5 days',
        instructions: instructions?.trim() || undefined,
      }));

    setIsSubmittingConsultation(true);
    try {
      const created = await consultationApi.doctorCreateConsultation(consultationAppt.id, {
        symptoms: symptoms.trim() || undefined,
        diagnosis: diagnosis.trim(),
        clinicalNotes: clinicalNotes.trim() || undefined,
        treatmentNotes: treatmentNotes.trim() || undefined,
        followUpDate: followUpDate || undefined,
        generalInstructions: generalInstructions.trim() || undefined,
        medicines: validMeds.length > 0 ? validMeds : undefined,
      });

      toast.success('Consultation clinical notes saved successfully.');

      if (andComplete) {
        await handleCompleteAppointment(consultationAppt.id);
      } else {
        const updated = {
          ...consultationAppt,
          hasConsultation: true,
          consultationId: created.id,
        };
        updateAppointmentInState(updated);
        setConsultationAppt(null);
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmittingConsultation(false);
    }
  };

  // Tab & search filtering
  const filteredAppointments = appointments.filter((a) => {
    // Search match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = a.patientName?.toLowerCase().includes(q);
      const matchRef = a.appointmentRef?.toLowerCase().includes(q);
      const matchReason = a.reason?.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchReason) return false;
    }

    const isToday = a.appointmentDate === todayStr;
    const isFuture = a.appointmentDate > todayStr;
    const isTerminal = ['CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED'].includes(a.status);
    const isCompleted = a.status === 'COMPLETED';

    if (activeTab === 'TODAY') {
      return isToday;
    }
    if (activeTab === 'UPCOMING') {
      return (isToday || isFuture) && !isCompleted && !isTerminal;
    }
    if (activeTab === 'COMPLETED') {
      return isCompleted;
    }
    if (activeTab === 'CANCELLED') {
      return isTerminal;
    }
    return true; // 'ALL'
  });

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <DoctorNavbar currentTab="appointments" />

      <main className="page-container py-8 space-y-6 flex-1">
        {/* Header & Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-foreground text-2xl sm:text-3xl tracking-tight">
                Clinical Desk
              </h1>
              <Badge variant="blue">{appointments.length} Total Records</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Live consultation workstation, arrival check-in, diagnosis recording, and prescription issuance.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedDate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDate('')}
              >
                Clear Date Filter
              </Button>
            )}
          </div>
        </div>

        {/* Filters Bar: Tabs + Search + Date */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-subtle space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
              {(
                [
                  { key: 'TODAY', label: "Today's Queue" },
                  { key: 'UPCOMING', label: 'Upcoming' },
                  { key: 'COMPLETED', label: 'Completed' },
                  { key: 'CANCELLED', label: 'Cancelled' },
                  { key: 'ALL', label: 'All History' },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-subtle'
                        : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-secondary/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <Calendar className="w-4 h-4 text-muted" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                title="Filter by specific date"
                aria-label="Filter by specific appointment date"
              />
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, appointment reference (#APT-...), or symptoms..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Search appointments"
            />
          </div>
        </div>

        {/* Appointment Cards List */}
        {isLoading ? (
          <div className="space-y-4">
            <AppointmentSkeleton />
            <AppointmentSkeleton />
            <AppointmentSkeleton />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center shadow-subtle">
            <EmptyState
              icon={<CalendarDays className="w-10 h-10 text-primary" />}
              title={`No ${activeTab.toLowerCase()} appointments found`}
              description={
                search || selectedDate
                  ? 'No appointments matched your query or selected date.'
                  : activeTab === 'TODAY'
                  ? 'Your clinical queue is clear. No patients scheduled for today.'
                  : 'No appointment records in this category.'
              }
              action={
                search || selectedDate ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setSelectedDate('');
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appt) => {
              const isConfirmed = appt.status === 'CONFIRMED';
              const isCheckedIn = appt.status === 'CHECKED_IN';
              const isInConsultation = appt.status === 'IN_CONSULTATION';
              const isCompleted = appt.status === 'COMPLETED';

              return (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-card-hover transition-all shadow-subtle"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Patient & Context */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-secondary text-foreground flex items-center justify-center font-bold text-sm flex-shrink-0 border border-border">
                        <UserRound className="w-5 h-5 text-primary" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-foreground text-base">
                            {appt.patientName}
                          </h3>
                          <AppointmentStatusBadge status={appt.status} />
                          <span className="text-xs font-mono bg-surface-secondary px-2.5 py-0.5 rounded-lg border border-border text-foreground font-semibold">
                            {appt.appointmentRef}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted mt-1 font-medium flex-wrap">
                          <span className="flex items-center gap-1 text-foreground">
                            <CalendarDays className="w-3.5 h-3.5 text-primary" />
                            {formatDate(appt.appointmentDate, 'EEE, MMM dd, yyyy')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-foreground">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {formatTime(appt.appointmentTime)}
                            {appt.endTime ? ` – ${formatTime(appt.endTime)}` : ''}
                          </span>
                        </div>

                        {appt.reason && (
                          <p className="text-xs text-foreground/80 mt-2 bg-surface-secondary px-3 py-1.5 rounded-xl border border-border/80 inline-block">
                            <span className="font-semibold text-muted">Context: </span>
                            {appt.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Workflow Actions */}
                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAppt(appt)}
                      >
                        Overview
                      </Button>

                      {/* Step 1: Check In */}
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

                      {/* Step 2: Start Consultation */}
                      {isCheckedIn && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartConsultation(appt)}
                          leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Start Consultation
                        </Button>
                      )}

                      {/* Step 3: Continue Consultation */}
                      {isInConsultation && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openConsultationDesk(appt)}
                          leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                        >
                          Continue Consultation
                        </Button>
                      )}

                      {/* Step 4: Completed -> View Consultation */}
                      {isCompleted && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (appt.consultationId) {
                              handleViewConsultation(appt.consultationId);
                            } else {
                              setSelectedAppt(appt);
                            }
                          }}
                          leftIcon={<FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        >
                          View Consultation
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 1. CHECK-IN CONFIRMATION MODAL */}
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
                  <p className="text-xs text-muted">Confirm patient arrival and advance queue status.</p>
                </div>
              </div>

              <div className="p-3.5 bg-surface-secondary rounded-xl border border-border text-xs space-y-1 mb-4">
                <p className="font-bold text-foreground text-sm">{checkInTarget.patientName}</p>
                <div className="flex items-center justify-between text-muted pt-1">
                  <span>Reference:</span>
                  <span className="font-mono font-semibold text-primary">{checkInTarget.appointmentRef}</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span>Scheduled Time:</span>
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
      {/* 2. CLINICAL CONSULTATION WORKSPACE MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {consultationAppt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-card rounded-2xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-modal border border-border text-foreground relative max-h-[92vh] overflow-y-auto space-y-6"
            >
              {/* Workspace Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-foreground text-xl">
                      Clinical Consultation Desk
                    </h2>
                    <p className="text-xs text-muted">
                      Patient: <span className="font-bold text-foreground">{consultationAppt.patientName}</span> • Ref: <span className="font-mono text-primary font-semibold">{consultationAppt.appointmentRef}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setConsultationAppt(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground"
                  aria-label="Close consultation modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient & Appointment Context */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-surface-secondary rounded-xl border border-border text-xs">
                <div>
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider">Date</span>
                  <span className="font-semibold text-foreground">{formatDate(consultationAppt.appointmentDate)}</span>
                </div>
                <div>
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider">Time</span>
                  <span className="font-semibold text-foreground">{formatTime(consultationAppt.appointmentTime)}</span>
                </div>
                <div>
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider">Status</span>
                  <span className="font-semibold text-primary">{consultationAppt.status}</span>
                </div>
                <div>
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider">Department</span>
                  <span className="font-semibold text-foreground">{consultationAppt.departmentName || 'General'}</span>
                </div>
              </div>

              {/* Form Section 1: Diagnosis & Symptoms */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-border/80">
                  <FileHeart className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">
                    Diagnosis & Symptoms
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Clinical Diagnosis <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Primary diagnostic finding (e.g. Acute Bronchitis, Essential Hypertension)"
                    className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Symptoms & Clinical History
                    </label>
                    <textarea
                      rows={3}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Observed symptoms, onset, severity..."
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Clinical & Diagnostic Notes
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="Examination notes, vitals, lab references..."
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section 2: Prescription & Medications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">
                      Prescription & Medication Regimen
                    </h3>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={addMedicineRow}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Medicine
                  </Button>
                </div>

                <div className="space-y-3">
                  {medicines.map((med, index) => (
                    <div
                      key={med.tempId}
                      className="p-3.5 bg-surface-secondary rounded-xl border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          Medication #{index + 1}
                        </span>
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(med.tempId)}
                            className="p-1 rounded-lg text-danger hover:bg-danger-soft transition-colors"
                            aria-label={`Remove medicine ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Medicine Name
                          </label>
                          <input
                            type="text"
                            value={med.medicineName}
                            onChange={(e) =>
                              updateMedicineField(med.tempId, 'medicineName', e.target.value)
                            }
                            placeholder="e.g. Paracetamol / Amoxicillin"
                            className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) =>
                              updateMedicineField(med.tempId, 'dosage', e.target.value)
                            }
                            placeholder="e.g. 500mg"
                            className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) =>
                              updateMedicineField(med.tempId, 'frequency', e.target.value)
                            }
                            placeholder="e.g. 1-0-1 after meals"
                            className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-muted mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) =>
                              updateMedicineField(med.tempId, 'duration', e.target.value)
                            }
                            placeholder="e.g. 5 days"
                            className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={med.instructions || ''}
                          onChange={(e) =>
                            updateMedicineField(med.tempId, 'instructions', e.target.value)
                          }
                          placeholder="Specific administration instructions (e.g. Take with warm water before sleeping)..."
                          className="w-full px-3 py-1.5 bg-card border border-border rounded-xl text-[11px] text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Section 3: Treatment Advice & Follow-Up */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-border/80">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">
                    Advice & Follow-Up
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Lifestyle Advice & Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={treatmentNotes}
                      onChange={(e) => setTreatmentNotes(e.target.value)}
                      placeholder="Diet, hydration, exercise, warnings..."
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Recommended Follow-Up Date (Optional)
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConsultationAppt(null)}
                  disabled={isSubmittingConsultation}
                >
                  Discard / Close
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSaveConsultation(false)}
                    isLoading={isSubmittingConsultation}
                    loadingText="Saving Draft..."
                    leftIcon={<Save className="w-4 h-4" />}
                    className="flex-1 sm:flex-initial"
                  >
                    Save Consultation Notes
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!diagnosis.trim()) {
                        toast.error('Diagnosis is required to complete consultation.');
                        return;
                      }
                      setConfirmCompleteOpen(true);
                    }}
                    disabled={isSubmittingConsultation}
                    leftIcon={<CircleCheck className="w-4 h-4" />}
                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Complete Consultation
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 3. CONFIRM COMPLETE CONSULTATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {confirmCompleteOpen && consultationAppt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
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
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CircleCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">
                    Complete Consultation?
                  </h3>
                  <p className="text-xs text-muted">
                    This will save all clinical notes, issue digital prescriptions, and transition the appointment to COMPLETED.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-surface-secondary rounded-xl border border-border text-xs space-y-1 mb-4">
                <p className="font-bold text-foreground">Patient: {consultationAppt.patientName}</p>
                <p className="text-muted">Diagnosis: <span className="text-foreground font-semibold">{diagnosis}</span></p>
                <p className="text-muted">Medications: {medicines.filter(m => m.medicineName.trim()).length} prescribed</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmCompleteOpen(false)}
                  disabled={isSubmittingConsultation}
                >
                  Return to Desk
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveConsultation(true)}
                  isLoading={isSubmittingConsultation}
                  loadingText="Completing..."
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirm & Complete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 4. VIEW CONSULTATION DETAILS MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {viewConsultation && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-card rounded-2xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-modal border border-border text-foreground relative max-h-[92vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-bold text-foreground text-xl">
                    Completed Clinical Consultation Record
                  </h3>
                  <p className="text-xs text-muted">
                    Consultation #{viewConsultation.id} • Issued: {formatDate(viewConsultation.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setViewConsultation(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground"
                  aria-label="Close consultation record"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Diagnosis */}
              <div className="p-3.5 bg-primary-soft/50 rounded-xl border border-primary/20">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">
                  Diagnosis
                </span>
                <p className="text-sm font-semibold text-foreground">{viewConsultation.diagnosis}</p>
              </div>

              {/* Clinical Notes */}
              {viewConsultation.notes && (
                <div className="p-3.5 bg-surface-secondary rounded-xl border border-border text-xs">
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider mb-1">
                    Clinical Notes
                  </span>
                  <p className="text-foreground leading-relaxed">{viewConsultation.notes}</p>
                </div>
              )}

              {/* Advice */}
              {viewConsultation.advice && (
                <div className="p-3.5 bg-surface-secondary rounded-xl border border-border text-xs">
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider mb-1">
                    Advice & Regimen
                  </span>
                  <p className="text-foreground leading-relaxed">{viewConsultation.advice}</p>
                </div>
              )}

              {/* Prescriptions */}
              {viewConsultation.prescription && viewConsultation.prescription.items.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                    Prescribed Medications ({viewConsultation.prescription.items.length})
                  </h4>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-secondary text-muted text-[10px] uppercase border-b border-border">
                        <tr>
                          <th scope="col" className="px-3 py-2">Medicine</th>
                          <th scope="col" className="px-3 py-2">Dosage</th>
                          <th scope="col" className="px-3 py-2">Frequency</th>
                          <th scope="col" className="px-3 py-2">Duration</th>
                          <th scope="col" className="px-3 py-2">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {viewConsultation.prescription.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 font-bold text-foreground">{item.medicineName}</td>
                            <td className="px-3 py-2 font-mono text-muted">{item.dosage}</td>
                            <td className="px-3 py-2 text-muted">{item.frequency}</td>
                            <td className="px-3 py-2 text-muted">{item.duration}</td>
                            <td className="px-3 py-2 text-muted italic">{item.instructions || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setViewConsultation(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 5. APPOINTMENT DETAILS MODAL */}
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
              className="bg-card rounded-2xl max-w-md w-full p-6 shadow-modal border border-border text-foreground"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg">Appointment Overview</h3>
                  <p className="text-xs text-muted font-mono">{selectedAppt.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground"
                  aria-label="Close appointment details"
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
                  <span className="text-muted block mb-0.5">Patient Name</span>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
