import AftercareDisclaimer from '@/components/AftercareDisclaimer';

export default function CarePage() {
	return (
		<section className="px-6 py-24 text-center space-y-6" aria-labelledby="care-title" role="region">
			<h1 id="care-title" className="text-5xl font-bold">Care</h1>
			<p className="text-neutral-300 max-w-xl mx-auto">Resources and initiatives focused on wellbeing within the HOTMESS ecosystem. Content coming soon.</p>
			<div className="max-w-md mx-auto">
				<AftercareDisclaimer />
			</div>
		</section>
	);
}
