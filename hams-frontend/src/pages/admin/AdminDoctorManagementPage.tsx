import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, CheckCircle2, XCircle, Ban, RefreshCw,
  Stethoscope, Edit, Eye, AlertTriangle, X, CalendarDays, Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminApi,
  type CreateDoctorPayload,
  type AdminUpdateDoctorPayload,
  type DoctorSearchParams
} from '../../api/admin';
import { scheduleApi } from '../../api/schedule';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { extractApiError } from '../../api/client';
import { AdminNavbar } from '../../components/layout/AdminNavbar';
import type { Doctor, Department, VerificationStatus, DoctorSchedule } from '../../types';

export function AdminDoctorManagementPage() {
  // Data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalDoctor, setEditModalDoctor] = useState<Doctor | null>(null);
  const [viewModalDoctor, setViewModalDoctor] = useState<Doctor | null>(null);
  const [docSchedule, setDocSchedule] = useState<DoctorSchedule | null>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'verify' | 'reject' | 'deactivate' | 'activate';
    doctor: Doctor | null;
  }>({
    isOpen: false,
    type: 'verify',
    doctor: null,
  });

  // Action loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState<CreateDoctorPayload>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    departmentId: 0,
    specialization: '',
    qualification: '',
    experienceYears: 1,
    consultationFee: 500,
    bio: '',
    phone: '',
    registrationNumber: '',
    verified: false,
  });

  // Edit Form State
  const [editForm, setEditForm] = useState<AdminUpdateDoctorPayload>({
    firstName: '',
    lastName: '',
    departmentId: undefined,
    specialization: '',
    qualification: '',
    experienceYears: undefined,
    consultationFee: undefined,
    bio: '',
    phone: '',
    registrationNumber: '',
    active: true,
    verificationStatus: 'PENDING',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [search, selectedDept, selectedStatus, activeFilter]);

  useEffect(() => {
    if (viewModalDoctor) {
      scheduleApi.getDoctorSchedule(viewModalDoctor.id)
        .then(setDocSchedule)
        .catch(() => setDocSchedule(null));
    }
  }, [viewModalDoctor]);

  // Escape key handler for open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDialog.isOpen) setConfirmDialog({ isOpen: false, type: 'verify', doctor: null });
        else if (createModalOpen) setCreateModalOpen(false);
        else if (editModalDoctor) setEditModalDoctor(null);
        else if (viewModalDoctor) setViewModalDoctor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog.isOpen, createModalOpen, editModalDoctor, viewModalDoctor]);

  const fetchDepartments = async () => {
    try {
      const data = await adminApi.getDepartments();
      setDepartments(data);
      if (data.length > 0 && createForm.departmentId === 0) {
        setCreateForm(prev => ({ ...prev, departmentId: data[0].id }));
      }
    } catch {
      // Non-blocking
    }
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const params: DoctorSearchParams = {
        search: search.trim() || undefined,
        departmentId: selectedDept,
        verificationStatus: selectedStatus,
        active: activeFilter,
        page: 0,
        size: 50,
      };
      const response = await adminApi.getDoctors(params);
      setDoctors(response.content);
      setTotalElements(response.totalElements);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.departmentId) {
      toast.error('Please select a department');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.createDoctor({
        ...createForm,
        email: createForm.email.trim(),
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        specialization: createForm.specialization.trim(),
        qualification: createForm.qualification?.trim() || undefined,
        bio: createForm.bio?.trim() || undefined,
        phone: createForm.phone?.trim() || undefined,
        registrationNumber: createForm.registrationNumber?.trim() || undefined,
      });
      toast.success('Doctor account created successfully!');
      setCreateModalOpen(false);
      fetchDoctors();
      setCreateForm({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        departmentId: departments[0]?.id || 0,
        specialization: '',
        qualification: '',
        experienceYears: 1,
        consultationFee: 500,
        bio: '',
        phone: '',
        registrationNumber: '',
        verified: false,
      });
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (doctor: Doctor) => {
    setEditModalDoctor(doctor);
    setEditForm({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      departmentId: doctor.departmentId,
      specialization: doctor.specialization,
      qualification: doctor.qualification || '',
      experienceYears: doctor.experienceYears,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio || '',
      phone: doctor.phone || '',
      registrationNumber: doctor.registrationNumber || '',
      active: doctor.active,
      verificationStatus: doctor.verificationStatus,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalDoctor) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateDoctor(editModalDoctor.id, {
        ...editForm,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        specialization: editForm.specialization.trim(),
        qualification: editForm.qualification?.trim() || undefined,
        bio: editForm.bio?.trim() || undefined,
        phone: editForm.phone?.trim() || undefined,
        registrationNumber: editForm.registrationNumber?.trim() || undefined,
      });
      toast.success('Doctor profile updated successfully!');
      setEditModalDoctor(null);
      fetchDoctors();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirm = (type: 'verify' | 'reject' | 'deactivate' | 'activate', doctor: Doctor) => {
    setConfirmDialog({ isOpen: true, type, doctor });
  };

  const handleExecuteAction = async () => {
    if (!confirmDialog.doctor) return;
    const docId = confirmDialog.doctor.id;
    setIsSubmitting(true);
    try {
      switch (confirmDialog.type) {
        case 'verify':
          await adminApi.verifyDoctor(docId);
          toast.success(`Dr. ${confirmDialog.doctor.fullName} verified and approved!`);
          break;
        case 'reject':
          await adminApi.rejectDoctor(docId);
          toast.success(`Dr. ${confirmDialog.doctor.fullName} credentials rejected.`);
          break;
        case 'deactivate':
          await adminApi.deactivateDoctor(docId);
          toast.success(`Dr. ${confirmDialog.doctor.fullName} deactivated.`);
          break;
        case 'activate':
          await adminApi.activateDoctor(docId);
          toast.success(`Dr. ${confirmDialog.doctor.fullName} reactivated.`);
          break;
      }
      setConfirmDialog({ isOpen: false, type: 'verify', doctor: null });
      fetchDoctors();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="green" dot>APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="amber" dot>PENDING</Badge>;
      case 'REJECTED':
        return <Badge variant="red" dot>REJECTED</Badge>;
      case 'NOT_SUBMITTED':
      default:
        return <Badge variant="gray" dot>NOT SUBMITTED</Badge>;
    }
  };

  const isFiltered = search.trim() !== '' || selectedDept !== undefined || selectedStatus !== undefined || activeFilter !== undefined;

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <AdminNavbar currentTab="doctors" />

      <main className="page-container py-8 space-y-6 max-w-7xl flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-foreground text-2xl flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-primary" />
                Doctor Management & Credential Verification
              </h1>
              <Badge variant="blue">{totalElements} Staff Members</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Verify practitioner medical licenses, onboard clinical practitioners, and manage medical privileges
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateModalOpen(true)}
            >
              Add Doctor
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card p-4 sm:p-5 bg-card border border-border shadow-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by doctor or specialty..."
                aria-label="Search by doctor or specialty"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 text-xs sm:text-sm"
              />
            </div>

            {/* Department */}
            <div className="lg:col-span-3">
              <select
                value={selectedDept !== undefined ? selectedDept : ''}
                onChange={e => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
                className="input-field text-xs sm:text-sm"
                aria-label="Filter by Department"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Status */}
            <div className="lg:col-span-3">
              <select
                value={selectedStatus !== undefined ? selectedStatus : ''}
                onChange={e => setSelectedStatus((e.target.value as VerificationStatus) || undefined)}
                className="input-field text-xs sm:text-sm"
                aria-label="Filter by Verification Status"
              >
                <option value="">All Verification States</option>
                <option value="APPROVED">APPROVED (Verified)</option>
                <option value="PENDING">PENDING Review</option>
                <option value="REJECTED">REJECTED</option>
                <option value="NOT_SUBMITTED">NOT SUBMITTED</option>
              </select>
            </div>

            {/* Active Status */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <select
                value={activeFilter !== undefined ? String(activeFilter) : ''}
                onChange={e => {
                  if (e.target.value === '') setActiveFilter(undefined);
                  else setActiveFilter(e.target.value === 'true');
                }}
                className="input-field text-xs sm:text-sm flex-1"
                aria-label="Filter by Active Account Status"
              >
                <option value="">All States</option>
                <option value="true">Active Staff</option>
                <option value="false">Deactivated</option>
              </select>
              {isFiltered && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSearch('');
                    setSelectedDept(undefined);
                    setSelectedStatus(undefined);
                    setActiveFilter(undefined);
                  }}
                  className="p-2 text-muted hover:text-foreground"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="card overflow-hidden bg-card border border-border shadow-subtle">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted">Loading medical practitioners...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-12 text-center">
              <Stethoscope className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="font-semibold text-foreground text-base mb-1">No doctors found</h3>
              <p className="text-sm text-muted mb-4">No doctor records matched your filter criteria.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedDept(undefined);
                  setSelectedStatus(undefined);
                  setActiveFilter(undefined);
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-secondary/70 border-b border-border text-xs uppercase font-semibold text-muted tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Doctor</th>
                    <th scope="col" className="py-3.5 px-4">Department & Specialty</th>
                    <th scope="col" className="py-3.5 px-4">Credentials & Fee</th>
                    <th scope="col" className="py-3.5 px-4">Verification</th>
                    <th scope="col" className="py-3.5 px-4">Account</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {doctors.map(doctor => (
                    <tr key={doctor.id} className="hover:bg-surface-secondary/40 transition-colors">
                      {/* Doctor Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                            {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              Dr. {doctor.fullName}
                              {doctor.verified && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                              )}
                            </div>
                            <div className="text-xs text-muted flex items-center gap-2">
                              <span>{doctor.email}</span>
                              {doctor.phone && <span>• {doctor.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Specialty */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-foreground">{doctor.departmentName || 'General'}</div>
                        <div className="text-xs text-primary font-medium">{doctor.specialization}</div>
                      </td>

                      {/* Credentials */}
                      <td className="py-4 px-4">
                        <div className="text-xs text-foreground font-medium">
                          {doctor.qualification || 'MBBS'}
                          {doctor.experienceYears ? ` (${doctor.experienceYears}y exp)` : ''}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          ₹{doctor.consultationFee || 0} / visit
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-4">
                        {renderStatusBadge(doctor.verificationStatus)}
                      </td>

                      {/* Account Active */}
                      <td className="py-4 px-4">
                        {doctor.active ? (
                          <Badge variant="green" dot>Active</Badge>
                        ) : (
                          <Badge variant="red" dot>Deactivated</Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewModalDoctor(doctor)}
                            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
                            title="View Doctor Details"
                            aria-label={`View details for Dr. ${doctor.fullName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(doctor)}
                            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-secondary transition-colors"
                            title="Edit Doctor Information"
                            aria-label={`Edit Dr. ${doctor.fullName}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Verify Button (if not already APPROVED) */}
                          {doctor.verificationStatus !== 'APPROVED' && (
                            <button
                              onClick={() => openConfirm('verify', doctor)}
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                              title="Verify & Approve Doctor"
                              aria-label={`Verify Dr. ${doctor.fullName}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject Button (if pending or not submitted) */}
                          {doctor.verificationStatus !== 'REJECTED' && (
                            <button
                              onClick={() => openConfirm('reject', doctor)}
                              className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                              title="Reject Credentials"
                              aria-label={`Reject Dr. ${doctor.fullName}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Deactivate / Reactivate */}
                          {doctor.active ? (
                            <button
                              onClick={() => openConfirm('deactivate', doctor)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Deactivate Doctor"
                              aria-label={`Deactivate Dr. ${doctor.fullName}`}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirm('activate', doctor)}
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                              title="Activate Doctor"
                              aria-label={`Activate Dr. ${doctor.fullName}`}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmDialog.isOpen && confirmDialog.doctor && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-doctor-action-heading"
          >
            <motion.div
              className="card bg-card border border-border p-6 max-w-md w-full shadow-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {confirmDialog.type === 'verify' && (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                {confirmDialog.type === 'reject' && (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
                {confirmDialog.type === 'deactivate' && (
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                    <Ban className="w-6 h-6" />
                  </div>
                )}
                {confirmDialog.type === 'activate' && (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 id="confirm-doctor-action-heading" className="font-display font-bold text-foreground text-lg">
                    {confirmDialog.type === 'verify' && 'Approve & Verify Doctor'}
                    {confirmDialog.type === 'reject' && 'Reject Doctor Credentials'}
                    {confirmDialog.type === 'deactivate' && 'Deactivate Doctor Account'}
                    {confirmDialog.type === 'activate' && 'Reactivate Doctor Account'}
                  </h3>
                  <p className="text-xs text-muted">Action Confirmation Required</p>
                </div>
              </div>

              <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                {confirmDialog.type === 'verify' && (
                  <>Are you sure you want to approve <strong>Dr. {confirmDialog.doctor.fullName}</strong>? This doctor will receive verified badge status and appear in public listings.</>
                )}
                {confirmDialog.type === 'reject' && (
                  <>Are you sure you want to reject credentials for <strong>Dr. {confirmDialog.doctor.fullName}</strong>? The verification status will become REJECTED.</>
                )}
                {confirmDialog.type === 'deactivate' && (
                  <>Are you sure you want to deactivate <strong>Dr. {confirmDialog.doctor.fullName}</strong>? The doctor will no longer be permitted to log in or accept appointments.</>
                )}
                {confirmDialog.type === 'activate' && (
                  <>Reactivate account for <strong>Dr. {confirmDialog.doctor.fullName}</strong>?</>
                )}
              </p>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDialog({ isOpen: false, type: 'verify', doctor: null })}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmDialog.type === 'deactivate' ? 'danger' : 'primary'}
                  onClick={handleExecuteAction}
                  isLoading={isSubmitting}
                >
                  Confirm Action
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE DOCTOR MODAL */}
      <AnimatePresence>
        {createModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-doctor-heading"
          >
            <motion.div
              className="card bg-card border border-border p-6 sm:p-8 max-w-2xl w-full my-8 shadow-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h3 id="create-doctor-heading" className="font-display font-bold text-foreground text-xl">Onboard New Doctor</h3>
                  <p className="text-xs text-muted">Create doctor user credentials and medical staff profile</p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                    placeholder="doctor@hospital.org"
                  />
                  <Input
                    label="Temporary Password"
                    type="password"
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    required
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={createForm.firstName}
                    onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })}
                    required
                    placeholder="e.g. Robert"
                  />
                  <Input
                    label="Last Name"
                    value={createForm.lastName}
                    onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })}
                    required
                    placeholder="e.g. Davis"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Department *</label>
                    <select
                      value={createForm.departmentId}
                      onChange={e => setCreateForm({ ...createForm, departmentId: Number(e.target.value) })}
                      className="input-field"
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Specialization"
                    value={createForm.specialization}
                    onChange={e => setCreateForm({ ...createForm, specialization: e.target.value })}
                    required
                    placeholder="e.g. Interventional Cardiology"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Qualifications"
                    value={createForm.qualification || ''}
                    onChange={e => setCreateForm({ ...createForm, qualification: e.target.value })}
                    placeholder="MD, DM Cardiology"
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    value={createForm.experienceYears || ''}
                    onChange={e => setCreateForm({ ...createForm, experienceYears: Number(e.target.value) })}
                    placeholder="10"
                  />
                  <Input
                    label="Consultation Fee (₹)"
                    type="number"
                    min="0"
                    value={createForm.consultationFee || ''}
                    onChange={e => setCreateForm({ ...createForm, consultationFee: Number(e.target.value) })}
                    placeholder="800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Phone"
                    value={createForm.phone || ''}
                    onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                  <Input
                    label="Medical License / Reg Number"
                    value={createForm.registrationNumber || ''}
                    onChange={e => setCreateForm({ ...createForm, registrationNumber: e.target.value })}
                    placeholder="MCI-12345"
                  />
                </div>

                <div>
                  <label className="label">Clinical Bio</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={createForm.bio || ''}
                    onChange={e => setCreateForm({ ...createForm, bio: e.target.value })}
                    placeholder="Summary of medical practice, expertise, and accomplishments..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="verifiedCheck"
                    checked={createForm.verified}
                    onChange={e => setCreateForm({ ...createForm, verified: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="verifiedCheck" className="text-sm font-medium text-foreground cursor-pointer">
                    Approve and verify credentials immediately (APPROVED status)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
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
                    Create Doctor Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DOCTOR MODAL */}
      <AnimatePresence>
        {editModalDoctor && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-doctor-heading"
          >
            <motion.div
              className="card bg-card border border-border p-6 sm:p-8 max-w-2xl w-full my-8 shadow-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <h3 id="edit-doctor-heading" className="font-display font-bold text-foreground text-xl">
                    Edit Dr. {editModalDoctor.fullName}
                  </h3>
                  <p className="text-xs text-muted">Update administrative records and credentials</p>
                </div>
                <button
                  onClick={() => setEditModalDoctor(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={editForm.firstName}
                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={editForm.lastName}
                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Department</label>
                    <select
                      value={editForm.departmentId || ''}
                      onChange={e => setEditForm({ ...editForm, departmentId: Number(e.target.value) })}
                      className="input-field"
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Specialization"
                    value={editForm.specialization}
                    onChange={e => setEditForm({ ...editForm, specialization: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Qualifications"
                    value={editForm.qualification || ''}
                    onChange={e => setEditForm({ ...editForm, qualification: e.target.value })}
                  />
                  <Input
                    label="Experience (Years)"
                    type="number"
                    min="0"
                    value={editForm.experienceYears !== undefined ? editForm.experienceYears : ''}
                    onChange={e => setEditForm({ ...editForm, experienceYears: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <Input
                    label="Consultation Fee (₹)"
                    type="number"
                    min="0"
                    value={editForm.consultationFee !== undefined ? editForm.consultationFee : ''}
                    onChange={e => setEditForm({ ...editForm, consultationFee: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                  <Input
                    label="Medical License / Reg Number"
                    value={editForm.registrationNumber || ''}
                    onChange={e => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Verification Status</label>
                    <select
                      value={editForm.verificationStatus || 'PENDING'}
                      onChange={e => setEditForm({ ...editForm, verificationStatus: e.target.value as VerificationStatus })}
                      className="input-field"
                    >
                      <option value="APPROVED">APPROVED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="NOT_SUBMITTED">NOT_SUBMITTED</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Account Status</label>
                    <select
                      value={String(editForm.active)}
                      onChange={e => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                      className="input-field"
                    >
                      <option value="true">Active Staff</option>
                      <option value="false">Deactivated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Clinical Bio</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={editForm.bio || ''}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditModalDoctor(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW DOCTOR MODAL */}
      <AnimatePresence>
        {viewModalDoctor && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-doctor-heading"
          >
            <motion.div
              className="card bg-card border border-border p-6 sm:p-8 max-w-lg w-full shadow-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-lg">
                    {viewModalDoctor.firstName.charAt(0)}{viewModalDoctor.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 id="view-doctor-heading" className="font-display font-bold text-foreground text-lg">Dr. {viewModalDoctor.fullName}</h3>
                    <p className="text-xs text-primary font-medium">{viewModalDoctor.specialization}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewModalDoctor(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted">Department</span>
                  <span className="font-semibold text-foreground">{viewModalDoctor.departmentName || 'General'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted">Verification Status</span>
                  <span>{renderStatusBadge(viewModalDoctor.verificationStatus)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted">Account Status</span>
                  <span>{viewModalDoctor.active ? <Badge variant="green" dot>Active</Badge> : <Badge variant="red" dot>Inactive</Badge>}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted">Email</span>
                  <span className="font-mono text-xs text-foreground">{viewModalDoctor.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted">Phone</span>
                  <span className="text-foreground">{viewModalDoctor.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted">Medical License</span>
                  <span className="font-mono text-xs text-foreground">{viewModalDoctor.registrationNumber || 'Pending'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted">Consultation Fee</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{viewModalDoctor.consultationFee || 0}</span>
                </div>
                <div className="pt-2">
                  <span className="text-xs text-muted block mb-1">Clinical Biography</span>
                  <p className="text-xs text-foreground/80 bg-surface-secondary p-3 rounded-xl border border-border leading-relaxed whitespace-pre-line">
                    {viewModalDoctor.bio || 'No clinical biography on file.'}
                  </p>
                </div>

                {docSchedule && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      Weekly Clinic Schedule & Breaks
                    </span>
                    <div className="bg-surface-secondary p-3 rounded-xl border border-border space-y-1.5 text-xs">
                      {docSchedule.schedule.filter(s => s.active).length === 0 ? (
                        <p className="text-muted italic">No active clinic hours configured.</p>
                      ) : (
                        docSchedule.schedule
                          .filter(s => s.active)
                          .map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                              <span className="font-semibold text-foreground w-14">{s.dayOfWeek.substring(0, 3)}</span>
                              <span className="text-muted font-mono">{s.startTime} — {s.endTime}</span>
                              <span className="text-primary font-medium">({s.slotDurationMins}m slots)</span>
                              {s.breaks && s.breaks.length > 0 && (
                                <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                  <Coffee className="w-2.5 h-2.5" />
                                  {s.breaks[0].startTime}-{s.breaks[0].endTime}
                                </span>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setViewModalDoctor(null)}>Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
