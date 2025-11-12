"use client";
import Link from 'next/link';
import type { MouseEvent } from 'react';

export default function Footer(){
  const openCookies = (e: MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hm:open-cookie-banner'));
    }
  };

  return(
    <footer className="py-8 border-t border-token text-center text-muted text-sm bg-base mt-20">
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        {['Shop','Radio','Records','Care','About','Legal'].map(l=>(
          <Link key={l} href={`/${l.toLowerCase()}`} className="hover:accent-primary transition-colors">
            {l}
          </Link>
        ))}
        <a href="#cookies" onClick={openCookies} className="underline hover:accent-primary transition-colors">Manage cookies</a>
      </div>
      <p className="text-xs text-muted">© HOTMESS London · 18+ men-only · Consent required.</p>
    </footer>
  );
}
