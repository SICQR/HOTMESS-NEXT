"use client";
import { motion, useReducedMotion } from 'framer-motion';
import { createFadeUp } from '@/lib/motion';
import StaggerViewport from '@/components/StaggerViewport';

export default function CommunityPage() {
	const prefersReduced = useReducedMotion();
	const fade = createFadeUp(!!prefersReduced, 16, 0.5);
	const upcoming = [
		'12 Dec — Care Sunday Live @ Dalston Superstore',
		'19 Dec — Dial-A-Daddy Live Broadcast',
		'31 Dec — New Year RAW Drop',
	];

	return (
		<main className="pt-32 px-6 max-w-3xl mx-auto" aria-labelledby="community-title" role="region">
			<motion.h1
				id="community-title"
				variants={fade}
				initial="hidden"
				animate="show"
				className="text-5xl font-bold mb-6 text-center"
			>
				COMMUNITY
			</motion.h1>
			<motion.p
				variants={fade}
				initial="hidden"
				animate="show"
				className="text-gray-400 text-center mb-10"
			>
				Events, connection, real talk — London and beyond.
			</motion.p>
			<StaggerViewport className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8" once amount={0.2} ariaLabelledby="community-title" role="group">
				<motion.h3 variants={fade} className="text-xl font-semibold mb-4">Upcoming</motion.h3>
				<ul className="space-y-2 text-gray-300" aria-label="Upcoming community events">
					{upcoming.map(ev => (
						<motion.li key={ev} variants={fade} className="list-none">• {ev}</motion.li>
					))}
				</ul>
			</StaggerViewport>
		</main>
	);
}
