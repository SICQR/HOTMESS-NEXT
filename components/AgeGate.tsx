'use client';
import React, { useState } from 'react';
import { setCookie, isCookieTrue } from '../lib/cookies';

export function isAgeVerified(): boolean {
  return isCookieTrue('hm_age_ok');
}

export default function AgeGate() {
  const [verified] = useState<boolean>(() => {
    try {
      return isCookieTrue('hm_age_ok');
    } catch {
      return false;
    }
  });

  // No additional mount effect required; initial state derived lazily.

  if (verified) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-950 p-6 text-gray-200 shadow-2xl text-center">
        <h3 className="mb-2 text-2xl font-semibold">Adults Only — Men 18+</h3>
        <p className="mb-4 text-sm text-gray-400">
          HOTMESS London is for 18+ men only. This session gate sets a cookie for 7 days; no personal data is stored.
        </p>
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={() => {
              setCookie('hm_age_ok', '1', 7);
              setTimeout(() => window.location.reload(), 80);
            }}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            I confirm I’m a man aged 18+
          </button>
          <a href="https://www.google.com" className="text-xs underline opacity-80 hover:opacity-100">
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
