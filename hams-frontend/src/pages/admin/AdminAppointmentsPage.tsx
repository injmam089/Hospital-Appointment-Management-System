import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Search, ArrowLeft, Clock,
  User, ChevronLeft, ChevronRight, Eye, X
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminAppointmentItem, AppointmentStatus, PageResponse } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageResponse<AdminAppointmentItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refSearch, setRefSearch] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [selectedAppt, setSelectedAppt] = useState<AdminAppointmentItem | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAppointments({
        ref: refSearch.trim() || undefined,
        patientSearch: patientSearch.trim() || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        size: 15,
      });
      setPageData(data);
    } catch {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchAppointments();
  };

  const handleResetFilters = () => {
    setRefSearch('');
    setPatientSearch('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
                <Calendar className="w-6 h-6 text-primary-600" />
                Appointment Oversight
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Hospital-wide appointment management, patient consultations, and schedule monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <Input
                placeholder="Reference (e.g. HAMS-2026...)"
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-muted" />}
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                placeholder="Patient Name..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-muted" />}
              />
            </div>
            <div className="sm:col-span-2">
              <select
                aria-label="Filter by Status"
                className="input-field"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as AppointmentStatus | '');
                  setCurrentPage(0);
                }}
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="IN_CONSULTATION">In Consultation</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="REJECTED">Rejected</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <input
                type="date"
                aria-label="Filter by Date"
                className="input-field"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(0);
                }}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <Button type="submit" variant="primary" className="flex-1">
                Filter
              </Button>
              <Button type="button" variant="ghost" onClick={handleResetFilters} size="sm">
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Appointments Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border text-xs text-muted font-semibold">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={6} />
                  ))
                ) : !pageData || pageData.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <EmptyState
                        icon={<Calendar className="w-8 h-8 text-muted" />}
                        title="No appointments found"
                        description="Try adjusting your date filters or reference search term."
                      />
                    </td>
                  </tr>
                ) : (
                  pageData.content.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {item.appointmentRef}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-navy text-sm">{item.patientName}</p>
                        {item.patientPhone && (
                          <p className="text-xs text-muted">{item.patientPhone}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-navy text-sm">Dr. {item.doctorName}</p>
                        <p className="text-xs text-muted">{item.departmentName || item.doctorSpecialization}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-navy text-xs">{formatDate(item.appointmentDate)}</p>
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.appointmentTime)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <AppointmentStatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAppt(item)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageData && pageData.totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted">
                Page <span className="font-semibold text-navy">{pageData.number + 1}</span> of{' '}
                <span className="font-semibold text-navy">{pageData.totalPages}</span> ({pageData.totalElements} appointments)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageData.first}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageData.last}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Appointment Details Modal */}
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-modal border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div>
                  <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                    {selectedAppt.appointmentRef}
                  </span>
                  <h3 className="font-display font-bold text-navy text-lg mt-1">
                    Appointment Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="p-1 rounded-lg text-muted hover:text-navy hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-muted block">Status</span>
                    <div className="mt-1">
                      <AppointmentStatusBadge status={selectedAppt.status} />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted block">Schedule</span>
                    <p className="font-semibold text-navy mt-1">
                      {formatDate(selectedAppt.appointmentDate)} at {formatTime(selectedAppt.appointmentTime)}
                    </p>
                  </div>
                </div>

                <div className="p-3 border border-border rounded-xl space-y-2">
                  <span className="text-muted font-semibold block">Patient Information</span>
                  <p className="text-sm font-semibold text-navy">{selectedAppt.patientName}</p>
                  {selectedAppt.patientPhone && (
                    <p className="text-muted">Contact: {selectedAppt.patientPhone}</p>
                  )}
                </div>

                <div className="p-3 border border-border rounded-xl space-y-2">
                  <span className="text-muted font-semibold block">Assigned Doctor</span>
                  <p className="text-sm font-semibold text-navy">Dr. {selectedAppt.doctorName}</p>
                  <p className="text-muted">
                    {selectedAppt.departmentName} — {selectedAppt.doctorSpecialization}
                  </p>
                </div>

                {selectedAppt.reason && (
                  <div>
                    <span className="text-muted font-semibold block mb-1">Reason for Visit</span>
                    <p className="p-2.5 bg-slate-50 rounded-lg text-slate-700">
                      {selectedAppt.reason}
                    </p>
                  </div>
                )}

                {selectedAppt.cancellationReason && (
                  <div>
                    <span className="text-rose-600 font-semibold block mb-1">Cancellation Reason</span>
                    <p className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                      {selectedAppt.cancellationReason}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedAppt(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
