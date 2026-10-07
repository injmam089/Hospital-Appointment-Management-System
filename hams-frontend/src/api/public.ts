import { apiClient } from './client';
import type { Doctor, Department, PageResponse } from '../types';

export interface PublicDoctorSearchParams {
  search?: string;
  departmentId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const publicApi = {
  getDoctors: async (params: PublicDoctorSearchParams = {}): Promise<PageResponse<Doctor>> => {
    const { data } = await apiClient.get<PageResponse<Doctor>>('/public/doctors', { params });
    return data;
  },

  getDoctorById: async (id: number): Promise<Doctor> => {
    const { data } = await apiClient.get<Doctor>(`/public/doctors/${id}`);
    return data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>('/public/departments');
    return data;
  },
};
