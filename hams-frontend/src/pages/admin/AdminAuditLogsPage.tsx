import { useState, useEffect, useCallback } from 'react';
import {
  History, Search,
  ChevronLeft, ChevronRight, Eye, X, Terminal, Filter, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../api/admin';
import type { AuditLogItem, PageResponse } from '../../types';
import { formatDateTime } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { AdminNavbar } from '../../components/layout/AdminNavbar';
import { useModalA11y } from '../../lib/useModalA11y';
import toast from 'react-hot-toast';

export function AdminAuditLogsPage() {
  const [logsPage, setLogsPage] = useState<PageResponse<AuditLogItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [actionSearch, setActionSearch] = useState<string>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const modalRef = useModalA11y({
    isOpen: !!selectedLog,
    onClose: () => setSelectedLog(null),
  });

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs({
        action: actionSearch.trim() || undefined,
        entityType: entityTypeFilter || undefined,
        page: currentPage,
        size: 15,
      });
      setLogsPage(data);
    } catch {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [actionSearch, entityTypeFilter, currentPage]);

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, entityTypeFilter, fetchAuditLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchAuditLogs();
  };

  const handleReset = () => {
    setActionSearch('');
    setEntityTypeFilter('');
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-surface">
      <AdminNavbar currentTab="audit" />

      <main className="page-container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2 tracking-tight">
                <History className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Audit Trail & Compliance
              </h1>
              {logsPage && (
                <span className="badge badge-blue">
                  {logsPage.totalElements} Entries
                </span>
              )}
            </div>
            <p className="text-sm text-muted mt-0.5">
              Immutable chronological log of hospital system actions and administrative operations
            </p>
          </div>
        </div>

        {/* Filter Card */}
        <div className="card p-5 bg-card border border-border">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-foreground">
            <Filter className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>Filter Audit Trail</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label htmlFor="audit-action-search" className="label text-xs mb-1">Action Keyword</label>
              <Input
                id="audit-action-search"
                placeholder="Search action keyword (e.g. APPOINTMENT, DOCTOR, USER)..."
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-muted" />}
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="audit-entity-filter" className="label text-xs mb-1">Entity Type</label>
              <select
                id="audit-entity-filter"
                aria-label="Filter by Entity Type"
                className="input-field"
                value={entityTypeFilter}
                onChange={(e) => {
                  setEntityTypeFilter(e.target.value);
                  setCurrentPage(0);
                }}
              >
                <option value="">All Entities</option>
                <option value="APPOINTMENT">APPOINTMENT</option>
                <option value="CONSULTATION">CONSULTATION</option>
                <option value="PRESCRIPTION">PRESCRIPTION</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="USER">USER</option>
                <option value="AUTH">AUTH</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex items-end gap-2">
              <Button type="submit" variant="primary" className="flex-1">
                Filter Logs
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="text-muted hover:text-foreground"
                title="Reset filters"
                aria-label="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Logs Table */}
        <div className="card overflow-hidden bg-card border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-border text-muted font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">Timestamp</th>
                  <th scope="col" className="py-3 px-4">Action</th>
                  <th scope="col" className="py-3 px-4">Actor</th>
                  <th scope="col" className="py-3 px-4">Target Entity</th>
                  <th scope="col" className="py-3 px-4">IP Address</th>
                  <th scope="col" className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={6} />
                  ))
                ) : !logsPage || logsPage.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <EmptyState
                        icon={<History className="w-8 h-8 text-muted" />}
                        title="No audit records match your filters"
                        description="Try broadening your search term or selecting all entity types."
                      />
                    </td>
                  </tr>
                ) : (
                  logsPage.content.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-foreground bg-surface border border-border px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{log.actorEmail || 'System / Anonymous'}</p>
                        {log.userId && (
                          <span className="text-[10px] text-muted font-mono">UID: #{log.userId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {log.entityType ? (
                          <span className="text-muted">
                            {log.entityType} {log.entityId ? `(#${log.entityId})` : ''}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted">
                        {log.ipAddress || 'internal'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
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
          {logsPage && logsPage.totalPages > 1 && (
            <div className="p-4 bg-surface border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted">
                Page <span className="font-semibold text-foreground">{logsPage.number + 1}</span> of{' '}
                <span className="font-semibold text-foreground">{logsPage.totalPages}</span> ({logsPage.totalElements} records)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={logsPage.first}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={logsPage.last}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Details Modal */}
        <AnimatePresence>
          {selectedLog && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
              role="dialog"
              aria-modal="true"
              aria-labelledby="audit-log-details-title"
            >
              <motion.div
                ref={modalRef}
                tabIndex={-1}
                className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-modal border border-border focus:outline-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 id="audit-log-details-title" className="font-display font-bold text-foreground text-base">
                      Audit Log Entry #{selectedLog.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                    aria-label="Close audit log details dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-surface rounded-xl border border-border">
                    <div>
                      <span className="text-muted block font-medium">Action</span>
                      <span className="font-mono font-bold text-foreground mt-0.5 block">{selectedLog.action}</span>
                    </div>
                    <div>
                      <span className="text-muted block font-medium">Timestamp</span>
                      <span className="font-mono text-muted mt-0.5 block">{formatDateTime(selectedLog.createdAt)}</span>
                    </div>
                  </div>

                  <div className="p-3 border border-border rounded-xl space-y-1 bg-card">
                    <span className="text-muted block font-semibold uppercase tracking-wider text-[11px]">Actor Identity</span>
                    <p className="font-semibold text-foreground">{selectedLog.actorEmail || 'System / Internal'}</p>
                    <p className="text-muted font-mono text-[11px]">User ID: {selectedLog.userId || 'N/A'}</p>
                    <p className="text-muted font-mono text-[11px]">IP Address: {selectedLog.ipAddress || 'Internal runtime'}</p>
                  </div>

                  <div>
                    <span className="text-muted font-semibold block mb-1 uppercase tracking-wider text-[11px]">Details Payload</span>
                    <pre className="p-3 bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-200 border border-border rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                      {selectedLog.details || 'No additional metadata provided.'}
                    </pre>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex justify-end">
                  <Button variant="secondary" onClick={() => setSelectedLog(null)}>
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
