// ============================================================
// HAMS Type Definitions - Phase 3 Complete
// ============================================================

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type VerificationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: number;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  doctorCount?: number;
}

export interface Doctor {
  id: number;
  userId?: number;
  email?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  departmentId?: number;
  departmentName?: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  bio: string;
  photoUrl: string | null;
  phone?: string;
  registrationNumber?: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Patient {
  id: number;
  userId?: number;
  email?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  phone: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface BreakInterval {
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  id?: number;
  dayOfWeek: DayOfWeek;
  startTime: string | null;
  endTime: string | null;
  slotDurationMins: number;
  active: boolean;
  breaks: BreakInterval[];
}

export interface DoctorSchedule {
  doctorId: number;
  doctorName: string;
  schedule: DayAvailability[];
}

export interface DoctorLeave {
  id: number;
  doctorId: number;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt?: string;
}

export interface TimeSlotDto {
  startTime: string;
  endTime: string;
  formattedTime: string;
  available: boolean;
}

export interface DoctorDaySlots {
  doctorId: number;
  doctorName: string;
  date: string;
  dayOfWeek: DayOfWeek;
  onLeave: boolean;
  leaveReason?: string | null;
  workingDay: boolean;
  slots: TimeSlotDto[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  id: number;
  appointmentRef: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  reason: string;
  cancellationReason?: string;
  doctor: Doctor;
  patient: Patient;
  createdAt: string;
}

export interface PrescriptionItem {
  id: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: number;
  items: PrescriptionItem[];
  createdAt: string;
}

export interface Consultation {
  id: number;
  diagnosis: string;
  notes: string;
  advice: string;
  followUpDate: string | null;
  prescription: Prescription | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  title: string;
  detail: string;
  status: number;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface AppointmentResponse {
  id: number;
  appointmentRef: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  departmentName: string;
  patientId: number;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime?: string;
  status: AppointmentStatus;
  reason?: string;
  cancellationReason?: string;
  hasConsultation?: boolean;
  consultationId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BookAppointmentRequest {
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}

export interface RescheduleAppointmentRequest {
  newDate: string;
  newTime: string;
  reason?: string;
}

export interface CancelAppointmentRequest {
  cancellationReason?: string;
}

export interface PrescriptionItemDto {
  id?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionResponse {
  id: number;
  consultationId: number;
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  departmentName: string;
  patientId: number;
  patientName: string;
  prescriptionDate: string;
  generalInstructions?: string;
  diagnosis?: string;
  advice?: string;
  items: PrescriptionItemDto[];
  createdAt: string;
}

export interface ConsultationResponse {
  id: number;
  appointmentId: number;
  appointmentRef: string;
  appointmentDate: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string;
  patientId: number;
  patientName: string;
  symptoms?: string;
  diagnosis: string;
  clinicalNotes?: string;
  treatmentNotes?: string;
  notes?: string;
  advice?: string;
  followUpDate?: string;
  prescription?: PrescriptionResponse | null;
  createdAt: string;
}

export interface CreatePrescriptionItemPayload {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface CreatePrescriptionPayload {
  generalInstructions?: string;
  items: CreatePrescriptionItemPayload[];
}

export interface CreateConsultationPayload {
  symptoms?: string;
  diagnosis: string;
  clinicalNotes?: string;
  treatmentNotes?: string;
  followUpDate?: string;
  generalInstructions?: string;
  medicines?: CreatePrescriptionItemPayload[];
}

// ============================================================
// PHASE 7: ADMIN, NOTIFICATIONS, REPORTS, AUDIT TYPES
// ============================================================

export type NotificationType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_CHECKED_IN'
  | 'CONSULTATION_COMPLETED'
  | 'PRESCRIPTION_READY'
  | 'GENERAL';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
  activeDoctors: number;
  totalDepartments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingDoctorVerifications: number;
  statusDistribution: Record<string, number>;
  appointmentsOverTime: Array<{ date: string; count: number }>;
  departmentActivity: Array<{
    departmentId: number;
    departmentName: string;
    doctorCount: number;
    appointmentCount: number;
  }>;
  doctorActivity: Array<{
    doctorId: number;
    doctorName: string;
    departmentName: string;
    appointmentCount: number;
    completedCount: number;
    cancelledCount: number;
  }>;
}

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminAppointmentItem {
  id: number;
  appointmentRef: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime?: string;
  status: AppointmentStatus;
  reason?: string;
  cancellationReason?: string;
  patientId: number;
  patientName: string;
  patientPhone?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  departmentName?: string;
  createdAt: string;
}

export interface DepartmentReportItem {
  departmentId: number;
  departmentName: string;
  doctorCount: number;
  appointmentCount: number;
}

export interface DoctorReportItem {
  doctorId: number;
  doctorName: string;
  departmentName: string;
  appointmentCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface AdminReportSummary {
  totalAppointments: number;
  statusCounts: Record<string, number>;
  departmentStats: DepartmentReportItem[];
  doctorStats: DoctorReportItem[];
}

export interface AuditLogItem {
  id: number;
  userId?: number;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: number;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}


