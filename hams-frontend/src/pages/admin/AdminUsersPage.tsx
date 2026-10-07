import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, ArrowLeft,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminUserItem, Role, PageResponse } from '../../types';
import { formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export function AdminUsersPage() {
  const navigate = useNavigate();
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
    } catch {
      toast.error('Failed to load users list.');
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
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to update user status.';
      toast.error(msg);
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
                <Users className="w-6 h-6 text-primary-600" />
                User Management
              </h1>
              <p className="text-xs text-muted mt-0.5">
                Centralized registry of patients, doctors, and administrators
              </p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <Input
                placeholder="Search by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-muted" />}
              />
            </div>
            <div className="sm:col-span-3">
              <select
                aria-label="Filter by Role"
                className="input-field"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as Role | '');
                  setCurrentPage(0);
                }}
              >
                <option value="">All Roles</option>
                <option value="PATIENT">Patients</option>
                <option value="DOCTOR">Doctors</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <select
                aria-label="Filter by Account Status"
                className="input-field"
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setCurrentPage(0);
                }}
              >
                <option value="">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <Button type="submit" variant="primary" className="w-full">
                Filter
              </Button>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-border text-xs text-muted font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={5} />
                  ))
                ) : !usersPage || usersPage.content.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <EmptyState
                        icon={<Users className="w-8 h-8 text-muted" />}
                        title="No users found"
                        description="Try adjusting your search criteria or role filters."
                      />
                    </td>
                  </tr>
                ) : (
                  usersPage.content.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-navy text-sm">{item.name}</p>
                          <p className="text-xs text-muted font-mono">{item.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getRoleBadgeVariant(item.role)} dot>
                          {item.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-medical-green">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-medical-red">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
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
            <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted">
                Page <span className="font-semibold text-navy">{usersPage.number + 1}</span> of{' '}
                <span className="font-semibold text-navy">{usersPage.totalPages}</span> ({usersPage.totalElements} users)
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-border">
              <div className="flex items-center gap-3 mb-4 text-amber-600">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-navy text-lg">
                  {selectedUser.active ? 'Deactivate User Account?' : 'Activate User Account?'}
                </h3>
              </div>

              <p className="text-sm text-muted leading-relaxed mb-4">
                Are you sure you want to {selectedUser.active ? 'deactivate' : 'activate'} the account for{' '}
                <span className="font-semibold text-navy">{selectedUser.name}</span> ({selectedUser.email})?
              </p>

              {selectedUser.role === 'ADMIN' && selectedUser.active && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4 text-xs text-rose-700">
                  Important: Self-deactivation and deactivating the last administrative account are strictly blocked by system safeguards.
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
                >
                  {selectedUser.active ? 'Yes, Deactivate' : 'Yes, Activate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
