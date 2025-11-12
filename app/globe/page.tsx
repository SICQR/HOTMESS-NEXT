import type { Metadata } from 'next';
import Globe3D from '@/components/Globe3D';

export const metadata: Metadata = {
  title: 'Global Listeners — HOTMESS',
  description: 'Live listener density by city snapshot.'
};

export default function GlobePage() {
  return (
    <div className="px-6 py-24 max-w-6xl mx-auto">
      <h1 className="text-5xl font-bold mb-6">Global Reach</h1>
      <p className="text-neutral-400 max-w-xl mb-8 text-sm">Live snapshot of active listener clusters. Sizes scale logarithmically with current stream count.</p>
      <Globe3D />
    </div>
  );
}
