import { apiClient } from './client';
import type { Doctor } from '../types';

export interface UpdateDoctorProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  qualification?: string;
  consultationFee?: number;
  photoUrl?: string;
}

export const doctorApi = {
  getProfile: async (): Promise<Doctor> => {
    const { data } = await apiClient.get<Doctor>('/doctor/profile');
    return data;
  },

  updateProfile: async (payload: UpdateDoctorProfilePayload): Promise<Doctor> => {
    const { data } = await apiClient.put<Doctor>('/doctor/profile', payload);
    return data;
  },
};
