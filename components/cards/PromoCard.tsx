// HOTMESS ADD
'use client';
import Link from 'next/link';

export type PromoCardProps = { title: string; slug: string; blurb: string; expiresAt?: string };
export function PromoCard({ title, slug, blurb, expiresAt }: PromoCardProps) {
  return (
    <li role="listitem" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{title}</h3>
        {expiresAt && <time dateTime={expiresAt} className="text-xs text-neutral-500" aria-label={`Expires ${new Date(expiresAt).toLocaleDateString()}`}>exp {new Date(expiresAt).toLocaleDateString()}</time>}
      </div>
      <p className="text-sm text-neutral-300 mt-1">{blurb}</p>
      <Link href={`/promos/${slug}`} className="mt-3 inline-block text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md">Details →</Link>
    </li>
  );
}
export default PromoCard;
