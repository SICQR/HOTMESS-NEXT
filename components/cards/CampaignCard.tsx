// HOTMESS ADD
'use client';

import Link from 'next/link';

export type CampaignCardProps = {
  title: string;
  slug: string;
  summary: string;
};

export function CampaignCard({ title, slug, summary }: CampaignCardProps) {
  return (
    <li role="listitem" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-sm text-neutral-300 mt-1">{summary}</p>
      <Link href={`/campaigns/${slug}`} className="mt-3 inline-block text-pink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 rounded-md">
        Read more →
      </Link>
    </li>
  );
}

export default CampaignCard;
