'use client';
import { motion } from 'framer-motion';
import { useLayoutMode } from '@/components/LayoutModeProvider';

export default function ComplianceBar() {
  const { hero } = useLayoutMode();
  if (hero) return null; // hide on homepage hero mode
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="status"
      aria-label="Compliance information"
      className="w-full bg-black/60 backdrop-blur border-b border-neutral-800 text-[11px] md:text-xs tracking-wide text-gray-400 flex items-center justify-center px-4 py-2 font-medium"
    >
      <p className="text-center">
        Men‑only • 18+ • Consent first • Aftercare = information/services, not medical advice • GDPR compliant
      </p>
    </motion.div>
  );
}
