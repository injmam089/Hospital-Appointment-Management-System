import { apiClient } from './client';
import type { Patient, Gender } from '../types';

export interface UpdatePatientProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export const patientApi = {
  getProfile: async (): Promise<Patient> => {
    const { data } = await apiClient.get<Patient>('/patient/profile');
    return data;
  },

  updateProfile: async (payload: UpdatePatientProfilePayload): Promise<Patient> => {
    const { data } = await apiClient.put<Patient>('/patient/profile', payload);
    return data;
  },
};
