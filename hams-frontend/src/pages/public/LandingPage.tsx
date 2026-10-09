import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserCheck, ShieldCheck, Clock,
  ArrowRight, Heart, Brain, Bone, Baby, Eye, Stethoscope,
  CheckCircle2, Lock, Calendar, FileText, Check,
  Activity, Sparkles, ChevronRight, UserRound,
  Layers, Building2, HeartPulse, ClipboardCheck,
  Shield, Ear, Scan, LayoutDashboard, Users
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';

// 12 Medical Departments across all clinical specialties
const departments = [
  { name: 'Cardiology',       icon: Heart,       color: 'text-rose-500',    bg: 'bg-rose-500/10 border-rose-500/20',     desc: 'Heart & cardiovascular diagnostics, ECG and clinical care' },
  { name: 'Neurology',        icon: Brain,       color: 'text-indigo-500',  bg: 'bg-indigo-500/10 border-indigo-500/20',   desc: 'Brain, spinal cord & nervous system disorder management' },
  { name: 'Orthopedics',      icon: Bone,        color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20',    desc: 'Bones, joints, fracture trauma & musculoskeletal surgery' },
  { name: 'Pediatrics',       icon: Baby,        color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20',  desc: 'Infant, children & adolescent healthcare and wellness' },
  { name: 'Dermatology',      icon: Shield,      color: 'text-pink-500',    bg: 'bg-pink-500/10 border-pink-500/20',     desc: 'Clinical skin treatments, dermatological & tissue health' },
  { name: 'Ophthalmology',    icon: Eye,         color: 'text-cyan-500',    bg: 'bg-cyan-500/10 border-cyan-500/20',     desc: 'Comprehensive vision diagnostics, retina & ophthalmic care' },
  { name: 'Gynecology',       icon: HeartPulse,  color: 'text-purple-500',  bg: 'bg-purple-500/10 border-purple-500/20',   desc: 'Women\'s health, reproductive medicine & prenatal triage' },
  { name: 'Psychiatry',       icon: Sparkles,    color: 'text-violet-500',  bg: 'bg-violet-500/10 border-violet-500/20',   desc: 'Mental wellness, cognitive behavioral therapy & psychiatry' },
  { name: 'Gastroenterology', icon: Activity,    color: 'text-teal-500',    bg: 'bg-teal-500/10 border-teal-500/20',     desc: 'Digestive system, liver health & gastrointestinal therapy' },
  { name: 'General Medicine', icon: Stethoscope, color: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/20',     desc: 'Primary outpatient consultation & preventative medicine' },
  { name: 'ENT',              icon: Ear,         color: 'text-orange-500',  bg: 'bg-orange-500/10 border-orange-500/20',   desc: 'Ear, nose, throat diagnostics & audiology treatments' },
  { name: 'Radiology',        icon: Scan,        color: 'text-sky-500',     bg: 'bg-sky-500/10 border-sky-500/20',       desc: 'Diagnostic imaging, ultrasound, MRI & radiological scans' },
];

// Platform-Wide 4-Step Operational Pathway
const steps = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Patients register in seconds; healthcare providers and staff are provisioned by hospital administrators.',
    icon: UserRound,
  },
  {
    step: '02',
    title: 'Access Your Workspace',
    description: 'Log in to your dedicated portal — customized specifically for patient care, clinical practice, or hospital operations.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'Manage Healthcare Workflow',
    description: 'Book appointments, manage clinical schedules, conduct consultations, or monitor hospital throughput.',
    icon: Calendar,
  },
  {
    step: '04',
    title: 'Complete the Clinical Journey',
    description: 'Generate digital prescriptions, review health history, and maintain complete audit compliance.',
    icon: ClipboardCheck,
  },
];

// Security and Defense-in-Depth Highlights
const securityFeatures = [
  {
    title: 'Enterprise Authentication',
    description: 'Dual-token JWT with short-lived access and secure refresh rotation',
  },
  {
    title: 'Strict Role Segregation',
    description: 'Isolated portals and endpoint authorization for Patients, Doctors, and Admins',
  },
  {
    title: 'Data Ownership Protection',
    description: 'Robust IDOR defenses ensuring users only access authorized health records',
  },
  {
    title: 'Administrative Audit Trail',
    description: 'Sensitive clinical actions are permanently logged with IP and timestamp',
  },
  {
    title: 'Concurrency Protection',
    description: 'Database locks prevent double-booking of doctors across all time slots',
  },
  {
    title: 'Clinical Accuracy',
    description: 'Structured consultation notes and validated digital prescriptions',
  },
];

// Bottom Trust Indicators
const trustIndicators = [
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    subtitle: 'Your data, protected',
  },
  {
    icon: UserCheck,
    title: 'Verified Doctors',
    subtitle: 'Trusted professionals',
  },
  {
    icon: Clock,
    title: 'Real-Time Booking',
    subtitle: 'Appointment slot management',
  },
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    subtitle: 'Access your records anytime',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function LandingPage() {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    const el = document.getElementById('workspaces');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />

      {/* ============================================================ */}
      {/* 1. HERO SECTION — Reference-Driven Cinematic Medical SaaS     */}
      {/* ============================================================ */}
      <section
        id="platform"
        className="relative pt-24 pb-12 md:pt-32 md:pb-16 lg:pt-36 lg:pb-20 overflow-hidden border-b border-border bg-gradient-to-b from-background via-surface-secondary/30 to-background"
      >
        {/* Ambient atmospheric glows - subtle and restrained */}
        <div
          className="absolute top-10 left-1/3 -translate-x-1/2 w-[850px] h-[550px] rounded-full bg-gradient-to-tr from-blue-600/[0.06] via-sky-400/[0.03] to-transparent blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-primary/[0.03] dark:bg-cyan-500/[0.06] blur-[130px] pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* ============================================================ */}
        {/* Real Medical Photography Background Layer (Right Side)      */}
        {/* ============================================================ */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[68%] xl:w-[72%] pointer-events-none z-0 overflow-hidden">
          {/* Light Mode Medical Image Asset - Natural Contrast & Clear Visibility */}
          <img
            src="/images/medical-hero-light.jpg"
            alt="HAMS Clinical Medical Workspace"
            className="dark:hidden absolute right-0 top-0 w-full h-full object-cover object-[center_20%] lg:object-[54%_center] select-none"
          />
          {/* Light Mode Mask: Concentrated on the left text area, leaving doctors fully visible */}
          <div className="dark:hidden absolute inset-0 bg-gradient-to-r from-background via-background/80 via-15% to-transparent to-40%" />
          <div className="dark:hidden absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/10" />

          {/* Dark Mode Medical Image Asset - Cinematic Navy & Cyan Illumination */}
          <img
            src="/images/medical-hero-dark.jpg"
            alt="HAMS Clinical Medical Workspace"
            className="hidden dark:block absolute right-0 top-0 w-full h-full object-cover object-[center_20%] lg:object-[54%_center] select-none brightness-105"
          />
          {/* Dark Mode Mask: Concentrated on the left text area */}
          <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-[#07111F] via-[#07111F]/85 via-15% to-transparent to-40%" />
          <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-[#07111F]/30 via-transparent to-[#07111F]/10" />
        </div>

        {/* Decorative Floating Medical Crosses - Very Low Opacity */}
        <div className="absolute left-[8%] top-[28%] text-primary/[0.06] dark:text-cyan-400/[0.08] text-3xl font-light select-none pointer-events-none" aria-hidden="true">+</div>
        <div className="absolute left-[44%] top-[18%] text-primary/[0.05] dark:text-cyan-400/[0.06] text-2xl font-light select-none pointer-events-none" aria-hidden="true">+</div>
        <div className="absolute left-[38%] bottom-[24%] text-primary/[0.06] dark:text-cyan-400/[0.08] text-4xl font-light select-none pointer-events-none" aria-hidden="true">+</div>

        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* ============================================================ */}
            {/* Left Column: Headline, Copy & CTAs (~45% content width)     */}
            {/* ============================================================ */}
            <div className="lg:col-span-6 xl:col-span-5 max-w-xl">
              {/* Compact Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-surface/90 dark:bg-slate-900/90 border border-border rounded-full mb-6 shadow-subtle backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-xs font-semibold text-foreground tracking-tight">
                  HAMS Platform • Comprehensive Healthcare Management
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
                  V4.0
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="font-display text-4xl sm:text-6xl lg:text-[62px] xl:text-[70px] font-extrabold text-foreground leading-[1.05] tracking-tight mb-6"
              >
                Healthcare<br />
                <span className="bg-gradient-to-r from-[#1d61f2] via-[#0ea5e9] to-[#06b6d4] dark:from-[#3b82f6] dark:via-[#38bdf8] dark:to-[#22d3ee] bg-clip-text text-transparent">
                  management,
                </span><br />
                simplified.
              </motion.h1>

              {/* Supporting Copy */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="text-base sm:text-lg text-muted dark:text-slate-300 leading-relaxed max-w-lg mb-9 font-normal"
              >
                One secure platform for patients, doctors, and administrators to manage
                appointments, consultations, clinical records, and healthcare workflows.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleExploreClick}
                  className="bg-[#1d61f2] hover:bg-[#1853d4] text-white shadow-lg shadow-blue-500/25 px-7 py-3.5 font-semibold text-base rounded-xl"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore HAMS
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-surface hover:bg-surface-secondary text-foreground border border-border shadow-subtle px-7 py-3.5 font-semibold text-base rounded-xl"
                >
                  Sign In
                </Button>
              </motion.div>

              {/* Subtext Link for Patient Registration */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="mt-4"
              >
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1d61f2] dark:text-[#38bdf8] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded py-0.5"
                >
                  <span>Patient? Create your account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </div>

            {/* ============================================================ */}
            {/* Right Column: Floating Dashboard Preview (~55% width)        */}
            {/* ============================================================ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-6 xl:col-span-7 relative flex justify-center lg:justify-end"
            >
              {/* Outer Glow Halo behind the card */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 via-sky-400/15 to-cyan-400/10 rounded-[32px] blur-2xl opacity-80 pointer-events-none -z-10" />

              {/* Floating Clinical Dashboard Preview Card */}
              <div className="relative w-full max-w-[560px] rounded-[22px] bg-white/95 dark:bg-[#0c1427]/95 border border-slate-200/90 dark:border-blue-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.12),0_4px_16px_rgba(37,99,235,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(6,182,212,0.12)] p-6 sm:p-7 backdrop-blur-xl z-10 space-y-5">
                {/* 1. Dashboard Header */}
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1d61f2] to-[#0ea5e9] flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-2 ring-white/20">
                      <Stethoscope className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-[#1d61f2] dark:text-[#60a5fa] text-xs sm:text-sm tracking-wider uppercase">
                        HAMS CLINICAL PLATFORM
                      </h3>
                      <p className="text-xs text-muted dark:text-slate-400 font-medium mt-0.5">
                        Secure • Reliable • Patient-Centric
                      </p>
                    </div>
                  </div>

                  {/* Compact Status Badge */}
                  <div className="px-3 py-1.5 rounded-full bg-surface-secondary/90 border border-border flex items-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] shrink-0" />
                    <span className="text-xs font-semibold text-foreground tracking-tight whitespace-nowrap">
                      Illustrative UI Preview
                    </span>
                  </div>
                </div>

                {/* 2. Illustrative Metrics Grid */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted mb-2.5">
                    <span className="uppercase tracking-wider text-[10px] font-bold">PLATFORM METRICS</span>
                    <span className="text-[11px] text-primary font-medium">Illustrative platform overview</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Appointments */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-center">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-md bg-blue-500/10 text-primary flex items-center justify-center">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="block text-xl font-extrabold text-foreground font-display">24</span>
                      <span className="text-xs font-semibold text-foreground">Appointments</span>
                      <span className="block text-[10px] text-muted">Sample schedule</span>
                    </div>

                    {/* Doctors */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-center">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-md bg-blue-500/10 text-primary flex items-center justify-center">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <span className="block text-xl font-extrabold text-foreground font-display">08</span>
                      <span className="text-xs font-semibold text-foreground">Doctors</span>
                      <span className="block text-[10px] text-muted">Active in system</span>
                    </div>

                    {/* Patients */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-center">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-md bg-blue-500/10 text-primary flex items-center justify-center">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="block text-xl font-extrabold text-foreground font-display">16</span>
                      <span className="text-xs font-semibold text-foreground">Patients</span>
                      <span className="block text-[10px] text-muted">Registered records</span>
                    </div>

                    {/* Departments */}
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-center">
                      <div className="w-6 h-6 mx-auto mb-1 rounded-md bg-blue-500/10 text-primary flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="block text-xl font-extrabold text-foreground font-display">06</span>
                      <span className="text-xs font-semibold text-foreground">Departments</span>
                      <span className="block text-[10px] text-muted">Available disciplines</span>
                    </div>
                  </div>
                </div>

                {/* 3. System Capabilities */}
                <div className="bg-slate-50/70 dark:bg-slate-900/50 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800/70 space-y-2">
                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                    SYSTEM CAPABILITIES
                  </div>
                  <div className="space-y-1.5 text-xs text-foreground/90 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Role-based clinical workflows (Patient, Doctor, Admin)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Concurrency-protected appointment booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Digital consultations and structured clinical records</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Secure administrative audit trail and ownership checks</span>
                    </div>
                  </div>
                </div>

                {/* 4. Security Footer */}
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#1d61f2] dark:text-[#38bdf8] shrink-0" />
                    <span className="text-[11px] sm:text-xs">
                      JWT Authentication • BCrypt • RBAC • Ownership Protection
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary shrink-0 ml-2" />
                </div>
              </div>

              {/* Floating Supporting Badge (Bottom-Left of Dashboard) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="hidden sm:flex absolute -bottom-5 left-4 bg-white/95 dark:bg-[#0c1427]/95 border border-slate-200/90 dark:border-blue-900/50 shadow-xl rounded-2xl px-4 py-3 items-center gap-3 backdrop-blur-xl z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#1d61f2] dark:text-[#38bdf8] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight">Three Secure Workspaces</p>
                  <p className="text-[11px] text-muted leading-tight mt-0.5">Patient • Doctor • Admin</p>
                </div>
              </motion.div>

            </motion.div>

          </div>

          {/* ============================================================ */}
          {/* Sweeping Curved Wave Ribbon Light Accent                     */}
          {/* ============================================================ */}
          <div className="relative mt-8 sm:mt-12 pointer-events-none -z-10" aria-hidden="true">
            <svg
              className="w-full h-12 sm:h-16 overflow-visible"
              viewBox="0 0 1440 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waveGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.05" />
                  <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#0EA5E9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="waveGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                  <stop offset="40%" stopColor="#22D3EE" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#06B6D4" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d="M-40 45 C 320 60, 520 -15, 860 30 C 1120 65, 1340 10, 1480 35"
                className="dark:hidden"
                stroke="url(#waveGradientLight)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M-40 45 C 320 60, 520 -15, 860 30 C 1120 65, 1340 10, 1480 35"
                className="hidden dark:block"
                stroke="url(#waveGradientDark)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* ============================================================ */}
          {/* Trust Indicators Strip (Bottom of Hero)                      */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="pt-6 border-t border-border/80 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {trustIndicators.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-primary dark:text-cyan-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2.1} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted leading-tight mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. ROLE WORKSPACES SECTION — 1 Platform, 3 Dedicated Roles   */}
      {/* ============================================================ */}
      <section id="workspaces" className="py-20 sm:py-24 bg-surface border-b border-border scroll-mt-20">
        <div className="page-container">
          <motion.div
            className="text-center mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Dedicated Portals</span>
            </div>
            <h2 className="section-title mb-3">One Platform. Three Secure Workspaces.</h2>
            <p className="section-subtitle">
              Tailored environments designed for the specific needs of patients, healthcare providers, and hospital administrators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 1. PATIENT WORKSPACE */}
            <motion.div
              className="bg-surface border border-border rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-primary border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <UserRound className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-primary tracking-wider uppercase mb-1">Patient Portal</div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">Frictionless Healthcare Access</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                  Self-service appointment scheduling, digital medical history, and authenticated consultation records.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Browse verified doctors across 12 medical specialties</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Real-time slot availability & instant booking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Digital prescriptions & structured diagnosis history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>Transparent consultation fee schedules</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/register')}
                className="w-full justify-between"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Patient Registration →
              </Button>
            </motion.div>

            {/* 2. DOCTOR WORKSPACE */}
            <motion.div
              className="bg-surface border border-border rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mb-1">Doctor Workspace</div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">Clinical Workflow & Consultation Management</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                  Comprehensive clinical workstation for patient queues, consultation documentation, and digital prescriptions.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Structured daily patient queues with live check-in tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Digital prescription builder with instant dosage formatting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Flexible weekly availability & recurring break scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Real-time appointment status updates</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/login')}
                className="w-full justify-between"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Doctor Access →
              </Button>
            </motion.div>

            {/* 3. ADMINISTRATOR WORKSPACE */}
            <motion.div
              className="bg-surface border border-border rounded-2xl p-7 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.15 }}
              whileHover={{ y: -4 }}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase mb-1">Hospital Operations</div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">Governance, Operations & Audit Intelligence</h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                  Executive oversight, doctor credential verification, department catalogs, and audit trail inspection.
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Comprehensive physician verification & onboarding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Hospital-wide appointment analytics & daily flow metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Administrative audit logs with timestamped IP tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Department management & clinical quota configuration</span>
                  </li>
                </ul>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/login')}
                className="w-full justify-between"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Admin Console →
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SPECIALTIES SECTION — Clinical Disciplines                */}
      {/* ============================================================ */}
      <section id="features" className="py-20 sm:py-24 bg-background border-b border-border scroll-mt-20">
        <div className="page-container">
          <motion.div
            className="text-center mb-14 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Clinical Disciplines</span>
            </div>
            <h2 className="section-title mb-3">Healthcare Across Every Major Specialty</h2>
            <p className="section-subtitle">Explore the clinical departments available through HAMS.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {departments.map(({ name, icon: Icon, color, bg, desc }) => (
              <motion.div
                key={name}
                variants={itemVariants}
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col items-start text-left gap-3.5 cursor-pointer group shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all duration-200"
                whileHover={{ y: -4 }}
                onClick={() => navigate('/register')}
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} border flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm`}>
                  <Icon className={`w-6 h-6 ${color}`} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  <p className="text-[11px] text-muted line-clamp-2 mt-1 leading-snug">
                    {desc}
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center text-xs font-semibold text-primary group-hover:text-primary-hover">
                  <span>Explore Department</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. HOW IT WORKS — Platform-Neutral 4-Step Pathway            */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-surface border-b border-border scroll-mt-20">
        <div className="page-container">
          <motion.div
            className="text-center mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Operational Pathway</span>
            </div>
            <h2 className="section-title mb-3">How It Works</h2>
            <p className="section-subtitle">
              A structured four-step lifecycle designed to accommodate patients, doctors, and administrators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  className="relative bg-surface border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 group flex flex-col justify-between"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  whileHover={{ y: -3 }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 bg-primary-soft text-primary border border-primary/20 rounded-xl flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-surface-secondary text-muted group-hover:text-primary transition-colors flex items-center justify-center">
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-border/60 flex items-center text-[11px] font-semibold text-primary">
                    <span>Phase {step.step}</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. SECURITY SECTION — Defense-in-Depth Trust Architecture     */}
      {/* ============================================================ */}
      <section id="security" className="py-20 sm:py-24 bg-[#07111F] text-white relative overflow-hidden scroll-mt-20">
        {/* Ambient background glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Security statement */}
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/90 border border-slate-700/80 rounded-full">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300">Defense-in-Depth</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
                Secure by Design.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Built for Healthcare.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Architected with defense-in-depth principles to protect sensitive medical records and user data.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {securityFeatures.map((item) => (
                  <div key={item.title} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Role governance cards */}
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-elevated backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Role-Based Access Control
                  </span>
                </div>
                <span className="text-[11px] text-blue-400 font-mono font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  RBAC Enforced
                </span>
              </div>

              {[{
                role: 'Patient Portal',
                badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                access: 'Self-service slot reservations, authenticated clinical consultations, and digital prescription downloads.',
              }, {
                role: 'Doctor Workspace',
                badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                access: 'Practice availability schedule, patient clinical desk, verified consultation notes & digital prescriptions.',
              }, {
                role: 'Admin Console',
                badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                access: 'Clinician credential verification, department directory, utilization reports, and Administrative Audit Trail.',
              }].map((item) => (
                <div key={item.role} className="space-y-1.5 pb-4 last:pb-0 border-b last:border-b-0 border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${item.badgeBg}`}>
                      {item.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {item.access}
                  </p>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CALL TO ACTION SECTION                                     */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 bg-surface border-t border-border relative overflow-hidden">
        <div className="page-container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started with HAMS</span>
            </div>
            <h2 className="section-title mb-4">Ready to use a better healthcare workflow?</h2>
            <p className="section-subtitle mb-9 text-base sm:text-lg">
              Join doctors, patients, and healthcare administrators using HAMS to simplify appointments and medical consultations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-[#1d61f2] hover:bg-[#1853d4] text-white shadow-lg shadow-blue-500/25 px-7 py-3.5 font-semibold text-base rounded-xl"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Your Workspace
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-surface hover:bg-surface-secondary text-foreground border border-border shadow-subtle px-7 py-3.5 font-semibold text-base rounded-xl"
              >
                Create Patient Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
