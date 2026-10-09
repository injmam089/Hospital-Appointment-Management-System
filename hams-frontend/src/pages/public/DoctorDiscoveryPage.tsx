import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Stethoscope, CheckCircle2,
  X, ChevronRight, Ban, Moon,
  Check, Building2,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDepartmentIcon } from '../../config/iconRegistry';
import { publicApi, type PublicDoctorSearchParams } from '../../api/public';
import { scheduleApi } from '../../api/schedule';
import { appointmentApi } from '../../api/appointment';
import { useAuthStore } from '../../store/authStore';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PatientNavbar } from '../../components/layout/PatientNavbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { extractApiError } from '../../api/client';
import { formatDate, formatTime } from '../../lib/utils';
import { useModalA11y } from '../../lib/useModalA11y';
import type { Doctor, Department, DoctorDaySlots, TimeSlotDto, AppointmentResponse } from '../../types';

export function DoctorDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState<number | undefined>(
    searchParams.get('dept') ? Number(searchParams.get('dept')) : undefined
  );

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const modalRef = useModalA11y({
    isOpen: !!selectedDoctor,
    onClose: () => {
      setSelectedDoctor(null);
      setBookingSuccess(null);
    },
  });

  // Live Slot Preview in Modal
  const [previewDate, setPreviewDate] = useState(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toISOString().split('T')[0];
  });
  const [slotsData, setSlotsData] = useState<DoctorDaySlots | null>(null);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  // Booking Flow States
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);
  const [appointmentReason, setAppointmentReason] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<AppointmentResponse | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [search, selectedDept]);

  useEffect(() => {
    if (selectedDoctor && previewDate) {
      setSelectedSlot(null);
      fetchDoctorSlots(selectedDoctor.id, previewDate);
    } else {
      setSlotsData(null);
    }
  }, [selectedDoctor, previewDate]);

  const fetchDepartments = async () => {
    try {
      const data = await publicApi.getDepartments();
      setDepartments(data);
    } catch {
      // Non-blocking
    }
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const params: PublicDoctorSearchParams = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDept !== undefined) params.departmentId = selectedDept;

      const res = await publicApi.getDoctors(params);
      setDoctors(res.content);
      setTotalElements(res.totalElements);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorSlots = async (doctorId: number, dateStr: string) => {
    setIsSlotsLoading(true);
    try {
      const res = await scheduleApi.getPublicSlots(doctorId, dateStr);
      setSlotsData(res);
    } catch {
      setSlotsData(null);
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const handleSelectDept = (deptId: number | undefined) => {
    setSelectedDept(deptId);
    if (deptId !== undefined) {
      setSearchParams({ dept: String(deptId), ...(search ? { search } : {}) });
    } else {
      setSearchParams(search ? { search } : {});
    }
  };

  const handleOpenDoctorModal = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    setAppointmentReason('');
    setBookingSuccess(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    if (!isAuthenticated) {
      toast.error('Please sign in as a patient to reserve this appointment.');
      navigate('/login');
      return;
    }

    if (user?.role !== 'PATIENT') {
      toast.error('Only patient accounts are authorized to reserve appointment slots.');
      return;
    }

    setIsBooking(true);
    try {
      const payload = {
        doctorId: selectedDoctor.id,
        appointmentDate: previewDate,
        appointmentTime: selectedSlot.startTime,
        reason: appointmentReason.trim() || undefined,
      };

      const result = await appointmentApi.bookAppointment(payload);
      setBookingSuccess(result);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsBooking(false);
    }
  };

  const isPatientLoggedIn = isAuthenticated && user?.role === 'PATIENT';

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      {/* Dynamic Navbar: Patient Navbar if logged in, otherwise Public Navbar */}
      {isPatientLoggedIn ? <PatientNavbar /> : <PublicNavbar />}

      <main className={`page-container pb-20 flex-1 ${isPatientLoggedIn ? 'pt-8' : 'pt-28'}`}>
        {/* Header / Intro */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                Clinical Directory
              </span>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
                Find a Verified Doctor
              </h1>
              <p className="text-sm text-muted mt-1.5 max-w-xl">
                Explore hospital specialists, check verified credentials, and book consultation slots directly.
              </p>
            </div>
            <div className="text-xs text-muted font-medium bg-card px-3.5 py-2 rounded-xl border border-border shadow-subtle self-start md:self-auto flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong className="text-foreground">{totalElements}</strong> Verified Clinicians Available
              </span>
            </div>
          </div>
        </div>

        {/* Search & Department Filter Bar */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-subtle mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by physician name, clinical specialty, or medical expertise..."
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              aria-label="Search doctors by name or specialty"
            />
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-xs">
            <button
              onClick={() => handleSelectDept(undefined)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedDept === undefined
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-secondary/80'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              All Departments
            </button>
            {departments.map((dept) => {
              const DeptIcon = getDepartmentIcon(dept.name);
              const isSelected = selectedDept === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => handleSelectDept(dept.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-subtle'
                      : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-secondary/80'
                  }`}
                >
                  <DeptIcon className="w-3.5 h-3.5" />
                  {dept.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-card rounded-2xl border border-border p-6 shadow-subtle animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-secondary" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-secondary rounded w-3/4" />
                    <div className="h-3 bg-surface-secondary rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-surface-secondary rounded w-full" />
                <div className="h-9 bg-surface-secondary rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-md mx-auto shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground">No Doctors Found</h3>
            <p className="text-xs text-muted mt-1 mb-5">
              No medical professionals matched your search criteria. Try removing filters or searching by a different term.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setSearch(''); setSelectedDept(undefined); }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <motion.div
                key={doc.id}
                className="bg-card rounded-2xl border border-border shadow-subtle hover:shadow-card-hover hover:border-primary/40 transition-all p-6 flex flex-col justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  {/* Doctor Identity Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {doc.firstName.charAt(0)}{doc.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-display font-bold text-lg text-foreground truncate">
                          Dr. {doc.fullName}
                        </h3>
                        {doc.verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-primary truncate mt-0.5">
                        {doc.specialization}
                      </p>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {doc.departmentName || 'Medical Department'}
                      </p>
                    </div>
                  </div>

                  {/* Metadata: Experience & Fee */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2.5 bg-surface-secondary rounded-xl border border-border text-center">
                      <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Experience</span>
                      <span className="text-xs font-bold text-foreground">{doc.experienceYears || '1+'} Years</span>
                    </div>
                    <div className="p-2.5 bg-surface-secondary rounded-xl border border-border text-center">
                      <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Consultation Fee</span>
                      <span className="text-xs font-bold text-foreground">
                        {doc.consultationFee ? `₹${doc.consultationFee}` : 'Hospital Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor bio/qualification */}
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-5">
                    {doc.bio || `${doc.qualification || 'Certified practitioner'} providing expert clinical care in ${doc.departmentName || 'general medicine'}.`}
                  </p>
                </div>

                {/* Primary Booking CTA */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="w-full text-xs font-semibold justify-between"
                    onClick={() => handleOpenDoctorModal(doc)}
                  >
                    <span>Book Appointment</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 5-STEP CLINICAL BOOKING MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedDoctor && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              className="bg-card rounded-2xl max-w-lg w-full my-8 p-6 sm:p-7 shadow-modal border border-border relative max-h-[92vh] overflow-y-auto text-foreground focus:outline-none"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-5 right-5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
                aria-label="Close booking modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* BOOKING SUCCESS SCREEN */}
              {bookingSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-subtle">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-xl">Appointment Confirmed</h3>
                    <p className="text-xs text-muted mt-1">
                      Your consultation slot has been successfully scheduled and confirmed.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-secondary rounded-2xl border border-border text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Appointment Reference:</span>
                      <span className="font-mono font-bold text-primary">{bookingSuccess.appointmentRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Doctor:</span>
                      <span className="font-semibold text-foreground">Dr. {bookingSuccess.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Department:</span>
                      <span className="font-semibold text-foreground">{bookingSuccess.departmentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Date:</span>
                      <span className="font-semibold text-foreground">{formatDate(bookingSuccess.appointmentDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Time:</span>
                      <span className="font-semibold text-foreground">
                        {formatTime(bookingSuccess.appointmentTime)}
                        {bookingSuccess.endTime ? ` – ${formatTime(bookingSuccess.endTime)}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <span className="badge badge-blue">{bookingSuccess.status}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => {
                        setSelectedDoctor(null);
                        navigate('/patient/appointments');
                      }}
                    >
                      View My Appointments
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedDoctor(null);
                        setBookingSuccess(null);
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* STEP 1: DOCTOR SUMMARY */}
                  <div className="flex items-start gap-3.5 pb-4 border-b border-border">
                    <div className="w-13 h-13 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {selectedDoctor.firstName.charAt(0)}{selectedDoctor.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-display font-bold text-lg text-foreground">
                          Dr. {selectedDoctor.fullName}
                        </h3>
                        {selectedDoctor.verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        {selectedDoctor.specialization}
                      </p>
                      <p className="text-xs text-muted">
                        {selectedDoctor.departmentName || 'Medical Department'} • {selectedDoctor.experienceYears || '1+'} Yrs Exp
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Fee</span>
                      <span className="text-sm font-bold text-foreground">
                        {selectedDoctor.consultationFee ? `₹${selectedDoctor.consultationFee}` : 'Hospital Standard'}
                      </span>
                    </div>
                  </div>

                  {/* STEP 2: SELECT DATE */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Select Consultation Date
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={previewDate}
                      onChange={(e) => setPreviewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* STEP 3: AVAILABLE TIME SLOTS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Available Time Slots
                      </label>
                      {selectedSlot && (
                        <span className="text-xs font-semibold text-primary">
                          Selected: {selectedSlot.formattedTime}
                        </span>
                      )}
                    </div>

                    {isSlotsLoading ? (
                      <div className="py-6 text-center text-xs text-muted">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                        Checking real-time doctor availability...
                      </div>
                    ) : !slotsData ? (
                      <p className="text-xs text-muted py-2">Select a date to check available slots.</p>
                    ) : slotsData.onLeave ? (
                      <div className="p-3 bg-danger-soft border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
                        <Ban className="w-4 h-4 flex-shrink-0" />
                        <span>Doctor is on leave on this date ({slotsData.leaveReason || 'Absence'}).</span>
                      </div>
                    ) : !slotsData.workingDay ? (
                      <div className="p-3 bg-surface-secondary border border-border rounded-xl text-xs text-muted flex items-center gap-2">
                        <Moon className="w-4 h-4 flex-shrink-0" />
                        <span>Doctor does not hold clinic hours on {slotsData.dayOfWeek}s.</span>
                      </div>
                    ) : slotsData.slots.length === 0 ? (
                      <p className="text-xs text-muted py-2">No open consultation slots on this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                        {slotsData.slots.map((slot: TimeSlotDto, idx: number) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                                !slot.available
                                  ? 'bg-surface-secondary text-muted/60 border-border cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-primary text-white border-primary shadow-subtle'
                                  : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary-soft/30'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                {slot.formattedTime}
                              </span>
                              {!slot.available && (
                                <span className="text-[9px] no-underline font-normal text-muted/60">
                                  Booked
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* STEP 4: REVIEW APPOINTMENT */}
                  {selectedSlot && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-surface-secondary border border-border rounded-xl space-y-2 text-xs"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block">
                        Appointment Review
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted block">Doctor</span>
                          <span className="font-semibold text-foreground">Dr. {selectedDoctor.fullName}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Specialty</span>
                          <span className="font-semibold text-foreground">{selectedDoctor.specialization}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Date</span>
                          <span className="font-semibold text-foreground">{formatDate(previewDate)}</span>
                        </div>
                        <div>
                          <span className="text-muted block">Time Slot</span>
                          <span className="font-semibold text-primary">{selectedSlot.formattedTime}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5: REASON & CONFIRM BOOKING */}
                  {selectedSlot && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                          Reason for Visit / Symptoms (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={appointmentReason}
                          onChange={(e) => setAppointmentReason(e.target.value)}
                          placeholder="Describe symptoms or reasons for this appointment..."
                          className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="pt-2 border-t border-border flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedDoctor(null)}
                          disabled={isBooking}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleConfirmBooking}
                          isLoading={isBooking}
                          loadingText="Reserving slot..."
                        >
                          Confirm & Book Appointment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isPatientLoggedIn && <Footer />}
    </div>
  );
}
