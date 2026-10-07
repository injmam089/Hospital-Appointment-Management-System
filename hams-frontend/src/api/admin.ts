import { apiClient } from './client';
import type {
  Doctor,
  Department,
  PageResponse,
  VerificationStatus,
  Role,
  AppointmentStatus,
  AdminDashboardStats,
  AdminUserItem,
  AdminAppointmentItem,
  AdminReportSummary,
  AuditLogItem,
} from '../types';

export interface DoctorSearchParams {
  search?: string;
  departmentId?: number;
  verificationStatus?: VerificationStatus;
  active?: boolean;
  page?: number;
  size?: number;
}

export interface CreateDoctorPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId: number;
  specialization: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  bio?: string;
  phone?: string;
  registrationNumber?: string;
  verified?: boolean;
}

export interface AdminUpdateDoctorPayload {
  firstName: string;
  lastName: string;
  departmentId?: number;
  specialization: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  bio?: string;
  phone?: string;
  registrationNumber?: string;
  active?: boolean;
  verificationStatus?: VerificationStatus;
}

export interface DepartmentPayload {
  name: string;
  description?: string;
  icon?: string;
}

export interface UserSearchParams {
  search?: string;
  role?: Role;
  active?: boolean;
  page?: number;
  size?: number;
}

export interface AppointmentSearchParams {
  ref?: string;
  patientSearch?: string;
  doctorSearch?: string;
  departmentId?: number;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  doctorId?: number;
  status?: AppointmentStatus;
}

export interface AuditLogSearchParams {
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export const adminApi = {
  // Dashboard
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const { data } = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats');
    return data;
  },

  // User Management
  getUsers: async (params: UserSearchParams = {}): Promise<PageResponse<AdminUserItem>> => {
    const { data } = await apiClient.get<PageResponse<AdminUserItem>>('/admin/users', { params });
    return data;
  },

  getUserById: async (id: number): Promise<AdminUserItem> => {
    const { data } = await apiClient.get<AdminUserItem>(`/admin/users/${id}`);
    return data;
  },

  updateUserStatus: async (id: number, active: boolean): Promise<AdminUserItem> => {
    const { data } = await apiClient.patch<AdminUserItem>(`/admin/users/${id}/status`, { active });
    return data;
  },

  // Appointment Management
  getAppointments: async (params: AppointmentSearchParams = {}): Promise<PageResponse<AdminAppointmentItem>> => {
    const { data } = await apiClient.get<PageResponse<AdminAppointmentItem>>('/admin/appointments', { params });
    return data;
  },

  getAppointmentById: async (id: number): Promise<AdminAppointmentItem> => {
    const { data } = await apiClient.get<AdminAppointmentItem>(`/admin/appointments/${id}`);
    return data;
  },

  // Reports
  getReportsSummary: async (params: ReportFilterParams = {}): Promise<AdminReportSummary> => {
    const { data } = await apiClient.get<AdminReportSummary>('/admin/reports/summary', { params });
    return data;
  },

  // Audit Logs
  getAuditLogs: async (params: AuditLogSearchParams = {}): Promise<PageResponse<AuditLogItem>> => {
    const { data } = await apiClient.get<PageResponse<AuditLogItem>>('/admin/audit-logs', { params });
    return data;
  },

  // Doctor Management (Preserved)
  getDoctors: async (params: DoctorSearchParams = {}): Promise<PageResponse<Doctor>> => {
    const { data } = await apiClient.get<PageResponse<Doctor>>('/admin/doctors', { params });
    return data;
  },

  getDoctorById: async (id: number): Promise<Doctor> => {
    const { data } = await apiClient.get<Doctor>(`/admin/doctors/${id}`);
    return data;
  },

  createDoctor: async (payload: CreateDoctorPayload): Promise<Doctor> => {
    const { data } = await apiClient.post<Doctor>('/admin/doctors', payload);
    return data;
  },

  updateDoctor: async (id: number, payload: AdminUpdateDoctorPayload): Promise<Doctor> => {
    const { data } = await apiClient.put<Doctor>(`/admin/doctors/${id}`, payload);
    return data;
  },

  verifyDoctor: async (id: number): Promise<Doctor> => {
    const { data } = await apiClient.patch<Doctor>(`/admin/doctors/${id}/verify`);
    return data;
  },

  rejectDoctor: async (id: number): Promise<Doctor> => {
    const { data } = await apiClient.patch<Doctor>(`/admin/doctors/${id}/reject`);
    return data;
  },

  deactivateDoctor: async (id: number): Promise<Doctor> => {
    const { data } = await apiClient.patch<Doctor>(`/admin/doctors/${id}/deactivate`);
    return data;
  },

  activateDoctor: async (id: number): Promise<Doctor> => {
    const { data } = await apiClient.patch<Doctor>(`/admin/doctors/${id}/activate`);
    return data;
  },

  // Department Management (Preserved)
  getDepartments: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>('/admin/departments');
    return data;
  },

  createDepartment: async (payload: DepartmentPayload): Promise<Department> => {
    const { data } = await apiClient.post<Department>('/admin/departments', payload);
    return data;
  },

  updateDepartment: async (id: number, payload: DepartmentPayload): Promise<Department> => {
    const { data } = await apiClient.put<Department>(`/admin/departments/${id}`, payload);
    return data;
  },

  toggleDepartmentStatus: async (id: number, active?: boolean): Promise<Department> => {
    const params = active !== undefined ? { active } : {};
    const { data } = await apiClient.patch<Department>(`/admin/departments/${id}/status`, null, { params });
    return data;
  },
};
