// HOTMESS ADD
'use client';
import Link from 'next/link';

export type DJCardProps = { handle: string; name: string; genres: string[] };
export function DJCard({ handle, name, genres }: DJCardProps) {
  return (
    <li role="listitem" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="text-white font-semibold">{name}</h3>
      <p className="text-xs text-neutral-400">{genres.join(', ')}</p>
      <Link href={`/djs/${handle}`} className="mt-2 inline-block text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md" aria-label={`View DJ ${name}`}>Profile →</Link>
    </li>
  );
}
export default DJCard;
