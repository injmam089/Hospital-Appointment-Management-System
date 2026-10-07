import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoadingPage } from '../components/ui/LoadingPage';
import type { Role } from '../types';

// Lazy-loaded pages
const LandingPage             = lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const DoctorDiscoveryPage     = lazy(() => import('../pages/public/DoctorDiscoveryPage').then(m => ({ default: m.DoctorDiscoveryPage })));
const LoginPage               = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage            = lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const PatientDashboard        = lazy(() => import('../pages/patient/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const PatientAppointmentsPage  = lazy(() => import('../pages/patient/PatientAppointmentsPage').then(m => ({ default: m.PatientAppointmentsPage })));
const PatientPrescriptionsPage = lazy(() => import('../pages/patient/PatientPrescriptionsPage').then(m => ({ default: m.PatientPrescriptionsPage })));
const PatientProfilePage      = lazy(() => import('../pages/patient/PatientProfilePage').then(m => ({ default: m.PatientProfilePage })));
const DoctorDashboard         = lazy(() => import('../pages/doctor/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const DoctorAppointmentsPage  = lazy(() => import('../pages/doctor/DoctorAppointmentsPage').then(m => ({ default: m.DoctorAppointmentsPage })));
const DoctorProfilePage       = lazy(() => import('../pages/doctor/DoctorProfilePage').then(m => ({ default: m.DoctorProfilePage })));
const DoctorSchedulePage      = lazy(() => import('../pages/doctor/DoctorSchedulePage').then(m => ({ default: m.DoctorSchedulePage })));
const AdminDashboard          = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminDoctorManagement   = lazy(() => import('../pages/admin/AdminDoctorManagementPage').then(m => ({ default: m.AdminDoctorManagementPage })));
const AdminDepartmentManagement = lazy(() => import('../pages/admin/AdminDepartmentManagementPage').then(m => ({ default: m.AdminDepartmentManagementPage })));
const AdminUsersPage          = lazy(() => import('../pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminAppointmentsPage   = lazy(() => import('../pages/admin/AdminAppointmentsPage').then(m => ({ default: m.AdminAppointmentsPage })));
const AdminReportsPage        = lazy(() => import('../pages/admin/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminAuditLogsPage      = lazy(() => import('../pages/admin/AdminAuditLogsPage').then(m => ({ default: m.AdminAuditLogsPage })));
const NotificationCenterPage  = lazy(() => import('../pages/notifications/NotificationCenterPage').then(m => ({ default: m.NotificationCenterPage })));

// Route Guards
function RequireAuth({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'DOCTOR')  return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'ADMIN')   return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

function GuestOnly() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Outlet />;
  if (user?.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (user?.role === 'DOCTOR')  return <Navigate to="/doctor/dashboard" replace />;
  if (user?.role === 'ADMIN')   return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingPage />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <SuspenseWrapper><LandingPage /></SuspenseWrapper>,
  },
  {
    path: '/doctors',
    element: <SuspenseWrapper><DoctorDiscoveryPage /></SuspenseWrapper>,
  },
  // Auth-only for guests
  {
    element: <GuestOnly />,
    children: [
      { path: '/login',    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: '/register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
    ],
  },
  // Authenticated common routes (all roles)
  {
    element: <RequireAuth />,
    children: [
      { path: '/notifications', element: <SuspenseWrapper><NotificationCenterPage /></SuspenseWrapper> },
    ],
  },
  // Patient routes
  {
    element: <RequireAuth allowedRoles={['PATIENT']} />,
    children: [
      { path: '/patient/dashboard',     element: <SuspenseWrapper><PatientDashboard /></SuspenseWrapper> },
      { path: '/patient/appointments',  element: <SuspenseWrapper><PatientAppointmentsPage /></SuspenseWrapper> },
      { path: '/patient/prescriptions', element: <SuspenseWrapper><PatientPrescriptionsPage /></SuspenseWrapper> },
      { path: '/patient/profile',       element: <SuspenseWrapper><PatientProfilePage /></SuspenseWrapper> },
    ],
  },
  // Doctor routes
  {
    element: <RequireAuth allowedRoles={['DOCTOR']} />,
    children: [
      { path: '/doctor/dashboard',    element: <SuspenseWrapper><DoctorDashboard /></SuspenseWrapper> },
      { path: '/doctor/appointments', element: <SuspenseWrapper><DoctorAppointmentsPage /></SuspenseWrapper> },
      { path: '/doctor/profile',      element: <SuspenseWrapper><DoctorProfilePage /></SuspenseWrapper> },
      { path: '/doctor/schedule',     element: <SuspenseWrapper><DoctorSchedulePage /></SuspenseWrapper> },
    ],
  },
  // Admin routes
  {
    element: <RequireAuth allowedRoles={['ADMIN']} />,
    children: [
      { path: '/admin/dashboard',    element: <SuspenseWrapper><AdminDashboard /></SuspenseWrapper> },
      { path: '/admin/doctors',      element: <SuspenseWrapper><AdminDoctorManagement /></SuspenseWrapper> },
      { path: '/admin/departments',  element: <SuspenseWrapper><AdminDepartmentManagement /></SuspenseWrapper> },
      { path: '/admin/users',        element: <SuspenseWrapper><AdminUsersPage /></SuspenseWrapper> },
      { path: '/admin/appointments', element: <SuspenseWrapper><AdminAppointmentsPage /></SuspenseWrapper> },
      { path: '/admin/reports',      element: <SuspenseWrapper><AdminReportsPage /></SuspenseWrapper> },
      { path: '/admin/audit-logs',   element: <SuspenseWrapper><AdminAuditLogsPage /></SuspenseWrapper> },
    ],
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
