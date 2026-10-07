import { apiClient } from './client';
import type {
  AppointmentResponse,
  BookAppointmentRequest,
  RescheduleAppointmentRequest,
  CancelAppointmentRequest,
  AppointmentStatus,
} from '../types';

export const appointmentApi = {
  // ============================================================
  // PATIENT ENDPOINTS
  // ============================================================

  bookAppointment: async (data: BookAppointmentRequest): Promise<AppointmentResponse> => {
    const res = await apiClient.post<AppointmentResponse>('/patient/appointments', data);
    return res.data;
  },

  getPatientAppointments: async (status?: AppointmentStatus): Promise<AppointmentResponse[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<AppointmentResponse[]>('/patient/appointments', { params });
    return res.data;
  },

  getPatientUpcomingAppointment: async (): Promise<AppointmentResponse | null> => {
    const res = await apiClient.get<AppointmentResponse | null>('/patient/appointments/upcoming');
    return res.data;
  },

  getPatientAppointmentById: async (id: number): Promise<AppointmentResponse> => {
    const res = await apiClient.get<AppointmentResponse>(`/patient/appointments/${id}`);
    return res.data;
  },

  cancelAppointment: async (id: number, data?: CancelAppointmentRequest): Promise<AppointmentResponse> => {
    const res = await apiClient.patch<AppointmentResponse>(`/patient/appointments/${id}/cancel`, data || {});
    return res.data;
  },

  rescheduleAppointment: async (id: number, data: RescheduleAppointmentRequest): Promise<AppointmentResponse> => {
    const res = await apiClient.patch<AppointmentResponse>(`/patient/appointments/${id}/reschedule`, data);
    return res.data;
  },

  // ============================================================
  // DOCTOR ENDPOINTS
  // ============================================================

  getDoctorAppointments: async (params?: { date?: string; status?: AppointmentStatus }): Promise<AppointmentResponse[]> => {
    const res = await apiClient.get<AppointmentResponse[]>('/doctor/appointments', { params });
    return res.data;
  },

  getDoctorTodayAppointments: async (): Promise<AppointmentResponse[]> => {
    const res = await apiClient.get<AppointmentResponse[]>('/doctor/appointments/today');
    return res.data;
  },

  getDoctorAppointmentById: async (id: number): Promise<AppointmentResponse> => {
    const res = await apiClient.get<AppointmentResponse>(`/doctor/appointments/${id}`);
    return res.data;
  },
};
