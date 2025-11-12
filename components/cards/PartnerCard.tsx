// HOTMESS ADD
'use client';

import Link from 'next/link';

export type PartnerCardProps = {
  name: string;
  href: string;
  logoUrl?: string | null;
  categories?: string[];
};

export function PartnerCard({ name, href, logoUrl, categories = [] }: PartnerCardProps) {
  return (
    <li role="listitem" className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 hover:border-blue-600 transition-colors">
      <Link href={href} aria-label={`View partner ${name}`} className="flex items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <div aria-hidden className="h-10 w-10 rounded-md bg-neutral-800" />
        )}
        <div className="flex-1">
          <h3 className="text-white font-semibold">{name}</h3>
          {categories.length > 0 && (
            <p className="text-xs text-neutral-400">{categories.join(', ')}</p>
          )}
        </div>
        <span className="text-blue-400">View →</span>
      </Link>
    </li>
  );
}

export default PartnerCard;
