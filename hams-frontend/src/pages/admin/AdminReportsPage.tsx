import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart, Filter, ArrowLeft, Building2,
  UserCheck, Download, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminReportSummary, AppointmentStatus, Department } from '../../types';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export function AdminReportsPage() {
  const navigate = useNavigate();
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

  const fetchReports = async () => {
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
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, selectedDeptId, selectedStatus]);

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSelectedDeptId('');
    setSelectedStatus('');
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="page-container max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-xl bg-white border border-border text-navy hover:bg-slate-100 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-display text-navy flex items-center gap-2">
                <FileBarChart className="w-6 h-6 text-primary-600" />
                Reports & Analytics
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Database-aggregated hospital performance, departmental volume, and clinical throughput
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-navy">
            <Filter className="w-4 h-4 text-primary-600" />
            <span>Filter Operational Metrics</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="label text-[11px] mb-1">Start Date</label>
              <input
                type="date"
                aria-label="Start Date"
                className="input-field py-1.5"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-[11px] mb-1">End Date</label>
              <input
                type="date"
                aria-label="End Date"
                className="input-field py-1.5"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-[11px] mb-1">Department</label>
              <select
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
              <label className="label text-[11px] mb-1">Status</label>
              <select
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
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Aggregated KPI Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : reportData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Filtered Appointments"
              value={reportData.totalAppointments}
              icon={<FileBarChart className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Completed Consultations"
              value={reportData.statusCounts['COMPLETED'] || 0}
              icon={<UserCheck className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="Confirmed Bookings"
              value={reportData.statusCounts['CONFIRMED'] || 0}
              icon={<Building2 className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Cancelled Bookings"
              value={reportData.statusCounts['CANCELLED'] || 0}
              icon={<FileBarChart className="w-6 h-6" />}
              color="red"
            />
          </div>
        ) : null}

        {/* Breakdown Tables */}
        {reportData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Summary Table */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-navy text-base">
                  Department Volume Breakdown
                </h3>
                <span className="text-xs text-muted">Aggregated in DB</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-muted font-semibold">
                    <tr>
                      <th className="pb-2.5">Department</th>
                      <th className="pb-2.5">Staff Doctors</th>
                      <th className="pb-2.5 text-right">Appointments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {reportData.departmentStats.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-muted">
                          No department records match current filters.
                        </td>
                      </tr>
                    ) : (
                      reportData.departmentStats.map((dep) => (
                        <tr key={dep.departmentId} className="hover:bg-slate-50">
                          <td className="py-2.5 font-semibold text-navy">{dep.departmentName}</td>
                          <td className="py-2.5 text-slate-600">{dep.doctorCount} doctors</td>
                          <td className="py-2.5 font-mono font-bold text-navy text-right">
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
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-navy text-base">
                  Doctor Clinical Throughput
                </h3>
                <span className="text-xs text-muted">Aggregated in DB</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border text-muted font-semibold">
                    <tr>
                      <th className="pb-2.5">Doctor</th>
                      <th className="pb-2.5">Department</th>
                      <th className="pb-2.5 text-center">Completed</th>
                      <th className="pb-2.5 text-center">Cancelled</th>
                      <th className="pb-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {reportData.doctorStats.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted">
                          No doctor records match current filters.
                        </td>
                      </tr>
                    ) : (
                      reportData.doctorStats.map((doc) => (
                        <tr key={doc.doctorId} className="hover:bg-slate-50">
                          <td className="py-2.5 font-semibold text-navy">Dr. {doc.doctorName}</td>
                          <td className="py-2.5 text-slate-600">{doc.departmentName || 'General'}</td>
                          <td className="py-2.5 font-mono text-emerald-600 font-semibold text-center">
                            {doc.completedCount}
                          </td>
                          <td className="py-2.5 font-mono text-rose-600 font-semibold text-center">
                            {doc.cancelledCount}
                          </td>
                          <td className="py-2.5 font-mono font-bold text-navy text-right">
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
      </div>
    </div>
  );
}
