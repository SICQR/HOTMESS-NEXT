"use client";
import { motion, useReducedMotion } from 'framer-motion';
import { createFadeUp } from '@/lib/motion';

export default function CareDisclaimerPage() {
  const prefersReduced = useReducedMotion();
  const fade = createFadeUp(!!prefersReduced, 16, 0.5);
  return (
    <main className="pt-32 px-6 max-w-3xl mx-auto space-y-6" aria-labelledby="care-disclaimer-title" role="region">
      <motion.h1 id="care-disclaimer-title" variants={fade} initial="hidden" animate="show" className="text-4xl font-bold tracking-tight text-center">
        Care Disclaimer
      </motion.h1>
      <motion.p variants={fade} initial="hidden" animate="show" className="text-neutral-300 text-center">
        All aftercare content is informational only — not medical advice. If you feel unsafe or need urgent help, contact local emergency services or a qualified professional.
      </motion.p>
      <motion.p variants={fade} initial="hidden" animate="show" className="text-neutral-400 text-sm text-center">
        HOTMESS provides information and community resources; it does not diagnose, treat, or replace professional care.
      </motion.p>
    </main>
  );
}
