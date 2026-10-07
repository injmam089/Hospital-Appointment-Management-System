import { apiClient } from './client';
import type {
  AppointmentResponse,
  ConsultationResponse,
  PrescriptionResponse,
  CreateConsultationPayload,
  CreatePrescriptionPayload,
} from '../types';

export const consultationApi = {
  // ============================================================
  // DOCTOR WORKFLOW & STATUS TRANSITIONS
  // ============================================================

  doctorCheckIn: async (appointmentId: number): Promise<AppointmentResponse> => {
    const { data } = await apiClient.post<AppointmentResponse>(
      `/doctor/appointments/${appointmentId}/check-in`
    );
    return data;
  },

  doctorStartConsultation: async (appointmentId: number): Promise<AppointmentResponse> => {
    const { data } = await apiClient.post<AppointmentResponse>(
      `/doctor/appointments/${appointmentId}/start-consultation`
    );
    return data;
  },

  doctorCompleteAppointment: async (appointmentId: number): Promise<AppointmentResponse> => {
    const { data } = await apiClient.post<AppointmentResponse>(
      `/doctor/appointments/${appointmentId}/complete`
    );
    return data;
  },

  // ============================================================
  // DOCTOR CONSULTATION & PRESCRIPTION
  // ============================================================

  doctorCreateConsultation: async (
    appointmentId: number,
    payload: CreateConsultationPayload
  ): Promise<ConsultationResponse> => {
    const { data } = await apiClient.post<ConsultationResponse>(
      `/doctor/appointments/${appointmentId}/consultation`,
      payload
    );
    return data;
  },

  doctorGetConsultations: async (): Promise<ConsultationResponse[]> => {
    const { data } = await apiClient.get<ConsultationResponse[]>('/doctor/consultations');
    return data;
  },

  doctorGetConsultationById: async (id: number): Promise<ConsultationResponse> => {
    const { data } = await apiClient.get<ConsultationResponse>(`/doctor/consultations/${id}`);
    return data;
  },

  doctorCreatePrescription: async (
    consultationId: number,
    payload: CreatePrescriptionPayload
  ): Promise<PrescriptionResponse> => {
    const { data } = await apiClient.post<PrescriptionResponse>(
      `/doctor/consultations/${consultationId}/prescription`,
      payload
    );
    return data;
  },

  doctorGetPrescription: async (consultationId: number): Promise<PrescriptionResponse> => {
    const { data } = await apiClient.get<PrescriptionResponse>(
      `/doctor/consultations/${consultationId}/prescription`
    );
    return data;
  },

  // ============================================================
  // PATIENT PRESCRIPTION VIEWING
  // ============================================================

  patientGetPrescriptions: async (): Promise<PrescriptionResponse[]> => {
    const { data } = await apiClient.get<PrescriptionResponse[]>('/patient/prescriptions');
    return data;
  },

  patientGetPrescriptionById: async (id: number): Promise<PrescriptionResponse> => {
    const { data } = await apiClient.get<PrescriptionResponse>(`/patient/prescriptions/${id}`);
    return data;
  },

  patientGetAppointmentConsultation: async (appointmentId: number): Promise<ConsultationResponse> => {
    const { data } = await apiClient.get<ConsultationResponse>(
      `/patient/appointments/${appointmentId}/consultation`
    );
    return data;
  },
};
