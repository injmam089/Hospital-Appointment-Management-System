import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  HeartPulse,
  User,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { extractApiError } from '../../api/client';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'admin' | 'doctor' | 'patient' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleQuickFill = (role: 'admin' | 'doctor' | 'patient', email: string, password: string) => {
    setForm({ email, password });
    setActiveRole(role);
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
      const trimmedEmail = form.email.trim();
      // Support both patient.demo1@hams.local and seeded patient.demo1@example.com
      const emailToSubmit = trimmedEmail.toLowerCase() === 'patient.demo1@hams.local'
        ? 'patient.demo1@example.com'
        : trimmedEmail;

      const response = await authApi.login({
        email: emailToSubmit,
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background text-foreground flex flex-col lg:flex-row font-sans relative selection:bg-primary/20 selection:text-primary">
      {/* Top right accessible theme switcher pill */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40">
        <ThemeToggle variant="switch" />
      </div>

      {/* ============================================================== */}
      {/* LEFT PANEL: Cinematic Healthcare Experience (~61% Desktop)     */}
      {/* ============================================================== */}
      <div className="relative w-full lg:w-[61%] bg-[#050B14] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Medical Environment Background Image */}
        <img
          src="/images/medical-hero-dark.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] opacity-85 brightness-[1.08] contrast-[1.06] saturate-[1.05] pointer-events-none select-none"
        />

        {/* Directional gradient masking: concentrated behind left text & bottom cards, keeping clinician clearly illuminated */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#050B14]/95 via-[#050B14]/75 via-30% to-[#050B14]/20 to-75% pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#050B14]/90 via-transparent via-40% to-[#050B14]/60 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/12 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"
          aria-hidden="true"
        />

        {/* Ambient Understated ECG Pulse Line */}
        <div className="absolute top-[48%] left-0 right-0 -translate-y-1/2 opacity-[0.08] pointer-events-none select-none" aria-hidden="true">
          <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-cyan-400 stroke-current stroke-[2.5]">
            <path d="M0,60 L400,60 L430,20 L450,100 L470,40 L490,75 L510,60 L1200,60" />
          </svg>
        </div>

        {/* Top Branding */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 flex items-center justify-between"
        >
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
            aria-label="HAMS Healthcare Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
              <Stethoscope className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-white text-xl tracking-tight leading-none">HAMS</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/25">
                  v5.0
                </span>
              </div>
              <span className="text-xs text-slate-400 block font-medium tracking-wide mt-0.5">Healthcare Systems</span>
            </div>
          </Link>
        </motion.div>

        {/* Center Hero Copy */}
        <div className="relative z-10 my-6 lg:my-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 shadow-inner mb-4 sm:mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-slate-200 tracking-wide">Secure Access</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-3 sm:mb-5">
              Healthcare,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300">
                connected.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg mb-4 sm:mb-8 font-normal">
              One secure platform for patients, doctors, and hospital administration. Precision scheduling and digital clinical records.
            </p>

            {/* Three Feature Cards - shown on tablet & desktop (sm:grid) */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">Secure Access</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  JWT authentication and BCrypt password protection.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                    <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">Smart Booking</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Concurrency-protected scheduling and double-booking prevention.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/15 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">Clinical Desk</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Digital prescriptions and structured clinical records.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative z-10 hidden sm:flex sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-4 sm:pt-6 border-t border-slate-800/60"
        >
          <div>
            © 2026 HAMS • BCA Final Year Project
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security-focused design</span>
          </div>
        </motion.div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL: Authentication Surface (~39% Desktop)            */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[39%] flex items-center justify-center p-6 sm:p-8 lg:p-10 xl:p-12 bg-background relative overflow-y-auto">
        <motion.div
          className="w-full max-w-[420px] my-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Heading Area */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AUTHENTICATION GATEWAY</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted mt-1.5">
              Sign in to your secure healthcare account
            </p>
          </div>

          {/* Error Notice */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="mb-5 p-4 bg-danger/10 border border-danger/30 rounded-2xl flex items-start gap-3 text-left shadow-sm"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-danger uppercase tracking-wider">Authentication Error</div>
                  <p className="text-sm text-danger/90 font-medium mt-0.5 leading-snug">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted">
                EMAIL ADDRESS <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-muted">
                PASSWORD <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Micro-bar below password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <div className="flex items-center gap-1.5 text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure authentication</span>
              </div>
              <button
                type="button"
                onClick={() => toast('For demo access, choose any role under Quick Demo Access below.', { icon: 'ℹ️' })}
                className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need help?</span>
              </button>
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 shadow-lg shadow-primary/20 text-base font-semibold"
              isLoading={isLoading}
              loadingText="Signing in..."
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign in to Portal
            </Button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Quick Demo Access</span>
              </div>
              <span className="text-[11px] text-muted">One-click credentials</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {/* Admin Card (Blue accent) */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin@hams.local', 'Admin@HAMS2024!')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeRole === 'admin'
                    ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-surface hover:bg-surface-secondary border-border hover:border-blue-500/40 shadow-subtle'
                }`}
                aria-label="Fill demo credentials for Administrator"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide">ADMIN</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 opacity-70 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] leading-tight font-mono text-muted select-none">
                  <span className="block font-medium text-foreground/85">admin</span>
                  <span className="block text-[9px] text-muted/80">@hams.local</span>
                </div>
              </button>

              {/* Doctor Card (Teal accent) */}
              <button
                type="button"
                onClick={() => handleQuickFill('doctor', 'doctor.demo1@hams.local', 'Doctor@HAMS2024!')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  activeRole === 'doctor'
                    ? 'bg-teal-500/10 border-teal-500 ring-1 ring-teal-500'
                    : 'bg-surface hover:bg-surface-secondary border-border hover:border-teal-500/40 shadow-subtle'
                }`}
                aria-label="Fill demo credentials for Doctor"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wide">DOCTOR</span>
                  <Stethoscope className="w-3.5 h-3.5 text-teal-500 opacity-70 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] leading-tight font-mono text-muted select-none">
                  <span className="block font-medium text-foreground/85">doctor.demo1</span>
                  <span className="block text-[9px] text-muted/80">@hams.local</span>
                </div>
              </button>

              {/* Patient Card (Violet accent) */}
              <button
                type="button"
                onClick={() => handleQuickFill('patient', 'patient.demo1@hams.local', 'Patient@HAMS2024!')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  activeRole === 'patient'
                    ? 'bg-violet-500/10 border-violet-500 ring-1 ring-violet-500'
                    : 'bg-surface hover:bg-surface-secondary border-border hover:border-violet-500/40 shadow-subtle'
                }`}
                aria-label="Fill demo credentials for Patient"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 tracking-wide">PATIENT</span>
                  <User className="w-3.5 h-3.5 text-violet-500 opacity-70 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] leading-tight font-mono text-muted select-none">
                  <span className="block font-medium text-foreground/85">patient.demo1</span>
                  <span className="block text-[9px] text-muted/80">@hams.local</span>
                </div>
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              New patient?{' '}
              <Link
                to="/register"
                className="text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 transition-colors hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
              >
                Create an account →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
