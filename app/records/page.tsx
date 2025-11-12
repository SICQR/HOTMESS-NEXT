"use client";
import { motion, useReducedMotion } from 'framer-motion';
import { createFadeUp } from '@/lib/motion';
import StaggerViewport from '@/components/StaggerViewport';
import AftercareDisclaimer from '@/components/AftercareDisclaimer';
import Link from 'next/link';

export default function RecordsPage() {
  const prefersReduced = useReducedMotion();
  const fade = createFadeUp(!!prefersReduced, 16, 0.5);
  const artists = [
    { name: 'RAW Convict', desc: 'Industrial queer techno for dark floors.' },
    { name: 'HIGH Saint', desc: 'Lo-fi pleasure beats for soft edges.' },
    { name: 'SUPER Soft', desc: 'Deep ambient aftercare for safe landings.' },
  ];

  return (
    <main className="pt-32 px-6 max-w-6xl mx-auto" aria-labelledby="records-title" role="region">
      <motion.h1
        id="records-title"
        variants={fade}
        initial="hidden"
        animate="show"
        className="text-5xl font-bold mb-10 text-center"
      >
        RAW CONVICT RECORDS
      </motion.h1>
      <StaggerViewport className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" once amount={0.15} ariaLabelledby="records-title" role="list">
        {artists.map((a) => (
          <motion.div key={a.name} variants={fade} role="listitem">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 hover:bg-neutral-900 transition">
              <h3 className="text-2xl font-semibold mb-1">{a.name}</h3>
              <p className="text-gray-400 mb-4">{a.desc}</p>
              <Link href="/radio" prefetch className="text-red-500 font-semibold hover:text-red-400 underline">Listen</Link>
            </div>
          </motion.div>
        ))}
      </StaggerViewport>
      <div className="max-w-md mx-auto mt-12">
        <AftercareDisclaimer />
      </div>
    </main>
  );
}
// Removed duplicate static variant; keeping animated version above.
