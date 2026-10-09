import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserRound, Phone, MapPin, Heart, AlertCircle,
  Save, Shield, Calendar, Edit3, X, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi, type UpdatePatientProfilePayload } from '../../api/patient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ProfileSkeleton } from '../../components/ui/LoadingSkeleton';
import { extractApiError } from '../../api/client';
import type { Patient } from '../../types';
import { PatientNavbar } from '../../components/layout/PatientNavbar';

export function PatientProfilePage() {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<UpdatePatientProfilePayload>({
    firstName: '',
    lastName: '',
    phone: '',
    gender: undefined,
    dateOfBirth: '',
    address: '',
    bloodGroup: '',
    emergencyContact: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await patientApi.getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        gender: data.gender || undefined,
        dateOfBirth: data.dateOfBirth || '',
        address: data.address || '',
        bloodGroup: data.bloodGroup || '',
        emergencyContact: data.emergencyContact || '',
      });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await patientApi.updateProfile({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
        bloodGroup: form.bloodGroup?.trim() || undefined,
        emergencyContact: form.emergencyContact?.trim() || undefined,
      });
      setProfile(updated);
      setIsEditing(false);
      toast.success('Patient profile updated successfully!');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <PatientNavbar currentTab="profile" />

      <main className="page-container py-8 space-y-6 flex-1 max-w-4xl">
        {/* Page Title & Edit Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-foreground text-2xl sm:text-3xl tracking-tight">
                Health Profile
              </h1>
              <Badge variant="blue" dot>Personal Demographics</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Maintain your medical records, demographic identifiers, emergency contacts, and contact numbers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setForm({
                      firstName: profile.firstName || '',
                      lastName: profile.lastName || '',
                      phone: profile.phone || '',
                      gender: profile.gender || undefined,
                      dateOfBirth: profile.dateOfBirth || '',
                      address: profile.address || '',
                      bloodGroup: profile.bloodGroup || '',
                      emergencyContact: profile.emergencyContact || '',
                    });
                  }
                }}
                leftIcon={<X className="w-4 h-4" />}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {error && (
              <div className="p-4 bg-danger-soft border border-danger/20 rounded-2xl flex items-center gap-3 text-danger text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Profile Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-subtle"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-display font-bold text-2xl border border-primary/20">
                    {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {profile?.firstName} {profile?.lastName}
                      </h2>
                      <Badge variant="blue" dot>Patient</Badge>
                      {profile?.bloodGroup && (
                        <span className="badge badge-red font-mono font-bold text-xs">
                          {profile.bloodGroup}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{profile?.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Shield className="w-3.5 h-3.5" /> Verified Patient
                      </span>
                      <span>•</span>
                      <span>Patient ID #{profile?.id}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right sm:border-l sm:border-border sm:pl-6 text-xs text-muted">
                  <div className="font-medium text-foreground">Electronic Health Record</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    ✓ Privacy Protected & Encrypted
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Form / View */}
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Personal Demographics */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <UserRound className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-foreground text-sm">Personal Demographics</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={form.gender || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <Input
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />

                  <div>
                    <label htmlFor="bloodGroup" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Blood Group
                    </label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={form.bloodGroup || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {/* 2. Contact & Emergency Information */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-subtle space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <Phone className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-foreground text-sm">Contact & Emergency Details</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Primary Email (Account Login)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={profile?.email || ''}
                        disabled
                        className="w-full pl-10 pr-3 py-2.5 bg-surface-secondary border border-border rounded-xl text-xs sm:text-sm text-muted cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-muted mt-1">Account email is managed through security credentials.</p>
                  </div>

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+91 98765 43210"
                    leftIcon={<Phone className="w-4 h-4" />}
                  />

                  <Input
                    label="Emergency Contact"
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Relative / Guardian phone number"
                    leftIcon={<Heart className="w-4 h-4 text-danger" />}
                  />

                  <Input
                    label="Residential Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Street address, city, pin code"
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Action Footer when editing */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-card border border-border rounded-2xl flex justify-end gap-3 shadow-subtle"
                >
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      if (profile) {
                        setForm({
                          firstName: profile.firstName || '',
                          lastName: profile.lastName || '',
                          phone: profile.phone || '',
                          gender: profile.gender || undefined,
                          dateOfBirth: profile.dateOfBirth || '',
                          address: profile.address || '',
                          bloodGroup: profile.bloodGroup || '',
                          emergencyContact: profile.emergencyContact || '',
                        });
                      }
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                    loadingText="Saving Changes..."
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </motion.div>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  );
}
