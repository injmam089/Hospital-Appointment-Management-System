import { apiClient } from './client';
import type {
  DayAvailability,
  DoctorSchedule,
  DoctorLeave,
  DoctorDaySlots
} from '../types';

export interface CreateLeavePayload {
  startDate: string;
  endDate: string;
  reason?: string;
}

export const scheduleApi = {
  // DOCTOR endpoints
  getOwnSchedule: async (): Promise<DoctorSchedule> => {
    const { data } = await apiClient.get<DoctorSchedule>('/doctor/availability');
    return data;
  },

  updateOwnSchedule: async (schedule: DayAvailability[]): Promise<DoctorSchedule> => {
    const { data } = await apiClient.put<DoctorSchedule>('/doctor/availability', schedule);
    return data;
  },

  getOwnLeaves: async (): Promise<DoctorLeave[]> => {
    const { data } = await apiClient.get<DoctorLeave[]>('/doctor/leaves');
    return data;
  },

  createOwnLeave: async (payload: CreateLeavePayload): Promise<DoctorLeave> => {
    const { data } = await apiClient.post<DoctorLeave>('/doctor/leaves', payload);
    return data;
  },

  cancelOwnLeave: async (leaveId: number): Promise<void> => {
    await apiClient.delete(`/doctor/leaves/${leaveId}`);
  },

  previewOwnSlots: async (date: string): Promise<DoctorDaySlots> => {
    const { data } = await apiClient.get<DoctorDaySlots>('/doctor/slots', {
      params: { date },
    });
    return data;
  },

  // PUBLIC endpoints
  getPublicSlots: async (doctorId: number, date: string): Promise<DoctorDaySlots> => {
    const { data } = await apiClient.get<DoctorDaySlots>(`/public/doctors/${doctorId}/slots`, {
      params: { date },
    });
    return data;
  },

  getPublicSchedule: async (doctorId: number): Promise<DoctorSchedule> => {
    const { data } = await apiClient.get<DoctorSchedule>(`/public/doctors/${doctorId}/availability`);
    return data;
  },

  // ADMIN endpoints
  getDoctorSchedule: async (doctorId: number): Promise<DoctorSchedule> => {
    const { data } = await apiClient.get<DoctorSchedule>(`/admin/doctors/${doctorId}/availability`);
    return data;
  },

  updateDoctorSchedule: async (doctorId: number, schedule: DayAvailability[]): Promise<DoctorSchedule> => {
    const { data } = await apiClient.put<DoctorSchedule>(`/admin/doctors/${doctorId}/availability`, schedule);
    return data;
  },

  getDoctorLeaves: async (doctorId: number): Promise<DoctorLeave[]> => {
    const { data } = await apiClient.get<DoctorLeave[]>(`/admin/doctors/${doctorId}/leaves`);
    return data;
  },

  createDoctorLeave: async (doctorId: number, payload: CreateLeavePayload): Promise<DoctorLeave> => {
    const { data } = await apiClient.post<DoctorLeave>(`/admin/doctors/${doctorId}/leaves`, payload);
    return data;
  },

  cancelDoctorLeave: async (doctorId: number, leaveId: number): Promise<void> => {
    await apiClient.delete(`/admin/doctors/${doctorId}/leaves/${leaveId}`);
  },

  getDoctorSlots: async (doctorId: number, date: string): Promise<DoctorDaySlots> => {
    const { data } = await apiClient.get<DoctorDaySlots>(`/admin/doctors/${doctorId}/slots`, {
      params: { date },
    });
    return data;
  },
};
