import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Clock, CheckCircle, LogOut, Stethoscope,
  Shield, UserCheck, ArrowRight, CalendarDays, ChevronRight,
  X
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

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [todayAppointments, setTodayAppointments] = useState<AppointmentResponse[]>([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [today, all] = await Promise.all([
        appointmentApi.getDoctorTodayAppointments(),
        appointmentApi.getDoctorAppointments(),
      ]);
      setTodayAppointments(today);
      setTotalAppointments(all.length);
    } catch {
      // Non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login', { replace: true });
  };

  const doctorName = user?.firstName
    ? `Dr. ${user.firstName} ${user.lastName || ''}`.trim()
    : 'Doctor Portal';

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-[#0F172A] text-base sm:text-lg">
                {doctorName}
              </h1>
              <Badge variant="green" dot>Clinician Portal</Badge>
            </div>
            <p className="text-xs text-[#64748B]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/doctor/appointments')}
            leftIcon={<Calendar className="w-4 h-4 text-[#2563EB]" />}
            className="hidden sm:inline-flex"
          >
            All Appointments
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/doctor/schedule')}
            leftIcon={<CalendarDays className="w-4 h-4 text-emerald-600" />}
            className="hidden md:inline-flex"
          >
            Weekly Schedule
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/doctor/profile')}
            leftIcon={<UserCheck className="w-4 h-4 text-[#64748B]" />}
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
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Verified Hospital Practitioner</p>
              <p className="text-xs text-[#64748B]">
                Authenticated clinical access. Live patient consultation desk and digital prescription issuing active.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono bg-[#F7F9FC] px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[#0F172A]">
              Staff ID: #{user?.id || 1}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Queue
            </Button>
          </div>
        </div>

        {/* Priority 1: Doctor KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Queue"
            value={todayAppointments.length}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title="Total Bookings"
            value={totalAppointments}
            icon={<Users className="w-5 h-5" />}
            color="green"
            delay={0.05}
          />
          <StatCard
            title="Confirmed Queue"
            value={todayAppointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN').length}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
            delay={0.1}
          />
          <StatCard
            title="Practice Status"
            value="Active"
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
            delay={0.15}
          />
        </div>

        {/* Priority 2: Today's Clinical Queue */}
        <motion.div
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="font-display font-bold text-[#0F172A] text-lg">Today's Patient Queue</h2>
              <p className="text-xs text-[#64748B]">Scheduled consultations and status flow for today</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Clinical Desk
            </Button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-[#64748B] animate-pulse">
              Loading today's clinical queue...
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="py-8 px-4 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#64748B] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[#0F172A] text-base">No patients scheduled for today</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  You have no appointments booked for today. Review upcoming visits in the appointments manager.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  View All Appointments
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 bg-[#F7F9FC] rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] font-bold flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0F172A] text-sm">{formatTime(appt.appointmentTime)}</span>
                        <AppointmentStatusBadge status={appt.status} />
                        <span className="text-xs font-mono text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                          {appt.appointmentRef}
                        </span>
                      </div>
                      <p className="text-xs text-[#0F172A] font-semibold mt-0.5">
                        {appt.patientName}
                      </p>
                      {appt.reason && (
                        <p className="text-xs text-[#64748B] line-clamp-1">
                          Complaint: {appt.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedAppt(appt)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/doctor/appointments')}
                    >
                      Open in Desk
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Priority 3: Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-[#0F172A] text-base">Patient Appointments & History</h3>
              <p className="text-xs text-[#64748B]">Filter daily rosters, patient check-ins, consultation notes, and past visits.</p>
            </div>
            <div className="pt-4">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate('/doctor/appointments')}
              >
                <span>Manage Appointments</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-[#0F172A] text-base">Weekly Clinic Schedule & Leaves</h3>
              <p className="text-xs text-[#64748B]">Set working days, consultation slot durations, break intervals, and doctor leaves.</p>
            </div>
            <div className="pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate('/doctor/schedule')}
              >
                <span>Configure Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-[#E2E8F0]"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-[#0F172A] text-lg">Patient Appointment</h3>
                  <p className="text-xs text-[#64748B] font-mono">{selectedAppt.appointmentRef}</p>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="p-1 rounded-lg hover:bg-[#F7F9FC] text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#F7F9FC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B]">Status</span>
                  <AppointmentStatusBadge status={selectedAppt.status} />
                </div>
                <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                  <span className="text-[#64748B] block mb-0.5">Patient Name</span>
                  <span className="font-bold text-[#0F172A] text-sm block">{selectedAppt.patientName}</span>
                  <span className="text-[#64748B]">{selectedAppt.patientPhone || 'No telephone registered'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                    <span className="text-[#64748B] block mb-0.5">Date</span>
                    <span className="font-semibold text-[#0F172A]">{formatDate(selectedAppt.appointmentDate)}</span>
                  </div>
                  <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl">
                    <span className="text-[#64748B] block mb-0.5">Time</span>
                    <span className="font-semibold text-[#0F172A]">{formatTime(selectedAppt.appointmentTime)}</span>
                  </div>
                </div>
                {selectedAppt.reason && (
                  <div className="p-3 bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl">
                    <span className="text-[#64748B] block mb-0.5">Chief Complaint</span>
                    <p className="text-[#0F172A]">{selectedAppt.reason}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedAppt(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/doctor/appointments')}>
                  Open in Clinical Desk
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
