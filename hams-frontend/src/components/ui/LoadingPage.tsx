import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Stethoscope className="w-7 h-7 text-white" strokeWidth={2} />
        </motion.div>
        <p className="text-sm font-medium text-muted">Loading HAMS...</p>
      </motion.div>
    </div>
  );
}
