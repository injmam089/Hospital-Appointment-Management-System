import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar, Search, Clock,
  User, ChevronLeft, ChevronRight, Eye, X, Filter, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../api/admin';
import type { AdminAppointmentItem, AppointmentStatus, PageResponse } from '../../types';
import { formatDate, formatTime } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppointmentStatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { AdminNavbar } from '../../components/layout/AdminNavbar';
import { useModalA11y } from '../../lib/useModalA11y';
import toast from 'react-hot-toast';

export function AdminAppointmentsPage() {
  const [pageData, setPageData] = useState<PageResponse<AdminAppointmentItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refSearch, setRefSearch] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [selectedAppt, setSelectedAppt] = useState<AdminAppointmentItem | null>(null);
  const detailsModalRef = useRef<HTMLDivElement>(null);

  useModalA11y({
    isOpen: !!selectedAppt,
    onClose: () => setSelectedAppt(null),
    containerRef: detailsModalRef,
  });

  const fetchAppointments = useCallback(async () => {
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
  }, [refSearch, patientSearch, statusFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, statusFilter, startDate, endDate, fetchAppointments]);

  // Escape key handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAppt) {
        setSelectedAppt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAppt]);

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
    <div className="min-h-screen bg-surface">
      <AdminNavbar currentTab="appointments" />

      <main className="page-container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2 tracking-tight">
                <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Appointment Oversight
              </h1>
              {pageData && (
                <span className="badge badge-blue">
                  {pageData.totalElements} Total
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-0.5">
              Hospital-wide appointment schedules, consultation tracking, and operational booking management
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card p-5 bg-card border border-border">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-foreground">
            <Filter className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>Search & Filter Appointments</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-3">
              <label htmlFor="ref-search" className="label text-xs mb-1">Appointment Reference</label>
              <Input
                id="ref-search"
                placeholder="e.g. HAMS-2026..."
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-muted" />}
              />
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="patient-search" className="label text-xs mb-1">Patient Name</label>
              <Input
                id="patient-search"
                placeholder="Search patient name..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-muted" />}
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="status-filter" className="label text-xs mb-1">Status</label>
              <select
                id="status-filter"
                aria-label="Filter by Status"
                className="input-field"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as AppointmentStatus | '');
                  setCurrentPage(0);
                }}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
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

            <div className="lg:col-span-2">
              <label htmlFor="start-date-filter" className="label text-xs mb-1">Date</label>
              <input
                id="start-date-filter"
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

            <div className="lg:col-span-2 flex items-end gap-2">
              <Button type="submit" variant="primary" className="flex-1">
                Filter
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetFilters}
                className="text-muted hover:text-foreground"
                title="Reset filters"
                aria-label="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Appointments Table */}
        <div className="card overflow-hidden bg-card border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-xs text-muted font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Reference</th>
                  <th scope="col" className="py-3.5 px-4">Patient</th>
                  <th scope="col" className="py-3.5 px-4">Doctor</th>
                  <th scope="col" className="py-3.5 px-4">Date & Time</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Action</th>
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
                    <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/40 px-2 py-0.5 rounded">
                          {item.appointmentRef}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-foreground text-sm">{item.patientName}</p>
                        {item.patientPhone && (
                          <p className="text-xs text-muted">{item.patientPhone}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-foreground text-sm">Dr. {item.doctorName}</p>
                        <p className="text-xs text-muted">{item.departmentName || item.doctorSpecialization}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-foreground text-xs">{formatDate(item.appointmentDate)}</p>
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
            <div className="p-4 bg-surface border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted">
                Page <span className="font-semibold text-foreground">{pageData.number + 1}</span> of{' '}
                <span className="font-semibold text-foreground">{pageData.totalPages}</span> ({pageData.totalElements} appointments)
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
        <AnimatePresence>
          {selectedAppt && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
              role="dialog"
              aria-modal="true"
              aria-labelledby="appt-details-title"
            >
              <motion.div
                ref={detailsModalRef}
                tabIndex={-1}
                className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 shadow-modal border border-border focus:outline-none overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4 shrink-0">
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/40 px-2 py-0.5 rounded">
                      {selectedAppt.appointmentRef}
                    </span>
                    <h3 id="appt-details-title" className="font-display font-bold text-foreground text-lg mt-1">
                      Appointment Details
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAppt(null)}
                    className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Close appointment details dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-surface rounded-xl border border-border">
                    <div>
                      <span className="text-muted block font-medium">Status</span>
                      <div className="mt-1">
                        <AppointmentStatusBadge status={selectedAppt.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted block font-medium">Schedule</span>
                      <p className="font-semibold text-foreground mt-1">
                        {formatDate(selectedAppt.appointmentDate)} at {formatTime(selectedAppt.appointmentTime)}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 border border-border rounded-xl space-y-1 bg-card">
                    <span className="text-muted font-semibold block uppercase tracking-wider text-[11px]">Patient Information</span>
                    <p className="text-sm font-semibold text-foreground">{selectedAppt.patientName}</p>
                    {selectedAppt.patientPhone && (
                      <p className="text-muted">Contact: {selectedAppt.patientPhone}</p>
                    )}
                  </div>

                  <div className="p-3 border border-border rounded-xl space-y-1 bg-card">
                    <span className="text-muted font-semibold block uppercase tracking-wider text-[11px]">Assigned Doctor</span>
                    <p className="text-sm font-semibold text-foreground">Dr. {selectedAppt.doctorName}</p>
                    <p className="text-muted">
                      {selectedAppt.departmentName} — {selectedAppt.doctorSpecialization}
                    </p>
                  </div>

                  {selectedAppt.reason && (
                    <div className="p-3 border border-border rounded-xl bg-card">
                      <span className="text-muted font-semibold block mb-1 uppercase tracking-wider text-[11px]">Reason for Visit</span>
                      <p className="text-foreground leading-relaxed">
                        {selectedAppt.reason}
                      </p>
                    </div>
                  )}

                  {selectedAppt.cancellationReason && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold block mb-1 uppercase tracking-wider text-[11px]">Cancellation Reason</span>
                      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
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
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
