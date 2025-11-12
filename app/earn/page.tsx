import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Earn — HOTMESS London',
  description: 'Affiliate dashboard: track clicks, conversions, and tier rewards.',
};

export default function Earn() {
  return (
    <div className="px-6 py-32 max-w-4xl mx-auto">
      <h1 className="text-6xl md:text-8xl font-bold uppercase mb-6">Earn</h1>
      <p className="text-xl opacity-80 mb-8">Login required. See clicks, conversions, and your tier badge.</p>
      <div className="border border-white/10 rounded-2xl p-6">
        <p className="text-sm opacity-70">Affiliate program: coming soon. Track QR scans, conversions, and payouts.</p>
      </div>
    </div>
  )
}
