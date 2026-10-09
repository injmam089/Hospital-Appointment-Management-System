// ============================================================
// HAMS Centralized Medical Icon System & Registry
// ============================================================

import {
  // Navigation & Core
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Stethoscope,
  Pill,
  UserRound,
  UsersRound,
  UserCheck,
  UserX,
  ClipboardList,
  Bell,
  Siren,
  Search,
  MapPin,
  Settings2,
  LogOut,
  // Management & Security
  Building2,
  FileBarChart,
  ShieldCheck,
  Shield,
  Clock,
  Clock3,
  // Clinical & Records
  FileHeart,
  ClipboardPlus,
  HeartPulse,
  Activity,
  TestTube,
  ListChecks,
  FileCheck,
  // Actions & Feedback
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  Upload,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Menu,
  Check,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  // Specialties
  Brain,
  Bone,
  Baby,
  ScanFace,
  Smile,
  Wind,
  Ribbon,
  type LucideIcon,
} from 'lucide-react';
import type { AppointmentStatus } from '../types';

export const iconRegistry = {
  // 1. Navigation Icons
  navigation: {
    dashboard: LayoutDashboard,
    appointments: CalendarDays,
    doctors: Stethoscope,
    prescriptions: Pill,
    notifications: Bell,
    profile: UserRound,
    settings: Settings2,
    logout: LogOut,
    menu: Menu,
    back: ArrowLeft,
    forward: ArrowRight,
  },

  // 2. Patient Portal
  patient: {
    dashboard: LayoutDashboard,
    appointment: CalendarDays,
    findDoctor: Stethoscope,
    prescription: Pill,
    healthProfile: UserRound,
    medicalHistory: ClipboardList,
    emergency: Siren,
    notifications: Bell,
    location: MapPin,
    search: Search,
  },

  // 3. Doctor / Clinician Portal
  doctor: {
    dashboard: LayoutDashboard,
    patients: UsersRound,
    appointments: CalendarDays,
    schedule: CalendarClock,
    availability: Clock3,
    consultation: Stethoscope,
    medicalRecords: FileHeart,
    prescription: Pill,
    queue: ListChecks,
    notifications: Bell,
    profile: UserRound,
  },

  // 4. Hospital Administration Portal
  admin: {
    dashboard: LayoutDashboard,
    users: UsersRound,
    doctors: Stethoscope,
    departments: Building2,
    appointments: CalendarDays,
    reports: FileBarChart,
    audit: ShieldCheck,
    security: Shield,
    settings: Settings2,
    notifications: Bell,
  },

  // 5. Common UI Actions
  actions: {
    search: Search,
    add: Plus,
    edit: Pencil,
    delete: Trash2,
    view: Eye,
    close: X,
    back: ArrowLeft,
    forward: ArrowRight,
    save: Save,
    download: Download,
    upload: Upload,
    filter: Filter,
    refresh: RefreshCw,
    more: MoreHorizontal,
    check: Check,
    warning: TriangleAlert,
    error: CircleAlert,
    info: Info,
  },

  // 6. Appointment Status Mapping (ICON + COLOR + LABEL)
  status: {
    PENDING: Clock3,
    CONFIRMED: CalendarCheck,
    CHECKED_IN: UserCheck,
    IN_CONSULTATION: Stethoscope,
    COMPLETED: CircleCheck,
    CANCELLED: CalendarX,
    REJECTED: CircleX,
    NO_SHOW: UserX,
    RESCHEDULED: CalendarClock,
  } as Record<AppointmentStatus, LucideIcon>,

  // 7. Clinical & Medical Context
  clinical: {
    diagnosis: FileHeart,
    consultation: Stethoscope,
    prescription: Pill,
    medication: Pill,
    patient: UserRound,
    doctor: Stethoscope,
    medicalRecord: FileHeart,
    health: HeartPulse,
    vitals: Activity,
    bloodLab: TestTube,
    followUp: CalendarClock,
    clipboard: ClipboardPlus,
    verifiedRecord: FileCheck,
  },

  // 8. Department Specializations
  departments: {
    cardiology: HeartPulse,
    neurology: Brain,
    orthopedics: Bone,
    pediatrics: Baby,
    dermatology: ScanFace,
    ophthalmology: Eye,
    dental: Smile,
    generalMedicine: Stethoscope,
    pulmonology: Wind,
    oncology: Ribbon,
    psychiatry: Brain,
    gastroenterology: Activity,
    ent: Activity,
    radiology: ScanFace,
  } as Record<string, LucideIcon>,
} as const;

export type IconCategory = keyof typeof iconRegistry;

// Department Icon Resolver (with resilient clinical fallback)
export function getDepartmentIcon(deptName?: string): LucideIcon {
  if (!deptName) return iconRegistry.clinical.doctor;
  const normalized = deptName.toLowerCase().replace(/[^a-z]/g, '');

  if (normalized.includes('cardio') || normalized.includes('heart')) return iconRegistry.departments.cardiology;
  if (normalized.includes('neuro') || normalized.includes('brain')) return iconRegistry.departments.neurology;
  if (normalized.includes('ortho') || normalized.includes('bone') || normalized.includes('joint')) return iconRegistry.departments.orthopedics;
  if (normalized.includes('pediatric') || normalized.includes('baby') || normalized.includes('child')) return iconRegistry.departments.pediatrics;
  if (normalized.includes('derma') || normalized.includes('skin')) return iconRegistry.departments.dermatology;
  if (normalized.includes('ophthal') || normalized.includes('eye')) return iconRegistry.departments.ophthalmology;
  if (normalized.includes('dent') || normalized.includes('teeth')) return iconRegistry.departments.dental;
  if (normalized.includes('pulmon') || normalized.includes('chest') || normalized.includes('respiratory')) return iconRegistry.departments.pulmonology;
  if (normalized.includes('oncol') || normalized.includes('cancer')) return iconRegistry.departments.oncology;
  if (normalized.includes('psych') || normalized.includes('mental')) return iconRegistry.departments.psychiatry;
  if (normalized.includes('gastro') || normalized.includes('digestive')) return iconRegistry.departments.gastroenterology;
  if (normalized.includes('ent') || normalized.includes('ear') || normalized.includes('throat')) return iconRegistry.departments.ent;
  if (normalized.includes('radio') || normalized.includes('scan') || normalized.includes('imaging')) return iconRegistry.departments.radiology;

  return iconRegistry.clinical.doctor;
}

// Appointment Status Icon Resolver
export function getAppointmentStatusIcon(status: AppointmentStatus): LucideIcon {
  return iconRegistry.status[status] || Clock;
}
