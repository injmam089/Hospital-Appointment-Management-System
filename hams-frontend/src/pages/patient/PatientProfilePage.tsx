import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Phone, MapPin, Heart, AlertCircle,
  Save, Shield, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi, type UpdatePatientProfilePayload } from '../../api/patient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { extractApiError } from '../../api/client';
import type { Patient } from '../../types';

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
    setForm(prev => ({ ...prev, [name]: value }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Loading medical profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16">
      {/* Top Bar */}
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="page-container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/patient/dashboard"
              className="p-2 hover:bg-surface rounded-xl transition-colors text-muted hover:text-navy"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display font-bold text-navy text-lg">My Health Profile</h1>
              <p className="text-xs text-muted">Personal & medical records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="page-container py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-medical-red-light border border-red-200 rounded-xl flex items-center gap-3 text-medical-red text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-display font-bold text-2xl">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-navy">
                    {profile?.firstName} {profile?.lastName}
                  </h2>
                  <Badge variant="blue" dot>Patient</Badge>
                  {profile?.bloodGroup && (
                    <span className="badge badge-red font-mono">
                      {profile.bloodGroup}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-0.5">{profile?.email}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-medical-green" /> Verified Patient
                  </span>
                  <span>•</span>
                  <span>Patient ID #{profile?.id}</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-border sm:pl-6 text-xs text-muted">
              <div>Secure Electronic Health Record</div>
              <div className="text-medical-green font-medium mt-1">✓ Privacy Protected</div>
            </div>
          </div>
        </motion.div>

        {/* Profile Form / View */}
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <User className="w-4 h-4 text-primary-600" />
                <h3 className="font-display font-bold text-navy text-sm">Personal Demographics</h3>
              </div>

              <div className="space-y-4">
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
                  <label htmlFor="gender" className="label">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
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
                  <label htmlFor="bloodGroup" className="label">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={form.bloodGroup || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
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
            </motion.div>

            {/* Contact & Emergency */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card p-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <Phone className="w-4 h-4 text-primary-600" />
                <h3 className="font-display font-bold text-navy text-sm">Contact & Emergency Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Primary Email (Account)</label>
                  <input
                    type="text"
                    value={profile?.email || ''}
                    disabled
                    className="input-field bg-surface text-muted cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted mt-1">Account email is managed through security settings.</p>
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
                  placeholder="Relative/Guardian phone"
                  leftIcon={<Heart className="w-4 h-4 text-medical-red" />}
                />

                <Input
                  label="Residential Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Street address, city"
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </motion.div>
          </div>

          {/* Action Footer */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-end gap-3"
            >
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile Changes
              </Button>
            </motion.div>
          )}
        </form>
      </main>
    </div>
  );
}
