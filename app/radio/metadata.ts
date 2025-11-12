import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Radio — HOTMESS London',
  description: 'Live radio stream and now-playing from HOTMESS RadioKing.',
  alternates: { canonical: '/radio' },
  openGraph: {
    title: 'Radio — HOTMESS London',
    description: 'Listen live and see what’s playing now.',
    url: 'https://hotmess.london/radio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radio — HOTMESS London',
    description: 'Listen live and see what’s playing now.',
  },
};
