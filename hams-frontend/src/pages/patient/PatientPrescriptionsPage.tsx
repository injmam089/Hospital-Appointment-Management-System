import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, Search, Stethoscope,
  FileText, CheckCircle2, Printer, X,
  CalendarDays
} from 'lucide-react';
import toast from 'react-hot-toast';
import { consultationApi } from '../../api/consultation';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { formatDate } from '../../lib/utils';
import type { PrescriptionResponse } from '../../types';
import { PatientNavbar } from '../../components/layout/PatientNavbar';
import { useModalA11y } from '../../lib/useModalA11y';

export function PatientPrescriptionsPage() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState<PrescriptionResponse | null>(null);

  const modalRef = useModalA11y({
    isOpen: !!selectedRx,
    onClose: () => setSelectedRx(null),
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const data = await consultationApi.patientGetPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      rx.doctorName.toLowerCase().includes(q) ||
      (rx.departmentName && rx.departmentName.toLowerCase().includes(q)) ||
      (rx.diagnosis && rx.diagnosis.toLowerCase().includes(q)) ||
      rx.items.some((item) => item.medicineName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-surface text-foreground font-sans flex flex-col">
      <PatientNavbar currentTab="prescriptions" />

      <main className="page-container py-8 space-y-6 flex-1">
        {/* Page Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-foreground text-2xl sm:text-3xl tracking-tight">
                Digital Prescriptions
              </h1>
              <Badge variant="green" dot>Verified Records</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Access digital medical prescriptions, medication regimens, and clinical advice issued by your physicians.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/patient/appointments')}
              leftIcon={<CalendarDays className="w-4 h-4 text-primary" />}
            >
              My Appointments
            </Button>
          </div>
        </div>

        {/* Search & Records Summary */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">
                {prescriptions.length} {prescriptions.length === 1 ? 'Prescription' : 'Prescriptions'} on File
              </span>
              <p className="text-xs text-muted">Issued following completed clinical consultations</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine, doctor, diagnosis..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              aria-label="Filter prescriptions"
            />
          </div>
        </div>

        {/* Prescription Cards List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center shadow-subtle">
            <EmptyState.Prescriptions
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/patient/appointments')}
                  leftIcon={<CalendarDays className="w-4 h-4" />}
                >
                  View Appointments
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrescriptions.map((rx) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card p-5 rounded-2xl flex flex-col justify-between hover:shadow-card-hover transition-all border border-border hover:border-primary/40 shadow-subtle"
              >
                <div>
                  {/* Doctor & Date Header */}
                  <div className="flex items-start justify-between mb-3.5 pb-3 border-b border-border/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-sm">Dr. {rx.doctorName}</h3>
                        <p className="text-xs text-muted">{rx.departmentName || rx.doctorSpecialization}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono bg-surface-secondary border border-border px-2 py-0.5 rounded-lg text-muted">
                      {formatDate(rx.prescriptionDate)}
                    </span>
                  </div>

                  {/* Diagnosis */}
                  {rx.diagnosis && (
                    <div className="mb-3.5 p-2.5 bg-primary-soft/50 rounded-xl border border-primary/20">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Clinical Diagnosis</span>
                      <p className="font-medium text-foreground text-xs mt-0.5">{rx.diagnosis}</p>
                    </div>
                  )}

                  {/* Medications Preview */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5 font-medium">
                      <span>Prescribed Medication</span>
                      <span className="text-primary font-semibold">{rx.items.length} {rx.items.length === 1 ? 'item' : 'items'}</span>
                    </div>

                    <div className="space-y-1.5">
                      {rx.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-surface-secondary rounded-lg text-xs"
                        >
                          <span className="font-medium text-foreground truncate max-w-[65%]">{item.medicineName}</span>
                          <span className="text-muted text-[11px] font-mono">{item.dosage}</span>
                        </div>
                      ))}
                      {rx.items.length > 3 && (
                        <p className="text-[11px] text-muted text-center italic pt-1">
                          + {rx.items.length - 3} more medication(s)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Doctor advice snippet */}
                  {rx.advice && (
                    <p className="text-xs text-muted line-clamp-2 italic mb-3">
                      &ldquo;{rx.advice}&rdquo;
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Doctor Verified
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedRx(rx)}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-primary" />}
                  >
                    View Prescription
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* FULL CLINICAL PRESCRIPTION MODAL */}
      <AnimatePresence>
        {selectedRx && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-modal border border-border my-8 text-foreground relative max-h-[92vh] overflow-y-auto focus:outline-none"
            >
              {/* Doctor / Hospital Letterhead */}
              <div className="border-b-2 border-primary pb-5 mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-xs">
                      Rx
                    </div>
                    <h2 className="font-display font-bold text-foreground text-xl">Hospital Prescription Record</h2>
                  </div>
                  <p className="font-semibold text-primary text-sm">Dr. {selectedRx.doctorName}</p>
                  <p className="text-xs text-muted">{selectedRx.doctorSpecialization} • {selectedRx.departmentName}</p>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.print()}
                    leftIcon={<Printer className="w-4 h-4" />}
                    aria-label="Print prescription"
                  >
                    Print
                  </Button>
                  <button
                    onClick={() => setSelectedRx(null)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-secondary text-muted hover:text-foreground"
                    aria-label="Close prescription"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-surface-secondary rounded-xl border border-border text-xs mb-5">
                <div>
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider">Date</span>
                  <span className="font-bold text-foreground">{formatDate(selectedRx.prescriptionDate)}</span>
                </div>
                <div>
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider">Prescription ID</span>
                  <span className="font-mono font-bold text-primary">#RX-{selectedRx.id}</span>
                </div>
                <div>
                  <span className="text-muted block font-semibold uppercase text-[10px] tracking-wider">Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified & Issued</span>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedRx.diagnosis && (
                <div className="mb-5 p-3.5 bg-primary-soft/50 rounded-xl border border-primary/20">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Clinical Diagnosis</h4>
                  <p className="text-sm font-semibold text-foreground">{selectedRx.diagnosis}</p>
                </div>
              )}

              {/* Prescribed Medications Table */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Prescribed Medications</h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surface-secondary text-muted uppercase text-[10px] tracking-wider border-b border-border">
                      <tr>
                        <th scope="col" className="px-3 py-2.5">Medicine</th>
                        <th scope="col" className="px-3 py-2.5">Dosage</th>
                        <th scope="col" className="px-3 py-2.5">Frequency</th>
                        <th scope="col" className="px-3 py-2.5">Duration</th>
                        <th scope="col" className="px-3 py-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedRx.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-surface-secondary/50">
                          <td className="px-3 py-2.5 font-bold text-foreground">{item.medicineName}</td>
                          <td className="px-3 py-2.5 font-mono text-muted">{item.dosage}</td>
                          <td className="px-3 py-2.5 text-muted">{item.frequency}</td>
                          <td className="px-3 py-2.5 text-muted">{item.duration}</td>
                          <td className="px-3 py-2.5 text-muted italic">{item.instructions || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor Notes & Advice */}
              {selectedRx.advice && (
                <div className="mb-5 p-3.5 bg-surface-secondary rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Physician Advice & Lifestyle Notes</h4>
                  <p className="text-xs text-foreground leading-relaxed">{selectedRx.advice}</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border flex justify-end no-print">
                <Button variant="secondary" size="sm" onClick={() => setSelectedRx(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
