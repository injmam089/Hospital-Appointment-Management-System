import { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart, Filter, Building2,
  UserCheck, Download, RefreshCw, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminReportSummary, AppointmentStatus, Department } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/LoadingSkeleton';
import { AdminNavbar } from '../../components/layout/AdminNavbar';
import toast from 'react-hot-toast';

export function AdminReportsPage() {
  const [reportData, setReportData] = useState<AdminReportSummary | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | ''>('');

  const fetchDepartments = async () => {
    try {
      const data = await adminApi.getDepartments();
      setDepartments(data);
    } catch {
      // ignore
    }
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReportsSummary({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        departmentId: selectedDeptId ? Number(selectedDeptId) : undefined,
        status: selectedStatus || undefined,
      });
      setReportData(data);
    } catch {
      toast.error('Failed to load operational reports.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedDeptId, selectedStatus]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDeptId('');
    setSelectedStatus('');
  };

  return (
    <div className="min-h-screen bg-surface">
      <AdminNavbar currentTab="reports" />

      <main className="page-container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2 tracking-tight">
              <FileBarChart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              Reports & Analytics
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Database-aggregated hospital performance, departmental volume, and clinical throughput
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchReports}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Print Report
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="card p-5 bg-card border border-border no-print">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-foreground">
            <Filter className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>Filter Operational Metrics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label htmlFor="report-start-date" className="label text-xs mb-1">Start Date</label>
              <input
                id="report-start-date"
                type="date"
                aria-label="Start Date"
                className="input-field py-1.5"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="report-end-date" className="label text-xs mb-1">End Date</label>
              <input
                id="report-end-date"
                type="date"
                aria-label="End Date"
                className="input-field py-1.5"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="report-dept" className="label text-xs mb-1">Department</label>
              <select
                id="report-dept"
                aria-label="Department"
                className="input-field py-1.5"
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="report-status" className="label text-xs mb-1">Status</label>
              <select
                id="report-status"
                aria-label="Status"
                className="input-field py-1.5"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_CONSULTATION">In Consultation</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="secondary" onClick={handleReset} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Aggregated KPI Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3 bg-card border border-border">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : reportData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-wider">Filtered Volume</p>
                <p className="text-2xl font-display font-bold text-foreground mt-0.5">{reportData.totalAppointments}</p>
                <span className="text-[11px] text-muted">Total matches</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="card p-5 bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-wider">Completed Consultations</p>
                <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {reportData.statusCounts['COMPLETED'] || 0}
                </p>
                <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Discharged / Prescribed</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="card p-5 bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-wider">Confirmed Bookings</p>
                <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                  {reportData.statusCounts['CONFIRMED'] || 0}
                </p>
                <span className="text-[11px] text-muted">Awaiting check-in</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="card p-5 bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-wider">Cancelled Bookings</p>
                <p className="text-2xl font-display font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {reportData.statusCounts['CANCELLED'] || 0}
                </p>
                <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80">Withdrawn by user</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Breakdown Tables */}
        {reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Summary Table */}
            <div className="card p-6 bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="font-display font-bold text-foreground text-base">
                    Department Volume Breakdown
                  </h3>
                </div>
                <span className="text-xs text-muted">Aggregated in DB</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-muted font-semibold">
                    <tr>
                      <th scope="col" className="pb-3">Department</th>
                      <th scope="col" className="pb-3">Staff Doctors</th>
                      <th scope="col" className="pb-3 text-right">Appointments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reportData.departmentStats.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-muted">
                          No department records match current filters.
                        </td>
                      </tr>
                    ) : (
                      reportData.departmentStats.map((dep) => (
                        <tr key={dep.departmentId} className="hover:bg-surface/50 transition-colors">
                          <td className="py-3 font-semibold text-foreground">{dep.departmentName}</td>
                          <td className="py-3 text-muted">{dep.doctorCount} doctors</td>
                          <td className="py-3 font-mono font-bold text-foreground text-right">
                            {dep.appointmentCount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctor Load Table */}
            <div className="card p-6 bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="font-display font-bold text-foreground text-base">
                    Doctor Clinical Throughput
                  </h3>
                </div>
                <span className="text-xs text-muted">Aggregated in DB</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-muted font-semibold">
                    <tr>
                      <th scope="col" className="pb-3">Doctor</th>
                      <th scope="col" className="pb-3">Department</th>
                      <th scope="col" className="pb-3 text-center">Completed</th>
                      <th scope="col" className="pb-3 text-center">Cancelled</th>
                      <th scope="col" className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reportData.doctorStats.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted">
                          No doctor records match current filters.
                        </td>
                      </tr>
                    ) : (
                      reportData.doctorStats.map((doc) => (
                        <tr key={doc.doctorId} className="hover:bg-surface/50 transition-colors">
                          <td className="py-3 font-semibold text-foreground">Dr. {doc.doctorName}</td>
                          <td className="py-3 text-muted">{doc.departmentName || 'General'}</td>
                          <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-center">
                            {doc.completedCount}
                          </td>
                          <td className="py-3 font-mono text-rose-600 dark:text-rose-400 font-semibold text-center">
                            {doc.cancelledCount}
                          </td>
                          <td className="py-3 font-mono font-bold text-foreground text-right">
                            {doc.appointmentCount}
                          </td>
                        </tr>
                      ))
                    )}
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
