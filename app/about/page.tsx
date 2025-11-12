"use client";
import { motion, useReducedMotion } from 'framer-motion';
import { createFadeUp } from '@/lib/motion';

export default function AboutPage() {
	const prefersReduced = useReducedMotion();
	const fade = createFadeUp(!!prefersReduced, 16, 0.5);

	return (
		<main className="pt-32 px-6 max-w-3xl mx-auto space-y-8" aria-labelledby="about-title" role="region">
			<motion.h1
				id="about-title"
				variants={fade}
				initial="hidden"
				animate="show"
				className="text-5xl font-bold mb-4 text-center tracking-tight"
			>
				ABOUT HOTMESS
			</motion.h1>
			<motion.p
				variants={fade}
				initial="hidden"
				animate="show"
				className="text-lg leading-relaxed text-neutral-300 text-center"
			>
				HOTMESS London is a men-only queer ecosystem — Radio, Records, Aftercare (HNH MESS), Apparel, Community & Consent Services — built to center pleasure and responsibility in equal measure.
			</motion.p>
			<motion.p
				variants={fade}
				initial="hidden"
				animate="show"
				className="text-neutral-400 text-sm text-center max-w-xl mx-auto"
			>
				Care-first. Bold. Responsible. Replace this placeholder with the full brand manifesto, founder story, and commitments to consent and sustainability.
			</motion.p>
		</main>
	);
}

