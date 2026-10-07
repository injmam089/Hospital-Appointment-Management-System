import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Mail, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { extractApiError } from '../../api/client';
import type { Gender } from '../../types';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  bloodGroup: string;
  gender?: Gender;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  general?: string;
}

function validateForm(form: RegisterForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 8) errors.password = 'Minimum 8 characters';
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
    errors.password = 'Must contain uppercase, lowercase, and a number';
  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodGroup: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const response = await authApi.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        bloodGroup: form.bloodGroup || undefined,
        gender: form.gender,
      });

      login(response);
      setRegisteredName(response.user.firstName || response.user.email);
      toast.success('Patient account created successfully!');
    } catch (err) {
      setErrors({ general: extractApiError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  if (registeredName) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-medical-green-light rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-medical-green" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy mb-2">Welcome to HAMS, {registeredName}!</h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Your patient profile and secure credentials have been verified. You can now access your dashboard.
          </p>
          <Button variant="primary" className="w-full" onClick={() => navigate('/patient/dashboard', { replace: true })}>
            Enter Patient Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex items-center justify-center p-6 font-sans">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-sm">
            <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
          </div>
          <Link to="/" className="font-display font-bold text-[#0F172A] text-xl tracking-tight">HAMS Healthcare</Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-1 tracking-tight">Create your patient account</h1>
          <p className="text-sm text-[#64748B] mb-6">Register to search doctors and book appointments</p>

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-medical-red-light border border-red-200 rounded-xl"
              role="alert"
            >
              <p className="text-sm text-medical-red font-medium">{errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
                required
              />
              <Input
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
                required
              />
            </div>

            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone number"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <div>
                <label htmlFor="bloodGroup" className="label">Blood group</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select (optional)</option>
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

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              hint="Min. 8 chars, 1 uppercase, 1 lowercase, 1 number"
              placeholder="Create strong password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Already registered?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in to your account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
