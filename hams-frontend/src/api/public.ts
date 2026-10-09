import { apiClient } from './client';
import type { Doctor, Department, PageResponse } from '../types';

export interface PublicDoctorSearchParams {
  search?: string;
  departmentId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// In-memory cache for static hospital departments
let departmentsCache: Department[] | null = null;
let departmentsPromise: Promise<Department[]> | null = null;

export const publicApi = {
  getDoctors: async (params: PublicDoctorSearchParams = {}): Promise<PageResponse<Doctor>> => {
    const { data } = await apiClient.get<PageResponse<Doctor>>('/public/doctors', { params });
    return data;
  },

  getDoctorById: async (id: number): Promise<Doctor> => {
    const { data } = await apiClient.get<Doctor>(`/public/doctors/${id}`);
    return data;
  },

  getDepartments: async (forceRefresh = false): Promise<Department[]> => {
    if (!forceRefresh && departmentsCache) {
      return departmentsCache;
    }
    if (!forceRefresh && departmentsPromise) {
      return departmentsPromise;
    }
    departmentsPromise = (async () => {
      try {
        const { data } = await apiClient.get<Department[]>('/public/departments');
        departmentsCache = data;
        return data;
      } finally {
        departmentsPromise = null;
      }
    })();
    return departmentsPromise;
  },

  invalidateDepartmentsCache: () => {
    departmentsCache = null;
    departmentsPromise = null;
  },
};
