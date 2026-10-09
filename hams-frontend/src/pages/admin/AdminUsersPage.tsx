import { useState, useEffect } from 'react';
import {
  UsersRound, Search, CircleCheck, CircleX,
  ChevronLeft, ChevronRight, AlertTriangle, X, Filter
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminUserItem, Role, PageResponse } from '../../types';
import { formatDate } from '../../lib/utils';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import { AdminNavbar } from '../../components/layout/AdminNavbar';
import { useModalA11y } from '../../lib/useModalA11y';
import toast from 'react-hot-toast';

export function AdminUsersPage() {
  const [usersPage, setUsersPage] = useState<PageResponse<AdminUserItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Status toggle confirmation modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  const modalRef = useModalA11y({
    isOpen: confirmModalOpen && !!selectedUser,
    onClose: () => {
      setConfirmModalOpen(false);
      setSelectedUser(null);
    },
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const activeParam = activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined;
      const data = await adminApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        active: activeParam,
        page: currentPage,
        size: 15,
      });
      setUsersPage(data);
    } catch (err) {
      toast.error(extractApiError(err) || 'Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, activeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setActiveFilter('');
    setCurrentPage(0);
  };

  const handleToggleStatusClick = (user: AdminUserItem) => {
    setSelectedUser(user);
    setConfirmModalOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      const updated = await adminApi.updateUserStatus(selectedUser.id, !selectedUser.active);
      toast.success(`User status updated to ${updated.active ? 'ACTIVE' : 'INACTIVE'}`);
      setUsersPage((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          content: prev.content.map((u) => (u.id === updated.id ? updated : u)),
        };
      });
      setConfirmModalOpen(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      toast.error(extractApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'amber';
      case 'DOCTOR': return 'blue';
      case 'PATIENT': return 'green';
      default: return 'gray';
    }
  };

  const isFiltered = search.trim() !== '' || roleFilter !== '' || activeFilter !== '';

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <AdminNavbar currentTab="users" />

      <main className="page-container py-8 max-w-7xl flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
                <UsersRound className="w-6 h-6 text-primary" />
                User Management
              </h1>
              <Badge variant="blue">System Directory</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Centralized administrative registry of patients, verified clinicians, and system administrators
            </p>
          </div>

          {usersPage && (
            <div className="flex items-center gap-2 text-xs text-muted font-mono bg-card px-3 py-1.5 rounded-xl border border-border">
              <span>Total Accounts:</span>
              <strong className="text-foreground">{usersPage.totalElements}</strong>
            </div>
          )}
        </div>

        {/* Filters Card */}
        <div className="card p-4 bg-card border border-border shadow-subtle">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <Input
                placeholder="Search by name or email address..."
                aria-label="Search by name or email address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-muted" />}
              />
            </div>
            <div className="sm:col-span-3">
              <select
                aria-label="Filter by Role"
                className="input-field text-xs sm:text-sm"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as Role | '');
                  setCurrentPage(0);
                }}
              >
                <option value="">All Roles (Patients, Doctors, Admins)</option>
                <option value="PATIENT">Patients Only</option>
                <option value="DOCTOR">Doctors Only</option>
                <option value="ADMIN">Administrators Only</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <select
                aria-label="Filter by Account Status"
                className="input-field text-xs sm:text-sm"
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setCurrentPage(0);
                }}
              >
                <option value="">All Statuses</option>
                <option value="true">Active Accounts Only</option>
                <option value="false">Inactive Accounts Only</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <Button type="submit" variant="primary" className="flex-1 text-xs" leftIcon={<Filter className="w-3.5 h-3.5" />}>
                Filter
              </Button>
              {isFiltered && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="p-2 text-muted hover:text-foreground"
                  title="Clear all filters"
                  aria-label="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden bg-card border border-border shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-secondary/70 border-b border-border text-xs text-muted font-semibold">
                <tr>
                  <th scope="col" className="py-3 px-4">User</th>
                  <th scope="col" className="py-3 px-4">System Role</th>
                  <th scope="col" className="py-3 px-4">Account Status</th>
                  <th scope="col" className="py-3 px-4">Registered Date</th>
                  <th scope="col" className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={5} />
                  ))
                ) : !usersPage || usersPage.content.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <EmptyState
                        icon={<UsersRound className="w-8 h-8 text-muted" />}
                        title="No users found"
                        description="Try adjusting your search criteria or role filters."
                      />
                    </td>
                  </tr>
                ) : (
                  usersPage.content.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-secondary/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-surface-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground flex-shrink-0">
                            {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{item.name}</p>
                            <p className="text-xs text-muted font-mono">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getRoleBadgeVariant(item.role)} dot>
                          {item.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CircleCheck className="w-4 h-4" />
                            Active Account
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
                            <CircleX className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={item.active ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatusClick(item)}
                        >
                          {item.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersPage && usersPage.totalPages > 1 && (
            <div className="p-4 bg-surface-secondary/50 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-muted">
                Page <span className="font-semibold text-foreground">{usersPage.number + 1}</span> of{' '}
                <span className="font-semibold text-foreground">{usersPage.totalPages}</span> ({usersPage.totalElements} users)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={usersPage.first}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={usersPage.last}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmModalOpen && selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-status-modal-title"
          >
            <div
              ref={modalRef}
              tabIndex={-1}
              className="bg-card rounded-2xl max-w-md w-full p-6 shadow-modal border border-border focus:outline-none"
            >
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 id="confirm-status-modal-title" className="font-display font-bold text-foreground text-lg">
                  {selectedUser.active ? 'Deactivate User Account?' : 'Activate User Account?'}
                </h3>
              </div>

              <p className="text-sm text-muted leading-relaxed mb-4">
                Are you sure you want to {selectedUser.active ? 'deactivate' : 'activate'} the account for{' '}
                <span className="font-semibold text-foreground">{selectedUser.name}</span> ({selectedUser.email})?
              </p>

              {selectedUser.active ? (
                <div className="p-3 bg-surface-secondary border border-border rounded-xl mb-4 text-xs text-muted">
                  The user will immediately be barred from signing in and accessing clinical workspaces until an administrator reactivates the account.
                </div>
              ) : null}

              {selectedUser.role === 'ADMIN' && selectedUser.active && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl mb-4 text-xs text-rose-700 dark:text-rose-300">
                  Important: Self-deactivation and deactivating the last active administrator are blocked by backend safeguards.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setConfirmModalOpen(false);
                    setSelectedUser(null);
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  variant={selectedUser.active ? 'danger' : 'primary'}
                  onClick={handleConfirmStatusToggle}
                  isLoading={updating}
                  loadingText={selectedUser.active ? 'Deactivating...' : 'Activating...'}
                >
                  {selectedUser.active ? 'Yes, Deactivate' : 'Yes, Activate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
