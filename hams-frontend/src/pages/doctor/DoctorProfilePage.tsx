import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Stethoscope, Phone, Mail, Award, Clock,
  DollarSign, CheckCircle2, AlertCircle, XCircle, ShieldCheck,
  Save, Building, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi, type UpdateDoctorProfilePayload } from '../../api/doctor';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { extractApiError } from '../../api/client';
import type { Doctor, VerificationStatus } from '../../types';

export function DoctorProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<UpdateDoctorProfilePayload>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    qualification: '',
    consultationFee: undefined,
    photoUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await doctorApi.getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        bio: data.bio || '',
        qualification: data.qualification || '',
        consultationFee: data.consultationFee !== undefined && data.consultationFee !== null ? Number(data.consultationFee) : undefined,
        photoUrl: data.photoUrl || '',
      });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'consultationFee' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await doctorApi.updateProfile({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
        qualification: form.qualification?.trim() || undefined,
        photoUrl: form.photoUrl?.trim() || undefined,
      });
      setProfile(updated);
      setIsEditing(false);
      toast.success('Doctor credentials & profile updated successfully!');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const renderVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="badge badge-green flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Practitioner
          </span>
        );
      case 'PENDING':
        return (
          <span className="badge badge-amber flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Verification Pending Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="badge badge-red flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Credentials Rejected
          </span>
        );
      case 'NOT_SUBMITTED':
      default:
        return (
          <span className="badge badge-gray flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Documents Not Submitted
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Loading doctor credentials & profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-6 bg-red-50 border border-red-200 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-900 mb-1">Failed to load doctor profile</h3>
            <p className="text-sm text-red-700 mb-4">{error || 'Profile not found'}</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={fetchProfile}>Try Again</Button>
              <Button variant="primary" onClick={() => navigate('/doctor/dashboard')}>Back to Dashboard</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="page-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/doctor/dashboard"
              className="p-2 rounded-xl text-muted hover:text-navy hover:bg-surface transition-colors"
              title="Return to Doctor Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-navy text-xl">Doctor Professional Profile</h1>
                {renderVerificationBadge(profile.verificationStatus)}
              </div>
              <p className="text-xs text-muted">Clinical credentials, specialization, and doctor details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="page-container py-8 max-w-5xl">
        {/* Verification Status Banner */}
        {profile.verificationStatus === 'APPROVED' ? (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Licensed & Approved Medical Practitioner:</span> Your credentials have been officially verified by hospital administration. Your profile is visible in public doctor listings.
            </div>
          </div>
        ) : profile.verificationStatus === 'PENDING' ? (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Verification Pending:</span> Hospital administration is reviewing your clinical qualifications and license. Public listings will activate upon approval.
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Verification Notice:</span> Please contact hospital administration to update your medical credentials and license records.
            </div>
          </div>
        )}

        {/* Profile Card Header */}
        <motion.div
          className="card p-6 sm:p-8 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar / Photo */}
            <div className="relative">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center text-emerald-600 shadow-sm">
                  <Stethoscope className="w-10 h-10 mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">M.D.</span>
                </div>
              )}
              {profile.verified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white"
                  title="Verified Doctor"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Profile Info Summary */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <div>
                  <h2 className="font-display font-bold text-navy text-2xl">
                    Dr. {profile.fullName}
                  </h2>
                  <p className="text-primary-600 font-semibold text-sm">
                    {profile.specialization}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
                  <Badge variant="blue">{profile.departmentName || 'General Medicine'}</Badge>
                  {profile.active ? (
                    <Badge variant="green" dot>Active Staff</Badge>
                  ) : (
                    <Badge variant="red" dot>Inactive</Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-navy/50" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-navy/50" />
                  {profile.phone || 'Phone not set'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-navy/50" />
                  {profile.experienceYears ? `${profile.experienceYears} Years Experience` : 'Experience unspecified'}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-navy/50" />
                  Consultation Fee: {profile.consultationFee ? `₹${profile.consultationFee}` : 'Free / Not set'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* View / Edit Mode */}
        {isEditing ? (
          <form onSubmit={handleSave}>
            <motion.div
              className="card p-6 sm:p-8 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">Edit Professional Details</h3>
                  <p className="text-xs text-muted">Update your permitted profile information and consultation charges</p>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>

              {/* Personal Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={form.phone || ''}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Profile Photo URL"
                  name="photoUrl"
                  value={form.photoUrl || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Consultation Fee & Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Consultation Fee (₹)"
                  name="consultationFee"
                  type="number"
                  min="0"
                  step="50"
                  value={form.consultationFee !== undefined ? form.consultationFee : ''}
                  onChange={handleChange}
                  placeholder="500"
                />
                <Input
                  label="Qualifications & Degrees"
                  name="qualification"
                  value={form.qualification || ''}
                  onChange={handleChange}
                  placeholder="MBBS, MD - Internal Medicine"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="label">Professional Bio & Clinical Background</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={form.bio || ''}
                  onChange={handleChange}
                  placeholder="Share a brief overview of your clinical experience, specializations, and patient care philosophy..."
                  className="input-field"
                />
              </div>

              {/* Read-only Administrator Fields Notice */}
              <div className="p-4 bg-surface border border-border rounded-xl">
                <p className="text-xs font-semibold text-navy mb-1">Administrative & Fixed Clinical Fields</p>
                <p className="text-xs text-muted mb-3">
                  Department, License Registration Number, and Verification Status are strictly controlled by Hospital Administration to protect credential integrity.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-border">
                    <span className="text-muted block">Department</span>
                    <span className="font-semibold text-navy">{profile.departmentName || 'N/A'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-border">
                    <span className="text-muted block">Specialization</span>
                    <span className="font-semibold text-navy">{profile.specialization}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-border">
                    <span className="text-muted block">License / Registration</span>
                    <span className="font-semibold text-navy">{profile.registrationNumber || 'Pending Filing'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile
                </Button>
              </div>
            </motion.div>
          </form>
        ) : (
          /* Profile Details Display */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Clinical Overview & Bio */}
            <div className="lg:col-span-2 space-y-6">
              {/* Clinical Overview */}
              <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border">
                  <Stethoscope className="w-5 h-5 text-primary-600" />
                  <h3 className="font-display font-semibold text-navy">Clinical Qualifications</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted block mb-1">Medical Department</span>
                    <span className="font-semibold text-navy flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-primary-600" />
                      {profile.departmentName || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Specialization</span>
                    <span className="font-semibold text-navy">{profile.specialization}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Degrees & Certifications</span>
                    <span className="font-semibold text-navy">{profile.qualification || 'MBBS'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Clinical Experience</span>
                    <span className="font-semibold text-navy">{profile.experienceYears ? `${profile.experienceYears} Years` : 'N/A'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Bio & Patient Care */}
              <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="font-display font-semibold text-navy">About Doctor & Clinical Practice</h3>
                </div>
                <p className="text-sm text-navy/80 leading-relaxed whitespace-pre-line">
                  {profile.bio || 'No clinical biography provided. Click "Edit Profile" to add your introduction and medical approach.'}
                </p>
              </motion.div>
            </div>

            {/* Right 1 Col: Credentials & Practice Meta */}
            <div className="space-y-6">
              <motion.div
                className="card p-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-display font-semibold text-navy">Practice & License</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs text-muted block mb-1">License / Reg. Number</span>
                    <span className="font-mono text-xs bg-surface px-2.5 py-1 rounded-lg border border-border inline-block text-navy">
                      {profile.registrationNumber || 'MCI-PENDING'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Standard Consultation Fee</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {profile.consultationFee ? `₹${profile.consultationFee}` : '₹0 (Free consultation)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Account & Role</span>
                    <span className="badge badge-green font-mono">ROLE_DOCTOR</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block mb-1">Registered Since</span>
                    <span className="text-xs text-muted">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
