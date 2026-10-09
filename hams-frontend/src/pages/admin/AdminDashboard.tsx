import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersRound, Building2, CalendarDays, CircleCheck, CircleX,
  ShieldCheck, Shield, ArrowRight, FileBarChart,
  Clock3, AlertCircle, RefreshCw, Stethoscope, UserRound,
  CalendarCheck, UserCheck, CalendarClock, CalendarX,
  ChevronRight, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { adminApi } from '../../api/admin';
import type { AdminDashboardStats } from '../../types';
import { StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/LoadingSkeleton';
import { AdminNavbar } from '../../components/layout/AdminNavbar';
import { formatDate } from '../../lib/utils';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toISOString();

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <AdminNavbar currentTab="dashboard" />

      <main className="page-container py-8 space-y-8 max-w-7xl flex-1">
        {/* ============================================================ */}
        {/* COMMAND CENTER HEADER & GREETING */}
        {/* ============================================================ */}
        <section aria-labelledby="admin-command-heading" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 id="admin-command-heading" className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight">
                  {getGreeting()}, Administrator
                </h1>
                <Badge variant="amber" dot className="hidden sm:inline-flex">
                  Admin Portal
                </Badge>
              </div>
              <p className="text-sm text-muted mt-1">
                Here&apos;s the current operational overview of HAMS.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchStats}
                leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
              >
                Refresh Data
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/doctors')}
                leftIcon={<Stethoscope className="w-4 h-4" />}
              >
                Doctor Records
              </Button>
            </div>
          </div>

          {/* Operational Security Trust Strip */}
          <div className="p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Secure Operational Session</span>
                  <span className="w-2 h-2 rounded-full bg-success inline-block" title="Session active" />
                </div>
                <p className="text-xs text-muted">
                  Administrative oversight active • User governance, credential verification, and secure administrative audit trail
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono bg-surface-secondary px-3 py-1 rounded-xl border border-border text-foreground font-medium flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted" />
                {formatDate(todayStr, 'EEE, MMM dd, yyyy')}
              </span>
              <span className="text-xs text-muted bg-surface-secondary px-3 py-1 rounded-xl border border-border">
                {user?.email || 'admin@hams.local'}
              </span>
            </div>
          </div>

          {/* Doctor Verification Alert Banner (if pending) */}
          {stats && stats.pendingDoctorVerifications > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-4 text-amber-900 dark:text-amber-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">
                    Doctor Credential Verifications Required ({stats.pendingDoctorVerifications} Pending)
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Medical licenses and practitioner registrations await administrative review before appearing in public listings.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/doctors')}
                className="flex-shrink-0 text-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Review Now
              </Button>
            </motion.div>
          )}
        </section>

        {/* ============================================================ */}
        {/* PRIORITY 1: SYSTEM OVERVIEW KPIs */}
        {/* ============================================================ */}
        <section aria-labelledby="kpi-overview-heading" className="space-y-3">
          <h2 id="kpi-overview-heading" className="font-display font-bold text-foreground text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            System Overview & Operational Metrics
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-5 space-y-3 bg-card border border-border">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Registered Patients"
                value={stats.totalPatients}
                icon={<UserRound className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title="Active Doctors"
                value={`${stats.activeDoctors} / ${stats.totalDoctors}`}
                icon={<Stethoscope className="w-6 h-6" />}
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
                icon={<CalendarDays className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title="Upcoming Appointments"
                value={stats.upcomingAppointments}
                icon={<Clock3 className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title="Completed Consultations"
                value={stats.completedAppointments}
                icon={<CircleCheck className="w-6 h-6" />}
                color="green"
              />
              <StatCard
                title="Cancelled Appointments"
                value={stats.cancelledAppointments}
                icon={<CircleX className="w-6 h-6" />}
                color="red"
              />
              <StatCard
                title="Pending Doctor Reviews"
                value={stats.pendingDoctorVerifications}
                icon={<ShieldCheck className="w-6 h-6" />}
                color="amber"
              />
            </div>
          ) : (
            <div className="card p-8 text-center bg-card border border-border text-muted text-sm">
              Unable to load statistics. Please click &quot;Refresh Data&quot; to retry.
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* PRIORITY 2: APPOINTMENT OPERATIONS & TRENDS */}
        {/* ============================================================ */}
        {stats && (
          <section aria-labelledby="appointment-ops-heading" className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <h2 id="appointment-ops-heading" className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Appointment Operations & Activity Breakdown
              </h2>
              <button
                onClick={() => navigate('/admin/appointments')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Full Appointment Desk</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Appointment Status Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {[
                { label: 'Pending', count: stats.statusDistribution?.PENDING || 0, icon: <Clock3 className="w-3.5 h-3.5" />, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
                { label: 'Confirmed', count: stats.statusDistribution?.CONFIRMED || 0, icon: <CalendarCheck className="w-3.5 h-3.5" />, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
                { label: 'Checked In', count: stats.statusDistribution?.CHECKED_IN || 0, icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20' },
                { label: 'Consulting', count: stats.statusDistribution?.IN_CONSULTATION || 0, icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' },
                { label: 'Completed', count: stats.statusDistribution?.COMPLETED || 0, icon: <CircleCheck className="w-3.5 h-3.5" />, color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
                { label: 'Cancelled', count: stats.statusDistribution?.CANCELLED || 0, icon: <CircleX className="w-3.5 h-3.5" />, color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
                { label: 'Rescheduled', count: stats.statusDistribution?.RESCHEDULED || 0, icon: <CalendarClock className="w-3.5 h-3.5" />, color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' },
                { label: 'No Show', count: stats.statusDistribution?.NO_SHOW || 0, icon: <CalendarX className="w-3.5 h-3.5" />, color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' },
              ].map((st) => (
                <div
                  key={st.label}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center justify-between shadow-2xs ${st.color}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1">
                    {st.icon}
                    <span>{st.label}</span>
                  </div>
                  <span className="text-xl font-bold font-mono">{st.count}</span>
                </div>
              ))}
            </div>

            {/* Visual Distributions: Status Distribution + 14-Day Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Progress Bars */}
              <div className="card p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-base">
                      Appointment Status Distribution
                    </h3>
                    <p className="text-xs text-muted">Proportional breakdown of all lifecycle events</p>
                  </div>
                  <span className="text-xs font-mono bg-surface-secondary px-2.5 py-1 rounded-lg border border-border text-muted">
                    Database Aggregated
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {Object.entries(stats.statusDistribution || {}).map(([st, cnt]) => {
                    const total = Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((cnt / total) * 100);

                    const barColors: Record<string, string> = {
                      CONFIRMED: 'bg-primary',
                      CHECKED_IN: 'bg-cyan-500',
                      IN_CONSULTATION: 'bg-indigo-500',
                      COMPLETED: 'bg-emerald-500',
                      CANCELLED: 'bg-red-500',
                      RESCHEDULED: 'bg-amber-500',
                      REJECTED: 'bg-red-700',
                      NO_SHOW: 'bg-slate-400',
                      PENDING: 'bg-amber-400',
                    };

                    return (
                      <div key={st} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{st.replace(/_/g, ' ')}</span>
                          <span className="text-muted font-mono font-semibold">
                            {cnt} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className={`h-full rounded-full ${barColors[st] || 'bg-primary'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 14-Day Appointment Timeline Chart */}
              <div className="card p-6 bg-card border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-foreground text-base">
                        Daily Appointment Volume
                      </h3>
                      <p className="text-xs text-muted">Operational trends across the past 14 days</p>
                    </div>
                    <span className="text-xs font-mono bg-surface-secondary px-2.5 py-1 rounded-lg border border-border text-muted">
                      Last 14 Days
                    </span>
                  </div>

                  {stats.appointmentsOverTime.length === 0 ? (
                    <p className="text-xs text-muted py-16 text-center">
                      No appointment volume history recorded in this period.
                    </p>
                  ) : (
                    <div className="overflow-x-auto pb-1 scrollbar-thin">
                      <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 border-b border-border min-w-[480px] lg:min-w-full">
                        {stats.appointmentsOverTime.map((pt, i) => {
                          const maxCount = Math.max(...stats.appointmentsOverTime.map((p) => p.count), 1);
                          const heightPct = Math.max(12, Math.round((pt.count / maxCount) * 100));

                          return (
                            <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-1 group relative">
                              <div
                                className="absolute -top-7 hidden group-hover:flex bg-navy text-white text-[10px] px-2 py-0.5 rounded-lg shadow-md z-10 whitespace-nowrap"
                              >
                                {pt.date}: {pt.count} appts
                              </div>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className="w-full bg-primary/80 hover:bg-primary rounded-t-sm transition-all"
                              />
                              <span className="text-[9px] text-muted truncate w-full text-center">
                                {pt.date.slice(5)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-between text-xs text-muted">
                  <span>Hover bars to inspect exact appointment volume</span>
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="text-primary hover:underline font-semibold"
                  >
                    View Analytics Report →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* PRIORITY 3: DOCTOR / USER OPERATIONS & DEPARTMENT LOAD */}
        {/* ============================================================ */}
        {stats && (
          <section aria-labelledby="workload-overview-heading" className="space-y-4">
            <h2 id="workload-overview-heading" className="font-display font-bold text-foreground text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Clinical Practice & Department Workload
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Activity */}
              <div className="card p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-base">
                      Department Patient Distribution
                    </h3>
                    <p className="text-xs text-muted">Active doctors and total appointment bookings per specialty</p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/departments')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Manage Departments
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th scope="col" className="pb-2 font-medium">Department</th>
                        <th scope="col" className="pb-2 font-medium">Doctors</th>
                        <th scope="col" className="pb-2 font-medium text-right">Appointments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {stats.departmentActivity.slice(0, 6).map((dep) => (
                        <tr key={dep.departmentId} className="hover:bg-surface-secondary/50 transition-colors">
                          <td className="py-2.5 font-semibold text-foreground">{dep.departmentName}</td>
                          <td className="py-2.5 text-muted">{dep.doctorCount} doctors</td>
                          <td className="py-2.5 font-mono font-semibold text-foreground text-right">
                            {dep.appointmentCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Doctor Workload */}
              <div className="card p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-base">
                      Clinician Workload & Completion
                    </h3>
                    <p className="text-xs text-muted">Top doctors by consultations conducted</p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/doctors')}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Manage Doctors
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th scope="col" className="pb-2 font-medium">Practitioner</th>
                        <th scope="col" className="pb-2 font-medium">Department</th>
                        <th scope="col" className="pb-2 font-medium text-center">Completed</th>
                        <th scope="col" className="pb-2 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {stats.doctorActivity.slice(0, 6).map((doc) => (
                        <tr key={doc.doctorId} className="hover:bg-surface-secondary/50 transition-colors">
                          <td className="py-2.5 font-semibold text-foreground">Dr. {doc.doctorName}</td>
                          <td className="py-2.5 text-muted">{doc.departmentName || 'General'}</td>
                          <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-center">
                            {doc.completedCount}
                          </td>
                          <td className="py-2.5 font-mono font-semibold text-foreground text-right">
                            {doc.appointmentCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* PRIORITY 4: OPERATIONAL SHORTCUTS & AUDIT GOVERNANCE */}
        {/* ============================================================ */}
        <section aria-labelledby="shortcuts-heading" className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-border">
            <h2 id="shortcuts-heading" className="font-display font-bold text-foreground text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Administrative Modules & System Governance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'User Management',
                desc: 'Manage patient and doctor accounts, search profiles, toggle active status.',
                icon: UsersRound,
                path: '/admin/users',
                color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
              },
              {
                title: 'Doctor Directory',
                desc: 'Verify medical licenses, approve practice registrations, manage credentials.',
                icon: Stethoscope,
                path: '/admin/doctors',
                color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
              },
              {
                title: 'Reports & Analytics',
                desc: 'Database aggregated performance metrics, department volumes & doctor loads.',
                icon: FileBarChart,
                path: '/admin/reports',
                color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
              },
              {
                title: 'Audit Trail & Compliance',
                desc: 'Inspect secure administrative audit logs, actor footprints, and compliance records.',
                icon: ShieldCheck,
                path: '/admin/audit-logs',
                color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(item.path)}
                className="card p-5 cursor-pointer hover:shadow-subtle border border-border bg-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Open Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
