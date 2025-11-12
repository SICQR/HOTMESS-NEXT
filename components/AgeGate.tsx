'use client';
import { useState } from 'react';

export default function AgeGate() {
  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.localStorage.getItem('hm_age_verified');
    }
    return false;
  });

  const confirm = () => {
    try {
      window.localStorage.setItem('hm_age_verified', 'true');
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-950 p-6 text-gray-200 shadow-2xl">
        <h3 className="mb-2 text-2xl font-semibold">Adults Only — Men 18+</h3>
        <p className="mb-4 text-sm text-gray-400">
          HOTMESS London is for adult men (18+) only. By entering you confirm you are 18 or older and consent to view men’s content.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={confirm}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-semibold"
          >
            I confirm I’m a man aged 18+
          </button>
          <a href="https://www.google.com" className="ml-auto text-xs underline opacity-80 hover:opacity-100">
            Exit site
          </a>
          <a href="/legal/care-disclaimer" className="text-xs underline opacity-80 hover:opacity-100">
            Care Disclaimer
          </a>
        </div>
      </div>
    </div>
  );
}
