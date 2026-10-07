import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserCheck, ShieldCheck, Clock,
  ArrowRight, Heart, Brain, Bone, Baby, Eye, Stethoscope,
  CheckCircle2, Lock, Calendar, Pill, Shield, Check
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';

const departments = [
  { name: 'Cardiology',    icon: Heart,       color: 'text-rose-600',   bg: 'bg-rose-50',    desc: 'Cardiovascular diagnostics & interventions' },
  { name: 'Neurology',     icon: Brain,       color: 'text-indigo-600', bg: 'bg-indigo-50',  desc: 'Brain, nerve & cognitive neurological care' },
  { name: 'Orthopedics',   icon: Bone,        color: 'text-amber-600',  bg: 'bg-amber-50',   desc: 'Joints, trauma & musculoskeletal health' },
  { name: 'Pediatrics',    icon: Baby,        color: 'text-emerald-600',bg: 'bg-emerald-50', desc: 'Infant, child & adolescent medicine' },
  { name: 'Ophthalmology', icon: Eye,         color: 'text-cyan-600',   bg: 'bg-cyan-50',    desc: 'Vision assessments & ophthalmic surgeries' },
  { name: 'General',       icon: Stethoscope, color: 'text-blue-600',   bg: 'bg-blue-50',    desc: 'Comprehensive adult primary consultations' },
];

const steps = [
  {
    step: '01',
    title: 'Create Your Account',
    description: 'Register as a patient with your verified details. Secure, private, and confidential.',
  },
  {
    step: '02',
    title: 'Find Your Doctor',
    description: 'Filter verified practitioners by specialty, experience, hospital department, or schedule.',
  },
  {
    step: '03',
    title: 'Book an Appointment',
    description: 'Choose your desired date and real-time available time slot with deterministic collision prevention.',
  },
  {
    step: '04',
    title: 'Attend & Get Prescription',
    description: 'Consult your clinician, review diagnostic notes, and download your authenticated digital prescription.',
  },
];

const trustPoints = [
  'Cryptographic JWT authentication & session isolation',
  'Strict role-based access control (RBAC)',
  'Protected patient health documentation',
  'Deterministic double-booking prevention engine',
  'Tamper-evident clinical audit trails & event logging',
  'Stateless REST infrastructure with verified contracts',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#F7F9FC] border-b border-[#E2E8F0]">
        {/* Subtle radial ambient lighting */}
        <div
          className="absolute top-0 right-1/4 w-[650px] h-[650px] rounded-full opacity-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #EFF6FF 0%, transparent 70%)',
            transform: 'translate(20%, -30%)',
          }}
        />

        {/* Minimal structural grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

        <div className="page-container relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Copy, CTA & Trust Points */}
            <div className="lg:col-span-7 max-w-2xl">
              {/* Product Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E2E8F0] rounded-full mb-6 shadow-subtle"
              >
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                <span className="text-xs font-medium text-[#0F172A]">
                  HAMS Platform • Clinical Scheduling & Electronic Records
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.12] tracking-tight mb-6"
              >
                Healthcare
                <br />
                <span className="text-[#2563EB]">appointments,</span>
                <br />
                simplified.
              </motion.h1>

              {/* Refined Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl mb-9 font-normal"
              >
                Book real-time consultations with verified medical specialists,
                manage patient appointments seamlessly, and access digital prescriptions
                on an institutional-grade healthcare platform.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/doctors')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Find a Doctor
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
              </motion.div>

              {/* Refined Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="mt-12 pt-7 border-t border-[#E2E8F0] flex flex-wrap items-center gap-6 sm:gap-8"
              >
                {[
                  { icon: ShieldCheck, label: 'Secure & Private' },
                  { icon: UserCheck,   label: 'Verified Doctors' },
                  { icon: Clock,       label: 'Instant Booking' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#64748B]">
                    <Icon className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                    <span className="font-medium text-[#0F172A]">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Sophisticated Healthcare Interface Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              {/* Outer decorative ambient blur behind card */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-100/60 to-indigo-100/30 rounded-[28px] blur-xl opacity-70 -z-10" />

              {/* Main Clinical Appointment Preview Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card-hover p-6 sm:p-7 relative z-10 space-y-5">
                {/* Header: Verified Clinician */}
                <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] font-bold text-base">
                      RK
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-bold text-[#0F172A] text-sm sm:text-base">
                          Dr. Rajesh Kumar
                        </h4>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-2.5 h-2.5" />
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#2563EB] font-medium">Interventional Cardiology</p>
                      <p className="text-[11px] text-[#64748B]">Metro Heart Center • 15 Yrs Exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block">Fee</span>
                    <span className="text-sm font-bold text-[#0F172A]">₹800</span>
                  </div>
                </div>

                {/* Selected Slot Preview */}
                <div className="bg-[#F7F9FC] rounded-xl p-3.5 border border-[#E2E8F0] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                      Consultation Date
                    </span>
                    <span className="font-semibold text-[#0F172A]">Tomorrow • 10:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                      Slot Duration
                    </span>
                    <span className="font-semibold text-[#0F172A]">30 Mins (One-on-One)</span>
                  </div>
                </div>

                {/* Status Ticket Pill */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">Confirmed • Real-Time Slot</span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-700">#APT-84920</span>
                </div>

                {/* Quick Action in Card */}
                <div className="pt-1 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                    Encrypted Patient Record
                  </span>
                  <span className="font-semibold text-[#2563EB] hover:underline cursor-pointer" onClick={() => navigate('/doctors')}>
                    View All Clinicians →
                  </span>
                </div>
              </div>

              {/* Floating Badge 1: Top Right Live Slot Notification */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="hidden sm:flex absolute -top-4 -right-4 bg-white border border-[#E2E8F0] shadow-card rounded-xl px-3.5 py-2 items-center gap-2.5 z-20"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-tight">4 Open Slots Today</p>
                  <p className="text-[10px] text-[#64748B]">Immediate Scheduling</p>
                </div>
              </motion.div>

              {/* Floating Badge 2: Bottom Left Digital Rx Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="hidden sm:flex absolute -bottom-4 -left-4 bg-white border border-[#E2E8F0] shadow-card rounded-xl px-3.5 py-2 items-center gap-2.5 z-20"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-tight">Digital Prescription</p>
                  <p className="text-[10px] text-[#64748B]">Authenticated & Signed</p>
                </div>
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. SPECIALTIES SECTION */}
      {/* ============================================================ */}
      <section id="departments" className="py-20 bg-white border-b border-[#E2E8F0]">
        <div className="page-container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="section-title mb-2.5">Browse by Specialty</h2>
            <p className="section-subtitle">Board-certified doctors across all major medical departments</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {departments.map(({ name, icon: Icon, color, bg, desc }) => (
              <motion.div
                key={name}
                variants={itemVariants}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col items-center text-center gap-3 cursor-pointer group shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all duration-200"
                whileHover={{ y: -3 }}
                onClick={() => navigate('/doctors')}
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {name}
                  </h3>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 mt-1 leading-snug">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 bg-[#F7F9FC] border-b border-[#E2E8F0]">
        <div className="page-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="section-title mb-2.5">How It Works</h2>
            <p className="section-subtitle">A structured, four-step clinical pathway from booking to aftercare</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                className="relative bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div className="w-10 h-10 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/60 rounded-xl flex items-center justify-center text-sm font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SECURITY & ARCHITECTURE */}
      {/* ============================================================ */}
      <section className="py-20 bg-[#0B1224] text-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Security statement */}
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-slate-300">Security-First Clinical Architecture</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Your health data,<br />rigorously protected.
              </h2>

              <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-xl font-normal">
                HAMS is architected with defense-in-depth principles. Every HTTP transaction is authenticated
                via signed stateless JSON Web Tokens, transactions are verified against patient role boundaries,
                and administrative activities generate immutable clinical audit logs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-300 leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Role governance cards */}
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role-Based Access Control
                </span>
                <span className="text-xs text-blue-400 font-mono">RBAC Enforced</span>
              </div>

              {[{
                role: 'Patient',
                badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                access: 'Self-service slot reservations, authenticated clinical consultations, and digital prescription downloads.',
              }, {
                role: 'Doctor',
                badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                access: 'Practice availability schedule, patient clinical desk, verified consultation notes & digital prescriptions.',
              }, {
                role: 'Admin',
                badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                access: 'Clinician credential verification, department directory, utilization reports, and audit logs.',
              }].map((item) => (
                <div key={item.role} className="space-y-1.5 pb-4 last:pb-0 border-b last:border-b-0 border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${item.badgeBg}`}>
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
      {/* 5. CALL TO ACTION */}
      {/* ============================================================ */}
      <section className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="page-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="section-title mb-3">Ready to schedule your consultation?</h2>
            <p className="section-subtitle mb-8">
              Experience ordered healthcare scheduling, verified medical clinicians,
              and authenticated electronic medical documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Register as Patient
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign in to Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
