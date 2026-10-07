import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, ArrowLeft, Search, Stethoscope,
  FileText, CheckCircle2, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import { consultationApi } from '../../api/consultation';
import { extractApiError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import type { PrescriptionResponse } from '../../types';

export function PatientPrescriptionsPage() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState<PrescriptionResponse | null>(null);

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
    <div className="min-h-screen bg-surface">
      {/* Top Header */}
      <header className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="page-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-navy text-xl">My Prescriptions</h1>
                <Badge variant="green" dot>Digital Medical Records</Badge>
              </div>
              <p className="text-xs text-muted">View verified prescriptions and clinical notes issued by your doctors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/patient/appointments')}
            >
              My Appointments
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/doctors')}
            >
              Book New Visit
            </Button>
          </div>
        </div>
      </header>

      <main className="page-container py-8">
        {/* Search Bar & Summary Card */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-navy">
                {prescriptions.length} Digital {prescriptions.length === 1 ? 'Prescription' : 'Prescriptions'} On Record
              </span>
              <p className="text-xs text-muted">All medications are securely cataloged and encrypted</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine, doctor, diagnosis..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Prescription List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse space-y-4">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-7 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <EmptyState
            icon={<Pill className="w-8 h-8 text-primary-500" />}
            title="No prescriptions found"
            description={
              search
                ? 'No prescriptions match your search criteria.'
                : 'You do not have any issued prescriptions yet. Once your doctor completes an appointment, digital prescriptions will appear here.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/patient/appointments')}
              >
                Go to Appointments
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrescriptions.map((rx) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 flex flex-col justify-between hover:shadow-card-hover transition-all border border-border hover:border-primary-200"
              >
                <div>
                  {/* Doctor & Department Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-navy text-sm">Dr. {rx.doctorName}</h3>
                        <p className="text-xs text-muted">{rx.departmentName || rx.doctorSpecialization}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono bg-surface border border-border px-2 py-0.5 rounded text-muted">
                      {formatDate(rx.prescriptionDate)}
                    </span>
                  </div>

                  {/* Diagnosis */}
                  {rx.diagnosis && (
                    <div className="mb-3 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                      <span className="text-[11px] text-primary-700 font-semibold uppercase tracking-wider block">Diagnosis</span>
                      <p className="font-medium text-navy text-xs mt-0.5">{rx.diagnosis}</p>
                    </div>
                  )}

                  {/* Medicines Summary Preview */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted mb-1.5 font-medium">
                      <span>Prescribed Items</span>
                      <span className="text-primary-600 font-semibold">{rx.items.length} {rx.items.length === 1 ? 'Medicine' : 'Medicines'}</span>
                    </div>

                    <div className="space-y-1.5">
                      {rx.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-surface rounded-lg text-xs"
                        >
                          <span className="font-medium text-navy truncate max-w-[65%]">{item.medicineName}</span>
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

                  {/* Advice snippet */}
                  {rx.advice && (
                    <p className="text-xs text-muted line-clamp-2 italic mb-3">
                      &ldquo;{rx.advice}&rdquo;
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-medical-green" />
                    Doctor Verified
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedRx(rx)}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-primary-600" />}
                  >
                    View Rx Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* FULL PRESCRIPTION DETAILS MODAL */}
      <AnimatePresence>
        {selectedRx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-modal border border-border my-8"
            >
              {/* Prescription Header / Doctor Letterhead */}
              <div className="border-b-2 border-primary-600 pb-5 mb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                      Rx
                    </div>
                    <h2 className="font-display font-bold text-navy text-xl">Hospital Prescription Record</h2>
                  </div>
                  <p className="font-semibold text-primary-700 text-sm">Dr. {selectedRx.doctorName}</p>
                  <p className="text-xs text-muted">{selectedRx.doctorSpecialization} • {selectedRx.departmentName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted block">Prescription Date</span>
                  <span className="font-mono font-bold text-navy text-sm">{formatDate(selectedRx.prescriptionDate)}</span>
                  <span className="text-[11px] text-muted block mt-1">Rx #{selectedRx.id}</span>
                </div>
              </div>

              {/* Patient and Clinical Assessment */}
              <div className="bg-surface rounded-xl p-4 border border-border mb-5 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted block mb-0.5">Patient Name</span>
                  <strong className="font-display font-bold text-navy text-sm block">{selectedRx.patientName}</strong>
                  <span className="text-muted">Patient ID #{selectedRx.patientId}</span>
                </div>
                <div>
                  <span className="text-muted block mb-0.5">Clinical Diagnosis</span>
                  <strong className="font-semibold text-primary-700 text-sm block">
                    {selectedRx.diagnosis || 'Clinical Consultation'}
                  </strong>
                </div>
              </div>

              {/* Medications Table */}
              <div className="mb-5">
                <h4 className="font-display font-bold text-navy text-sm mb-2 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-primary-600" />
                  Prescribed Medication Schedule
                </h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface border-b border-border text-muted">
                      <tr>
                        <th className="px-3.5 py-2.5">#</th>
                        <th className="px-3.5 py-2.5">Medicine Name</th>
                        <th className="px-3.5 py-2.5">Dosage</th>
                        <th className="px-3.5 py-2.5">Frequency</th>
                        <th className="px-3.5 py-2.5">Duration</th>
                        <th className="px-3.5 py-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedRx.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-surface/50">
                          <td className="px-3.5 py-2.5 text-muted font-mono">{idx + 1}</td>
                          <td className="px-3.5 py-2.5 font-bold text-navy">{it.medicineName}</td>
                          <td className="px-3.5 py-2.5 text-muted">{it.dosage}</td>
                          <td className="px-3.5 py-2.5 text-muted">{it.frequency}</td>
                          <td className="px-3.5 py-2.5 text-muted">{it.duration}</td>
                          <td className="px-3.5 py-2.5 text-muted">{it.instructions || 'After meals'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Instructions & Advice */}
              {(selectedRx.generalInstructions || selectedRx.advice) && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 mb-5 space-y-2">
                  {selectedRx.generalInstructions && (
                    <div>
                      <strong className="block font-semibold">Instructions for Patient:</strong>
                      <p>{selectedRx.generalInstructions}</p>
                    </div>
                  )}
                  {selectedRx.advice && (
                    <div>
                      <strong className="block font-semibold">Doctor Clinical Advice:</strong>
                      <p>{selectedRx.advice}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">HAMS Authenticated Medical Record</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.print()}
                    leftIcon={<Printer className="w-3.5 h-3.5 text-[#2563EB]" />}
                  >
                    Print Rx
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setSelectedRx(null)}>
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
