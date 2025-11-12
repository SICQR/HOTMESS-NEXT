import React from 'react';
import { HNHMessHero } from '@/components/HNHMessHero';
import { HNHMessBanner } from '@/components/HNHMessBanner';
import { SectionBreak } from '@/components/SectionBreak';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HNH MESS – Hung Collection',
  description: 'Athletic brutalist apparel drops by HOTMESS London.',
};

export default function HNHMessPage() {
  return (
    <div>
      <HNHMessHero />
      <SectionBreak type="brutalist" text="DROP FEATURE" />
      <div className="mx-auto max-w-6xl px-6 grid gap-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-[4/5] border border-token rounded-sm overflow-hidden">
            <Image src="/hnhmess/hung-hero-2.svg" alt="Hung Collection back panel" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="font-semibold text-gradient-primary">Engineered Fits</h2>
            <p className="text-muted text-sm leading-relaxed">Strategic seam placements reduce friction and emphasize physique lines. High-retention waistbands keep shape through cycles. Limited run colorways rotate per season.</p>
            <ul className="list-disc pl-5 text-sm text-muted space-y-1">
              <li>Heavyweight cotton / performance blends</li>
              <li>Anti-pill & low-shrink finishing</li>
              <li>Session-proof ventilation zones</li>
              <li>Affiliation patches (HMAC verified)</li>
            </ul>
          </div>
        </div>
        <HNHMessBanner variant="essentials" />
        <HNHMessBanner variant="xtreme" />
      </div>
    </div>
  );
}
