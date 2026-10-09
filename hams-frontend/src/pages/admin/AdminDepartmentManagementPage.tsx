import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Edit, CheckCircle2,
  AlertTriangle, X, Power, Users, Heart, Brain, Bone, Baby,
  Eye, Stethoscope, Activity, Shield, Ear, Scan, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, type DepartmentPayload } from '../../api/admin';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { extractApiError } from '../../api/client';
import type { Department } from '../../types';
import { AdminNavbar } from '../../components/layout/AdminNavbar';

export function AdminDepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    department: Department | null;
  }>({
    isOpen: false,
    department: null,
  });

  const [form, setForm] = useState<DepartmentPayload>({
    name: '',
    description: '',
    icon: 'activity',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Keyboard escape listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (createModalOpen) setCreateModalOpen(false);
        if (editDept) setEditDept(null);
        if (confirmDialog.isOpen) setConfirmDialog({ isOpen: false, department: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createModalOpen, editDept, confirmDialog.isOpen]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Department name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.createDepartment({
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        icon: form.icon?.trim() || 'activity',
      });
      toast.success('Department created successfully!');
      setCreateModalOpen(false);
      setForm({ name: '', description: '', icon: 'activity' });
      fetchDepartments();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept) return;
    if (!form.name.trim()) {
      toast.error('Department name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.updateDepartment(editDept.id, {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        icon: form.icon?.trim() || 'activity',
      });
      toast.success('Department updated successfully!');
      setEditDept(null);
      fetchDepartments();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (dept: Department) => {
    setEditDept(dept);
    setForm({
      name: dept.name,
      description: dept.description || '',
      icon: dept.icon || 'activity',
    });
  };

  const handleToggleStatus = async () => {
    if (!confirmDialog.department) return;
    setIsSubmitting(true);
    const dept = confirmDialog.department;
    try {
      const newStatus = !dept.active;
      await adminApi.toggleDepartmentStatus(dept.id, newStatus);
      toast.success(`${dept.name} department ${newStatus ? 'activated' : 'deactivated'}`);
      setConfirmDialog({ isOpen: false, department: null });
      fetchDepartments();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeptIcon = (iconName?: string) => {
    const icon = iconName?.toLowerCase();
    switch (icon) {
      case 'heart': return <Heart className="w-5 h-5 text-red-500" />;
      case 'brain': return <Brain className="w-5 h-5 text-purple-500" />;
      case 'bone': return <Bone className="w-5 h-5 text-amber-500" />;
      case 'baby': return <Baby className="w-5 h-5 text-pink-500" />;
      case 'eye': return <Eye className="w-5 h-5 text-teal-500" />;
      case 'stethoscope': return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case 'shield': return <Shield className="w-5 h-5 text-emerald-500" />;
      case 'ear': return <Ear className="w-5 h-5 text-amber-600" />;
      case 'scan': return <Scan className="w-5 h-5 text-indigo-500" />;
      default: return <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
    }
  };

  const activeCount = departments.filter(d => d.active).length;
  const totalDoctors = departments.reduce((acc, d) => acc + (d.doctorCount || 0), 0);

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && dept.active) ||
      (statusFilter === 'inactive' && !dept.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-surface">
      <AdminNavbar currentTab="departments" />

      <main className="page-container py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-foreground text-2xl tracking-tight">
                Hospital Departments
              </h1>
              <Badge variant="blue">{departments.length} Units</Badge>
            </div>
            <p className="text-sm text-muted mt-0.5">
              Configure medical divisions, specialties, doctor capacities, and public booking availability
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setForm({ name: '', description: '', icon: 'activity' });
              setCreateModalOpen(true);
            }}
          >
            Add Department
          </Button>
        </div>

        {/* Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 bg-card border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Total Departments</p>
              <p className="text-2xl font-display font-bold text-foreground mt-0.5">{departments.length}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 bg-card border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Active Clinical Units</p>
              <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="card p-5 bg-card border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Assigned Doctors</p>
              <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400 mt-0.5">{totalDoctors}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="card p-4 bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search departments or specialties..."
              aria-label="Search departments or specialties"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-muted" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="dept-status-filter" className="text-xs text-muted font-medium whitespace-nowrap">Filter Status:</label>
            <select
              id="dept-status-filter"
              aria-label="Filter status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="input-field py-1.5 text-xs w-full sm:w-36"
            >
              <option value="all">All Departments</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Departments Grid */}
        {isLoading ? (
          <div className="card p-12 text-center bg-card border border-border">
            <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">Loading department list...</p>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="card p-12 text-center bg-card border border-border">
            <Building2 className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-base mb-1">No departments found</h3>
            <p className="text-sm text-muted mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filter status.'
                : 'Add your hospital\'s medical departments to get started.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
              >
                Add First Department
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepartments.map(dept => (
              <motion.div
                key={dept.id}
                className={`card p-5 relative border bg-card transition-all ${
                  dept.active ? 'border-border' : 'border-rose-200 dark:border-rose-900/40 opacity-80'
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface border border-border flex items-center justify-center shadow-xs">
                      {getDeptIcon(dept.icon)}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-base leading-snug">
                        {dept.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-muted" />
                        <span className="text-xs text-muted font-medium">
                          {dept.doctorCount || 0} {dept.doctorCount === 1 ? 'Doctor' : 'Doctors'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {dept.active ? (
                      <span className="badge badge-green text-xs font-semibold">Active</span>
                    ) : (
                      <span className="badge badge-red text-xs font-semibold">Inactive</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                  {dept.description || 'General specialized clinical care department.'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button
                    onClick={() => openEdit(dept)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Details
                  </button>

                  <button
                    onClick={() => setConfirmDialog({ isOpen: true, department: dept })}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      dept.active
                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {dept.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-dept-title"
          >
            <motion.div
              className="card bg-card border border-border p-6 sm:p-8 max-w-md w-full shadow-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <h3 id="create-dept-title" className="font-display font-bold text-foreground text-lg">
                    Create Department
                  </h3>
                  <p className="text-xs text-muted">Add a new medical specialty division</p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <Input
                  label="Department Name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Oncology"
                  required
                />

                <div>
                  <label htmlFor="create-dept-icon" className="label">Icon Style</label>
                  <select
                    id="create-dept-icon"
                    value={form.icon || 'activity'}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    className="input-field"
                  >
                    <option value="heart">Heart (Cardiology)</option>
                    <option value="brain">Brain (Neurology / Psychiatry)</option>
                    <option value="bone">Bone (Orthopedics)</option>
                    <option value="baby">Baby (Pediatrics)</option>
                    <option value="eye">Eye (Ophthalmology)</option>
                    <option value="shield">Shield (Dermatology)</option>
                    <option value="stethoscope">Stethoscope (General Medicine)</option>
                    <option value="ear">Ear (ENT)</option>
                    <option value="scan">Scan (Radiology)</option>
                    <option value="activity">Activity (General / Other)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="create-dept-desc" className="label">Description</label>
                  <textarea
                    id="create-dept-desc"
                    rows={3}
                    className="input-field"
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Description of the department's specialties..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCreateModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Save Department
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editDept && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dept-title"
          >
            <motion.div
              className="card bg-card border border-border p-6 sm:p-8 max-w-md w-full shadow-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <h3 id="edit-dept-title" className="font-display font-bold text-foreground text-lg">
                    Edit {editDept.name}
                  </h3>
                  <p className="text-xs text-muted">Update department configuration</p>
                </div>
                <button
                  onClick={() => setEditDept(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input
                  label="Department Name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />

                <div>
                  <label htmlFor="edit-dept-icon" className="label">Icon Style</label>
                  <select
                    id="edit-dept-icon"
                    value={form.icon || 'activity'}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    className="input-field"
                  >
                    <option value="heart">Heart (Cardiology)</option>
                    <option value="brain">Brain (Neurology / Psychiatry)</option>
                    <option value="bone">Bone (Orthopedics)</option>
                    <option value="baby">Baby (Pediatrics)</option>
                    <option value="eye">Eye (Ophthalmology)</option>
                    <option value="shield">Shield (Dermatology)</option>
                    <option value="stethoscope">Stethoscope (General Medicine)</option>
                    <option value="ear">Ear (ENT)</option>
                    <option value="scan">Scan (Radiology)</option>
                    <option value="activity">Activity (General / Other)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-dept-desc" className="label">Description</label>
                  <textarea
                    id="edit-dept-desc"
                    rows={3}
                    className="input-field"
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditDept(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Update Department
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM STATUS TOGGLE MODAL */}
      <AnimatePresence>
        {confirmDialog.isOpen && confirmDialog.department && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-status-title"
          >
            <motion.div
              className="card bg-card border border-border p-6 max-w-md w-full shadow-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  confirmDialog.department.active
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="confirm-status-title" className="font-display font-bold text-foreground text-lg">
                    {confirmDialog.department.active ? 'Deactivate Department?' : 'Activate Department?'}
                  </h3>
                  <p className="text-xs text-muted">Action Confirmation Required</p>
                </div>
              </div>

              <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                {confirmDialog.department.active ? (
                  <>Are you sure you want to deactivate the <strong>{confirmDialog.department.name}</strong> department? Patients will not be able to select this department when booking new appointments.</>
                ) : (
                  <>Reactivate the <strong>{confirmDialog.department.name}</strong> department and resume public patient appointment bookings?</>
                )}
              </p>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDialog({ isOpen: false, department: null })}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmDialog.department.active ? 'danger' : 'primary'}
                  onClick={handleToggleStatus}
                  isLoading={isSubmitting}
                >
                  Confirm {confirmDialog.department.active ? 'Deactivation' : 'Activation'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
