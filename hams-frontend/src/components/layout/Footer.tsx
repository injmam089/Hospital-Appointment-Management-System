import { Link } from 'react-router-dom';
import { Stethoscope, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1224] text-white border-t border-slate-800">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg leading-none tracking-tight">HAMS</span>
                <span className="text-[11px] text-slate-400 block leading-none font-medium mt-0.5">Healthcare</span>
              </div>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 font-normal">
              Simplifying healthcare appointments for patients and physicians. Professional, secure, and always accessible.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy-focused architecture</span>
            </div>
          </div>

          {/* Patients */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-tight">For Patients</h4>
            <ul className="space-y-3">
              {[
                { label: 'Find a Doctor', href: '/doctors' },
                { label: 'Book Appointment', href: '/doctors' },
                { label: 'Patient Portal', href: '/login' },
                { label: 'How It Works', href: '/#how-it-works' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-[#CBD5E1] hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctors */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-tight">For Medical Staff</h4>
            <ul className="space-y-3">
              {[
                { label: 'Doctor Portal', href: '/login' },
                { label: 'Consultation Desk', href: '/login' },
                { label: 'Administration Console', href: '/login' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-[#CBD5E1] hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-tight">Hospital Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>support@hams.example.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[#94A3B8]">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>123 Healthcare Ave,<br />Medical District, New Delhi 110001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#94A3B8]">
            © {year} Hospital Appointment Management System (HAMS). BCA Final Year Project.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-500">Security-First Architecture</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-500">Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
