import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, ArrowLeft, Search, Phone, X,
  Stethoscope, CheckCircle2, Plus, Trash2, Pill,
  FileText, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '../../api/appointment';
import { consultationApi } from '../../api/consultation';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge, AppointmentStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatTime } from '../../lib/utils';
import type {
  AppointmentResponse,
  ConsultationResponse,
  CreatePrescriptionItemPayload
} from '../../types';

type DoctorTab = 'TODAY' | 'UPCOMING' | 'ALL';

interface MedicineRow extends CreatePrescriptionItemPayload {
  tempId: string;
}

export function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DoctorTab>('TODAY');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Selected appointment details modal
  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);

  // Active consultation clinical desk modal
  const [consultationAppt, setConsultationAppt] = useState<AppointmentResponse | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);

  // View existing consultation modal
  const [viewConsultation, setViewConsultation] = useState<ConsultationResponse | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

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
  const handleCheckIn = async (appt: AppointmentResponse) => {
    try {
      const updated = await consultationApi.doctorCheckIn(appt.id);
      toast.success(`Patient checked in for appointment ${updated.appointmentRef}`);
      updateAppointmentInState(updated);
    } catch (err) {
      toast.error(extractApiError(err));
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
      toast.success(`Appointment ${updated.appointmentRef} marked COMPLETED`);
      updateAppointmentInState(updated);
      setConsultationAppt(null);
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

  // Submit Consultation Form
  const handleSaveConsultation = async (andComplete: boolean = false) => {
    if (!consultationAppt) return;
    if (!diagnosis.trim()) {
      toast.error('Diagnosis is required to record a clinical consultation.');
      return;
    }

    // Filter valid medicines
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
        // Refresh local state to mark consultation created
        const updated = {
          ...consultationAppt,
          hasConsultation: true,
          consultationId: created.id,
        };
        updateAppointmentInState(updated);
        setConsultationAppt(null);
      }
      fetchAppointments();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmittingConsultation(false);
    }
  };

  // Filter based on Tab & Search Query
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      search.trim() === '' ||
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.appointmentRef.toLowerCase().includes(search.toLowerCase()) ||
      (a.reason && a.reason.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedDate) return true;

    if (activeTab === 'TODAY') {
      return a.appointmentDate === todayStr;
    }
    if (activeTab === 'UPCOMING') {
      const isTerminal = ['CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED'].includes(a.status);
      return a.appointmentDate >= todayStr && !isTerminal;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Header */}
      <header className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="page-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-navy text-xl">Appointments & Clinical Desk</h1>
                <Badge variant="blue" dot>Live Doctor Queue</Badge>
              </div>
              <p className="text-xs text-muted">Manage patient arrivals, consultations, and digital prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setSelectedDate(''); fetchAppointments(); }}
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctor/dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="page-container py-8">
        {/* Navigation Tabs and Date Picker */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border">
            {(['TODAY', 'UPCOMING', 'ALL'] as DoctorTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedDate(''); }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab && !selectedDate
                    ? 'bg-white text-navy shadow-sm border border-border/60'
                    : 'text-muted hover:text-navy'
                }`}
              >
                {tab === 'TODAY' && "Today's Queue"}
                {tab === 'UPCOMING' && 'Upcoming Visits'}
                {tab === 'ALL' && 'All Appointments'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, ref, complaint..."
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-medium">Filter Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Appointment Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-5 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-primary-500" />}
            title="No appointments found"
            description="No scheduled consultations match your current filter criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((appt) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 flex flex-col justify-between hover:shadow-card-hover transition-all border border-border hover:border-primary-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-medium text-muted bg-surface px-2 py-0.5 rounded border border-border">
                      {appt.appointmentRef}
                    </span>
                    <AppointmentStatusBadge status={appt.status} />
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                      {appt.patientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-navy text-sm">{appt.patientName}</h4>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {appt.patientPhone || 'No contact'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-surface/80 rounded-xl p-3 border border-border/60 mb-3 space-y-1.5 text-xs text-muted">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium text-navy">
                        <Calendar className="w-3.5 h-3.5 text-primary-500" />
                        {formatDate(appt.appointmentDate)}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-navy">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {formatTime(appt.appointmentTime)}
                      </span>
                    </div>
                    {appt.reason && (
                      <p className="text-navy font-normal line-clamp-2 mt-1">
                        <strong className="text-muted font-medium">Chief Complaint:</strong> {appt.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedAppt(appt)}
                    className="text-xs font-semibold text-muted hover:text-navy underline-offset-2 hover:underline"
                  >
                    Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {appt.status === 'CONFIRMED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCheckIn(appt)}
                        leftIcon={<CheckCircle className="w-3.5 h-3.5 text-medical-green" />}
                      >
                        Check In
                      </Button>
                    )}

                    {appt.status === 'CHECKED_IN' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartConsultation(appt)}
                        leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                      >
                        Start Consult
                      </Button>
                    )}

                    {appt.status === 'IN_CONSULTATION' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openConsultationDesk(appt)}
                        leftIcon={<FileText className="w-3.5 h-3.5" />}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Consult Desk
                      </Button>
                    )}

                    {appt.status === 'COMPLETED' && appt.consultationId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewConsultation(appt.consultationId!)}
                        leftIcon={<FileText className="w-3.5 h-3.5 text-primary-600" />}
                      >
                        View Rx
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL 1: CONSULTATION CLINICAL DESK */}
      <AnimatePresence>
        {consultationAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-modal border border-border my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-navy text-lg">Clinical Desk — {consultationAppt.patientName}</h3>
                    <p className="text-xs text-muted">
                      Ref: {consultationAppt.appointmentRef} • Date: {formatDate(consultationAppt.appointmentDate)} at {formatTime(consultationAppt.appointmentTime)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConsultationAppt(null)}
                  className="p-1.5 rounded-lg hover:bg-surface text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Consultation Fields Form */}
              <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Symptoms / Chief Complaint */}
                <div>
                  <label className="label">Symptoms & Chief Complaint</label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Cough, fever 101F, difficulty breathing for 4 days..."
                    className="input-field"
                  />
                </div>

                {/* Diagnosis (Required) */}
                <div>
                  <label className="label">
                    Diagnosis / Clinical Assessment <span className="text-medical-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Bronchitis, Essential Hypertension..."
                    className="input-field font-semibold text-navy"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Clinical Notes */}
                  <div>
                    <label className="label">Clinical Notes / Examination</label>
                    <textarea
                      rows={2}
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="Examination observations, vitals, auscultation..."
                      className="input-field"
                    />
                  </div>

                  {/* Treatment / Advice */}
                  <div>
                    <label className="label">Treatment & Medical Advice</label>
                    <textarea
                      rows={2}
                      value={treatmentNotes}
                      onChange={(e) => setTreatmentNotes(e.target.value)}
                      placeholder="Lifestyle guidelines, diet restrictions, warm fluids..."
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="label">Recommended Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="input-field max-w-xs"
                  />
                </div>

                {/* Digital Prescription Builder */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-primary-600" />
                      <h4 className="font-display font-semibold text-navy text-sm">Prescription & Medications</h4>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addMedicineRow}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Medicine
                    </Button>
                  </div>

                  {medicines.length === 0 ? (
                    <p className="text-xs text-muted italic bg-surface p-3 rounded-xl border border-border">
                      No medications added yet. Click &ldquo;+ Add Medicine&rdquo; if medication is prescribed.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {medicines.map((med, index) => (
                        <div
                          key={med.tempId}
                          className="p-3 bg-surface border border-border rounded-xl space-y-2 text-xs relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-navy">Item #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeMedicineRow(med.tempId)}
                              className="text-medical-red hover:text-red-700 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div className="md:col-span-2">
                              <label className="text-[11px] text-muted block mb-0.5">Medicine Name *</label>
                              <input
                                type="text"
                                value={med.medicineName}
                                onChange={(e) => updateMedicineField(med.tempId, 'medicineName', e.target.value)}
                                placeholder="e.g. Paracetamol 500mg"
                                className="input-field py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-muted block mb-0.5">Dosage</label>
                              <input
                                type="text"
                                value={med.dosage}
                                onChange={(e) => updateMedicineField(med.tempId, 'dosage', e.target.value)}
                                placeholder="e.g. 500 mg"
                                className="input-field py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-muted block mb-0.5">Frequency</label>
                              <input
                                type="text"
                                value={med.frequency}
                                onChange={(e) => updateMedicineField(med.tempId, 'frequency', e.target.value)}
                                placeholder="e.g. Twice daily"
                                className="input-field py-1.5 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-muted block mb-0.5">Duration</label>
                              <input
                                type="text"
                                value={med.duration}
                                onChange={(e) => updateMedicineField(med.tempId, 'duration', e.target.value)}
                                placeholder="e.g. 5 days"
                                className="input-field py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-muted block mb-0.5">Instructions</label>
                              <input
                                type="text"
                                value={med.instructions || ''}
                                onChange={(e) => updateMedicineField(med.tempId, 'instructions', e.target.value)}
                                placeholder="e.g. After meals"
                                className="input-field py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div>
                        <label className="label">General Prescription Instructions</label>
                        <input
                          type="text"
                          value={generalInstructions}
                          onChange={(e) => setGeneralInstructions(e.target.value)}
                          placeholder="e.g. Drink plenty of water. Avoid cold food items."
                          className="input-field text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConsultationAppt(null)}
                  disabled={isSubmittingConsultation}
                >
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSaveConsultation(false)}
                    isLoading={isSubmittingConsultation}
                  >
                    Save Consultation
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveConsultation(true)}
                    isLoading={isSubmittingConsultation}
                    className="bg-medical-green hover:bg-emerald-700"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Save & Complete Appointment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: VIEW CONSULTATION & PRESCRIPTION DETAILS */}
      <AnimatePresence>
        {viewConsultation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-modal border border-border my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">Consultation & Digital Prescription</h3>
                  <p className="text-xs text-muted">
                    Ref: {viewConsultation.appointmentRef} • Date: {formatDate(viewConsultation.appointmentDate)}
                  </p>
                </div>
                <button
                  onClick={() => setViewConsultation(null)}
                  className="p-1 rounded-lg hover:bg-surface text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <div className="p-3 bg-surface rounded-xl border border-border">
                  <span className="text-muted block mb-0.5 font-semibold">Diagnosis</span>
                  <p className="font-display font-bold text-navy text-sm">{viewConsultation.diagnosis}</p>
                </div>

                {viewConsultation.symptoms && (
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <span className="text-muted block mb-0.5 font-semibold">Reported Symptoms</span>
                    <p className="text-navy">{viewConsultation.symptoms}</p>
                  </div>
                )}

                {viewConsultation.clinicalNotes && (
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <span className="text-muted block mb-0.5 font-semibold">Clinical Examination</span>
                    <p className="text-navy">{viewConsultation.clinicalNotes}</p>
                  </div>
                )}

                {viewConsultation.treatmentNotes && (
                  <div className="p-3 bg-white rounded-xl border border-border">
                    <span className="text-muted block mb-0.5 font-semibold">Medical Advice & Treatment</span>
                    <p className="text-navy">{viewConsultation.treatmentNotes}</p>
                  </div>
                )}

                {viewConsultation.prescription && (
                  <div className="pt-2">
                    <h4 className="font-display font-semibold text-navy text-sm mb-2 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-primary-600" />
                      Prescribed Medications
                    </h4>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface border-b border-border text-muted">
                          <tr>
                            <th className="px-3 py-2">Medicine</th>
                            <th className="px-3 py-2">Dosage</th>
                            <th className="px-3 py-2">Frequency</th>
                            <th className="px-3 py-2">Duration</th>
                            <th className="px-3 py-2">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {viewConsultation.prescription.items.map((it, idx) => (
                            <tr key={idx} className="hover:bg-surface/50">
                              <td className="px-3 py-2 font-semibold text-navy">{it.medicineName}</td>
                              <td className="px-3 py-2 text-muted">{it.dosage}</td>
                              <td className="px-3 py-2 text-muted">{it.frequency}</td>
                              <td className="px-3 py-2 text-muted">{it.duration}</td>
                              <td className="px-3 py-2 text-muted">{it.instructions || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {viewConsultation.followUpDate && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between">
                    <span>Follow-up Recommended:</span>
                    <strong className="font-semibold">{formatDate(viewConsultation.followUpDate)}</strong>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setViewConsultation(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: BASIC APPOINTMENT DETAILS */}
      <AnimatePresence>
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-modal border border-border"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">Appointment Details</h3>
                  <p className="text-xs text-muted">Ref: {selectedAppt.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="p-1 rounded-lg hover:bg-surface text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-surface rounded-xl">
                  <span className="text-muted">Status</span>
                  <AppointmentStatusBadge status={selectedAppt.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Patient Name</span>
                    <span className="font-bold text-navy text-sm block">{selectedAppt.patientName}</span>
                    <span className="text-muted">{selectedAppt.patientPhone || 'No phone recorded'}</span>
                  </div>
                  <div className="p-3 bg-white border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Assigned Specialist</span>
                    <span className="font-bold text-navy text-sm block">Dr. {selectedAppt.doctorName}</span>
                    <span className="text-muted">{selectedAppt.departmentName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Consultation Date</span>
                    <span className="font-semibold text-navy text-sm block">{formatDate(selectedAppt.appointmentDate)}</span>
                  </div>
                  <div className="p-3 bg-white border border-border rounded-xl">
                    <span className="text-muted block mb-0.5">Slot Interval</span>
                    <span className="font-semibold text-navy text-sm block">
                      {formatTime(selectedAppt.appointmentTime)} {selectedAppt.endTime ? `– ${formatTime(selectedAppt.endTime)}` : ''}
                    </span>
                  </div>
                </div>

                {selectedAppt.reason && (
                  <div className="p-3 bg-surface border border-border rounded-xl">
                    <span className="text-muted block mb-0.5 font-semibold">Chief Complaint</span>
                    <p className="text-navy">{selectedAppt.reason}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
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
