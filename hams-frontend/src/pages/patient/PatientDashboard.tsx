import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, FileText, LogOut, User, Shield,
  ArrowRight, UserCircle, Stethoscope, ChevronRight,
  X, Pill
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { appointmentApi } from '../../api/appointment';
import { StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, AppointmentStatusBadge } from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../lib/utils';
import type { AppointmentResponse } from '../../types';
import { NotificationBell } from '../../components/notifications/NotificationBell';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [upcomingAppt, setUpcomingAppt] = useState<AppointmentResponse | null>(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState<AppointmentResponse | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [upcoming, all] = await Promise.all([
        appointmentApi.getPatientUpcomingAppointment(),
        appointmentApi.getPatientAppointments(),
      ]);
      setUpcomingAppt(upcoming);
      setTotalAppointments(all.length);
      setCompletedCount(all.filter((a) => a.status === 'COMPLETED').length);
    } catch {
      // Graceful fallback on dashboard mount
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login', { replace: true });
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Patient';

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-[#0F172A] text-base sm:text-lg">
                {displayName}
              </h1>
              <Badge variant="blue" dot>Patient Portal</Badge>
            </div>
            <p className="text-xs text-[#64748B]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/patient/appointments')}
            leftIcon={<Calendar className="w-4 h-4 text-[#2563EB]" />}
            className="hidden sm:inline-flex"
          >
            My Appointments
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/patient/prescriptions')}
            leftIcon={<Pill className="w-4 h-4 text-emerald-600" />}
            className="hidden md:inline-flex"
          >
            Prescriptions
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/patient/profile')}
            leftIcon={<UserCircle className="w-4 h-4 text-[#64748B]" />}
            className="hidden lg:inline-flex"
          >
            Profile
          </Button>
          <Button variant="ghost" onClick={handleLogout} size="sm" leftIcon={<LogOut className="w-4 h-4" />}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="page-container py-8 space-y-8">
        {/* Verification Status Pill */}
        <div className="p-3.5 sm:p-4 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Protected Clinical Account</p>
              <p className="text-xs text-[#64748B]">
                Authenticated patient credentials active. Real-time appointment reservation enabled.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[#0F172A]">
              Patient ID: #{user?.id || 1}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctors')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Book New Visit
            </Button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PRIORITY 1: NEXT UPCOMING APPOINTMENT (HIGHEST HIERARCHY) */}
        {/* ============================================================ */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2563EB]" />
              <h2 className="font-display font-bold text-[#0F172A] text-lg">Next Upcoming Appointment</h2>
            </div>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
            >
              View All ({totalAppointments}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#64748B] animate-pulse">
              Loading scheduled appointments...
            </div>
          ) : upcomingAppt ? (
            <div className="p-5 bg-gradient-to-r from-blue-50/50 via-white to-white rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-13 h-13 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-lg flex-shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-[#0F172A] text-base sm:text-lg">
                      Dr. {upcomingAppt.doctorName}
                    </h3>
                    <AppointmentStatusBadge status={upcomingAppt.status} />
                    <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-[#E2E8F0] text-[#2563EB] font-semibold">
                      {upcomingAppt.appointmentRef}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 font-medium">
                    {upcomingAppt.doctorSpecialization} • <span className="text-[#0F172A]">{upcomingAppt.departmentName}</span>
                  </p>
                  {upcomingAppt.reason && (
                    <p className="text-xs text-[#475569] mt-2 bg-white/90 px-3 py-1.5 rounded-lg border border-[#E2E8F0] inline-block">
                      <span className="font-semibold text-[#64748B]">Consultation Note: </span>
                      {upcomingAppt.reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:border-l md:border-blue-100 md:pl-6 justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1.5 text-sm font-bold text-[#0F172A]">
                    <Calendar className="w-4 h-4 text-[#2563EB]" />
                    <span>{formatDate(upcomingAppt.appointmentDate, 'EEE, MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1.5 text-xs text-[#64748B] mt-1">
                    <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{formatTime(upcomingAppt.appointmentTime)} {upcomingAppt.endTime ? `– ${formatTime(upcomingAppt.endTime)}` : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedDetails(upcomingAppt)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* COMPACT PREMIUM EMPTY STATE PER REQUIREMENTS */
            <div className="py-8 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[#0F172A] text-base">No upcoming appointments</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Find a doctor and book your next consultation.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/doctors')}
                  leftIcon={<Stethoscope className="w-4 h-4" />}
                >
                  Book an Appointment
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ============================================================ */}
        {/* PRIORITY 2: FOUR CLEAN STATS CARDS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active / Upcoming"
            value={upcomingAppt ? '1' : '0'}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title="Total Booked"
            value={totalAppointments}
            icon={<Clock className="w-5 h-5" />}
            color="green"
            delay={0.05}
          />
          <StatCard
            title="Completed Visits"
            value={completedCount}
            icon={<FileText className="w-5 h-5" />}
            color="amber"
            delay={0.1}
          />
          <StatCard
            title="Account Status"
            value="Active"
            icon={<Shield className="w-5 h-5" />}
            color="green"
            delay={0.15}
          />
        </div>

        {/* ============================================================ */}
        {/* PRIORITY 3: HEALTHCARE SHORTCUTS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-[#0F172A] text-base">Find a Doctor</h3>
              <p className="text-xs text-[#64748B]">Browse hospital specialties, clinician credentials, and real-time slots.</p>
            </div>
            <div className="pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate('/doctors')}
              >
                <span>Browse Clinicians</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-[#0F172A] text-base">Digital Prescriptions</h3>
              <p className="text-xs text-[#64748B]">Review doctor advice, prescribed medications, dosages, and instructions.</p>
            </div>
            <div className="pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate('/patient/prescriptions')}
              >
                <span>View Prescriptions</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center mb-3">
                <UserCircle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-[#0F172A] text-base">Health Profile</h3>
              <p className="text-xs text-[#64748B]">Maintain contact info, emergency contacts, blood group, and address.</p>
            </div>
            <div className="pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate('/patient/profile')}
              >
                <span>Update Profile</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-[#E2E8F0]"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-[#0F172A] text-lg">Appointment Details</h3>
                  <p className="text-xs text-[#64748B] font-mono">{selectedDetails.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedDetails(null)}
                  className="p-1 rounded-lg hover:bg-[#F7F9FC] text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Status</span>
                  <AppointmentStatusBadge status={selectedDetails.status} />
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                  <span className="text-[#64748B] block mb-0.5">Consulting Doctor</span>
                  <span className="font-bold text-[#0F172A] text-sm block">Dr. {selectedDetails.doctorName}</span>
                  <span className="text-[#64748B]">{selectedDetails.doctorSpecialization} • {selectedDetails.departmentName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                    <span className="text-[#64748B] block mb-0.5">Date</span>
                    <span className="font-semibold text-[#0F172A]">{formatDate(selectedDetails.appointmentDate)}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                    <span className="text-[#64748B] block mb-0.5">Time</span>
                    <span className="font-semibold text-[#0F172A]">{formatTime(selectedDetails.appointmentTime)}</span>
                  </div>
                </div>
                {selectedDetails.reason && (
                  <div className="p-3 bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl">
                    <span className="text-[#64748B] block mb-0.5">Reason for Visit</span>
                    <p className="text-[#0F172A]">{selectedDetails.reason}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedDetails(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/patient/appointments')}>
                  Manage Appointment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
