import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, Building2, Calendar, CheckCircle, XCircle,
  LogOut, ShieldCheck, Shield, ArrowRight, FileBarChart,
  History, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin';
import type { AdminDashboardStats } from '../../types';
import { StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import { Skeleton } from '../../components/ui/LoadingSkeleton';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-[#0F172A] text-lg">Hospital Administration</h1>
              <Badge variant="amber" dot>Admin Console</Badge>
            </div>
            <p className="text-xs text-[#64748B]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStats}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button variant="secondary" onClick={handleLogout} size="sm" leftIcon={<LogOut className="w-4 h-4" />}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="page-container py-8 space-y-8">
        {/* Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-medical-amber flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-navy">Administrative System Authority</p>
              <p className="text-xs text-muted">
                Direct oversight of clinical operations, practitioner credentials, patient appointments, and tamper-resistant audit logs.
              </p>
            </div>
          </div>
          {stats && stats.pendingDoctorVerifications > 0 && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="text-xs font-semibold text-amber-800">
                {stats.pendingDoctorVerifications} Verification(s) Pending
              </span>
              <button
                onClick={() => navigate('/admin/doctors')}
                className="text-xs font-bold text-primary-600 hover:underline ml-1"
              >
                Review
              </button>
            </div>
          )}
        </div>

        {/* Primary KPI Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon={<Users className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Doctors (Active / Total)"
              value={`${stats.activeDoctors} / ${stats.totalDoctors}`}
              icon={<UserCheck className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Medical Departments"
              value={stats.totalDepartments}
              icon={<Building2 className="w-6 h-6" />}
              color="amber"
            />
            <StatCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              icon={<Calendar className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Upcoming Appointments"
              value={stats.upcomingAppointments}
              icon={<Clock className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Completed Consultations"
              value={stats.completedAppointments}
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Cancelled Appointments"
              value={stats.cancelledAppointments}
              icon={<XCircle className="w-6 h-6" />}
              color="red"
            />
            <StatCard
              title="Pending Doctor Reviews"
              value={stats.pendingDoctorVerifications}
              icon={<AlertCircle className="w-6 h-6" />}
              color="amber"
            />
          </div>
        ) : null}

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'User Management',
              desc: 'Manage patient and doctor accounts, search profiles, toggle active status.',
              icon: Users,
              path: '/admin/users',
              color: 'text-blue-600 bg-blue-50 border-blue-200',
            },
            {
              title: 'Appointment Oversight',
              desc: 'Inspect all hospital appointments, track status flow, search by ref.',
              icon: Calendar,
              path: '/admin/appointments',
              color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            },
            {
              title: 'Reports & Analytics',
              desc: 'Database aggregated performance metrics, department volumes & doctor loads.',
              icon: FileBarChart,
              path: '/admin/reports',
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            },
            {
              title: 'Audit Trail',
              desc: 'Inspect tamper-evident system logs, actor footprints, and security audits.',
              icon: History,
              path: '/admin/audit-logs',
              color: 'text-slate-700 bg-slate-100 border-slate-300',
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(item.path)}
              className="card p-5 cursor-pointer hover:shadow-card-hover border transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
              </div>
              <h3 className="text-sm font-bold text-navy mb-1">{item.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Analytics & Charts Breakdown */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Status Distribution */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-navy text-base">
                  Appointment Status Distribution
                </h3>
                <span className="text-xs text-muted">PostgreSQL Aggregate</span>
              </div>

              <div className="space-y-3">
                {Object.entries(stats.statusDistribution || {}).map(([st, cnt]) => {
                  const total = Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((cnt / total) * 100);

                  const barColors: Record<string, string> = {
                    CONFIRMED: 'bg-primary-600',
                    CHECKED_IN: 'bg-primary-400',
                    IN_CONSULTATION: 'bg-indigo-600',
                    COMPLETED: 'bg-emerald-500',
                    CANCELLED: 'bg-rose-500',
                    RESCHEDULED: 'bg-amber-500',
                    REJECTED: 'bg-rose-700',
                    NO_SHOW: 'bg-slate-400',
                    PENDING: 'bg-amber-400',
                  };

                  return (
                    <div key={st} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{st.replace(/_/g, ' ')}</span>
                        <span className="text-muted font-mono font-semibold">
                          {cnt} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={`h-full rounded-full ${barColors[st] || 'bg-primary-500'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Appointments Activity Over Time (14 Days) */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-navy text-base">
                  Appointments Activity Over Time
                </h3>
                <span className="text-xs text-muted">Last 14 Days</span>
              </div>

              {stats.appointmentsOverTime.length === 0 ? (
                <p className="text-xs text-muted py-12 text-center">
                  No appointment history recorded in this period.
                </p>
              ) : (
                <div className="h-48 flex items-end gap-2 pt-6 pb-2 border-b border-border">
                  {stats.appointmentsOverTime.map((pt, i) => {
                    const maxCount = Math.max(...stats.appointmentsOverTime.map((p) => p.count), 1);
                    const heightPct = Math.max(10, Math.round((pt.count / maxCount) * 100));

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="absolute -top-7 hidden group-hover:flex bg-navy text-white text-[10px] px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap"
                        >
                          {pt.date}: {pt.count} appts
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-primary-500 hover:bg-primary-600 rounded-t-sm transition-all"
                        />
                        <span className="text-[9px] text-muted truncate w-full text-center">
                          {pt.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Department Activity Summary */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-navy text-base">
                  Department Activity
                </h3>
                <button
                  onClick={() => navigate('/admin/departments')}
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="pb-2 font-medium">Department</th>
                      <th className="pb-2 font-medium">Doctors</th>
                      <th className="pb-2 font-medium text-right">Appointments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {stats.departmentActivity.slice(0, 6).map((dep) => (
                      <tr key={dep.departmentId} className="hover:bg-slate-50">
                        <td className="py-2.5 font-semibold text-navy">{dep.departmentName}</td>
                        <td className="py-2.5 text-slate-600">{dep.doctorCount} doctors</td>
                        <td className="py-2.5 font-mono font-semibold text-navy text-right">
                          {dep.appointmentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Top Doctor Activity */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-navy text-base">
                  Doctor Workload Summary
                </h3>
                <button
                  onClick={() => navigate('/admin/doctors')}
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="pb-2 font-medium">Doctor</th>
                      <th className="pb-2 font-medium">Department</th>
                      <th className="pb-2 font-medium text-center">Completed</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {stats.doctorActivity.slice(0, 6).map((doc) => (
                      <tr key={doc.doctorId} className="hover:bg-slate-50">
                        <td className="py-2.5 font-semibold text-navy">Dr. {doc.doctorName}</td>
                        <td className="py-2.5 text-muted">{doc.departmentName || 'General'}</td>
                        <td className="py-2.5 font-mono text-emerald-600 font-semibold text-center">
                          {doc.completedCount}
                        </td>
                        <td className="py-2.5 font-mono font-semibold text-navy text-right">
                          {doc.appointmentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
