"use client";
import { motion, useReducedMotion } from 'framer-motion';
import StaggerViewport from '@/components/StaggerViewport';
import { createFadeUp } from '@/lib/motion';
import useSWR from 'swr';
import AftercareDisclaimer from '@/components/AftercareDisclaimer';

export default function RadioPage() {
	const prefersReduced = useReducedMotion();
	const fade = createFadeUp(!!prefersReduced, 16, 0.5);
	const shows = [
		{ title: 'Wake the Mess (AM)', desc: 'Morning energy + connection.' },
		{ title: 'Dial-A-Daddy', desc: '3× weekly calls & confessions.' },
		{ title: 'Hand N Hand Sunday', desc: 'Care broadcast & aftercare talks.' },
	];

		const fetcher = (u: string) => fetch(u).then((r) => r.json());
		const { data } = useSWR<{ title?: string; artist?: string }>(
			'/api/radio/now',
			fetcher,
			{ refreshInterval: 15000 }
		);

	return (
		<main className="pt-32 px-6 max-w-6xl mx-auto" aria-labelledby="radio-title" role="region">
			<motion.h1
				id="radio-title"
				variants={fade}
				initial="hidden"
				animate="show"
				className="text-5xl font-bold mb-6 text-center"
			>
				HOTMESS RADIO
			</motion.h1>
			<motion.p
				variants={fade}
				initial="hidden"
				animate="show"
				className="text-center text-gray-400 mb-8 max-w-2xl mx-auto"
			>
				24/7 broadcast. Responsible, sexy, care-first.
			</motion.p>

					<div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 mb-3" aria-label="Live radio player" role="group">
						<audio className="w-full" src="https://play.radioking.io/hotmess-radio" controls preload="none" />
					</div>
					<p className="text-center text-sm text-gray-400 mb-10" aria-live="polite">
						Now playing: {data?.title || 'Connecting…'}{data?.artist ? ` — ${data.artist}` : ''}
					</p>

			<StaggerViewport className="grid md:grid-cols-3 gap-6" once amount={0.15} ariaLabelledby="radio-title" role="list">
				{shows.map((s) => (
					<motion.div key={s.title} variants={fade} role="listitem">
						<div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 hover:bg-neutral-900 transition">
							<h3 className="text-xl font-semibold">{s.title}</h3>
							<p className="text-gray-400">{s.desc}</p>
						</div>
					</motion.div>
				))}
			</StaggerViewport>

			<div className="max-w-lg mx-auto">
				<AftercareDisclaimer />
			</div>
		</main>
	);
}
