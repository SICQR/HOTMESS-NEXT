// HOTMESS ADD
'use client';

import Link from 'next/link';
import { useMemo } from 'react';

export type OfferCardProps = {
  title: string;
  description: string;
  href: string;
  priceFrom?: number;
  partnerName?: string;
  categoryLabel?: string;
};

export function OfferCard({ title, description, href, priceFrom, partnerName, categoryLabel }: OfferCardProps) {
  const price = useMemo(() => (typeof priceFrom === 'number' ? `$${priceFrom.toFixed(2)}+` : undefined), [priceFrom]);

  return (
    <li role="listitem" className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 hover:border-pink-600 transition-colors">
      <Link href={href} aria-label={`View offer ${title}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 rounded-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {partnerName && <p className="text-xs text-neutral-400">by {partnerName}</p>}
          </div>
          {categoryLabel && (
            <span aria-label={`Category ${categoryLabel}`} className="text-xs px-2 py-1 rounded-full bg-pink-600/20 text-pink-300">
              {categoryLabel}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-neutral-300">{description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-pink-400 font-medium">View</span>
          {price && <span className="text-xs text-neutral-400">from {price}</span>}
        </div>
      </Link>
    </li>
  );
}

export default OfferCard;
