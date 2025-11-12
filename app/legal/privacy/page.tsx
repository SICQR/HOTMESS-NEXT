"use client";
import { motion, useReducedMotion } from 'framer-motion';
import { createFadeUp } from '@/lib/motion';

export default function PrivacyPolicyPage() {
  const prefersReduced = useReducedMotion();
  const fade = createFadeUp(!!prefersReduced, 16, 0.5);
  return (
    <main className="pt-32 px-6 max-w-3xl mx-auto space-y-8" aria-labelledby="privacy-title" role="region">
      <motion.h1
        id="privacy-title"
        variants={fade}
        initial="hidden"
        animate="show"
        className="text-4xl font-bold tracking-tight text-center"
      >
        Privacy & Cookies
      </motion.h1>
      <motion.p variants={fade} initial="hidden" animate="show" className="text-neutral-300 leading-relaxed text-sm">
        We collect only the minimum data required to operate HOTMESS (GDPR Art. 6 legitimate interest & consent). Functional cookies are required for security and session continuity. Analytics & marketing cookies are loaded only after you grant consent via the Cookie Banner. We do not sell personal data.
      </motion.p>
      <motion.ul variants={fade} initial="hidden" animate="show" className="list-disc pl-5 space-y-2 text-neutral-400 text-sm">
        <li>Access & Erasure: email <a href="mailto:privacy@hotmess.london" className="underline">privacy@hotmess.london</a></li>
        <li>Portability: request a structured export via the Data & Privacy Hub.</li>
        <li>Retention: analytics events ≤ 12 months; consent preferences until changed.</li>
        <li>International Transfers: processed within EU/UK where possible; vendors with SCCs / DPA in place.</li>
        <li>Cookies: functional (required), analytics (optional), marketing (optional).</li>
      </motion.ul>
      <motion.p variants={fade} initial="hidden" animate="show" className="text-neutral-500 text-xs text-center">
        This page is a simplified placeholder. Replace with full policy including controller info, supervisory authority contact, and detailed cookie table.
      </motion.p>
    </main>
  );
}
