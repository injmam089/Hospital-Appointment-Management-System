import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { extractApiError } from '../../api/client';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleQuickFill = (email: string, password: string) => {
    setForm({ email, password });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.login({
        email: form.email.trim(),
        password: form.password,
      });

      login(response);
      toast.success(`Welcome back, ${response.user.firstName || response.user.email}!`);

      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (response.user.role === 'DOCTOR') {
        navigate('/doctor/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans relative">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle size="sm" />
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1224] dark:bg-[#07111F] text-white flex-col justify-between p-12 border-r border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-display font-bold text-white text-lg tracking-tight">HAMS</span>
            <span className="text-[11px] text-slate-400 block leading-none font-medium">Healthcare</span>
          </div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-medium text-slate-300">Secure Access Gateway</span>
            </div>

            <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
              Hospital Appointment<br />Management System
            </h2>
            <p className="text-[#94A3B8] leading-relaxed max-w-md text-sm">
              Role-governed healthcare portal supporting patients, verified clinicians,
              and hospital administrative staff with cryptographic token sessions.
            </p>

            <div className="mt-8 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic collision prevention</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Secure administrative audit trails</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Digital prescription electronic records</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} HAMS • BCA Final Year Project
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="font-display font-bold text-foreground text-lg">HAMS Healthcare</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-1 tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted mb-8">Sign in to your clinical or patient account</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              role="alert"
            >
              <p className="text-sm text-[#DC2626] font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B]">BCrypt hashed credentials</span>
              <span className="text-[#2563EB] hover:text-[#1D4ED8] font-medium cursor-pointer">
                Need help?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign in
            </Button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-8 p-4 bg-surface rounded-2xl border border-border shadow-subtle">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Quick Demo Sign-In</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@hams.local', 'Admin@HAMS2024!')}
                className="p-2 text-left bg-surface-secondary rounded-xl border border-border hover:border-primary/50 transition-all"
              >
                <div className="font-semibold text-primary">Admin</div>
                <div className="text-[10px] text-muted truncate">admin@hams.local</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('doctor.demo1@hams.local', 'Doctor@HAMS2024!')}
                className="p-2 text-left bg-surface-secondary rounded-xl border border-border hover:border-emerald-500/50 transition-all"
              >
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">Doctor</div>
                <div className="text-[10px] text-muted truncate">doctor.demo1</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('patient.demo1@example.com', 'Patient@HAMS2024!')}
                className="p-2 text-left bg-surface-secondary rounded-xl border border-border hover:border-primary/50 transition-all"
              >
                <div className="font-semibold text-primary">Patient</div>
                <div className="text-[10px] text-muted truncate">patient.demo1</div>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            New patient?{' '}
            <Link to="/register" className="text-primary hover:text-primary-hover font-semibold">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
