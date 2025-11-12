'use client';
import { useEffect, useState } from 'react';

type Prefs = { functional: boolean; analytics: boolean; marketing: boolean };

declare global {
  interface Window {
    __HM_COOKIES__?: Prefs;
    HM_COOKIES?: Prefs;
  }
}

export default function CookieBanner() {
  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.localStorage.getItem('hm_cookie_choice');
    }
    return false;
  });
  const [prefs, setPrefs] = useState<Prefs>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('hm_cookie_choice');
        if (stored) return JSON.parse(stored) as Prefs;
      } catch {}
    }
    return {
      functional: true,
      analytics: false,
      marketing: false,
    };
  });

  const save = (next: Prefs) => {
    try {
      window.localStorage.setItem('hm_cookie_choice', JSON.stringify(next));
      window.__HM_COOKIES__ = next;
      window.HM_COOKIES = next;
    } catch {}
    setOpen(false);
  };

  // Initialize global consent object from stored value so analytics can run on first load after consent.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('hm_cookie_choice');
      if (stored) {
        const parsed = JSON.parse(stored) as Prefs;
        window.__HM_COOKIES__ = parsed;
        window.HM_COOKIES = parsed;
      }
    } catch {}
  }, []);

  // Allow reopening via a custom event so a footer link can trigger it.
  useEffect(() => {
    const handler = () => setOpen(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('hm:open-cookie-banner', handler);
      return () => window.removeEventListener('hm:open-cookie-banner', handler);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 m-4 rounded-2xl border border-token bg-[color:rgba(var(--color-bg-rgb)/0.92)] p-4 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3 body-sm text-muted">
        <p className="leading-relaxed">
          We use cookies to run the site (functional), and—only with consent—measure usage (analytics) and improve ads (marketing).
          No sale of personal data. Manage your choices anytime in the Legal &amp; Privacy hub.
        </p>

        <details className="rounded-lg border border-token p-3">
          <summary className="cursor-pointer accent-primary">Cookie settings</summary>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked readOnly /> <span>Functional (required)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
              />{' '}
              <span>Analytics</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
              />{' '}
              <span>Marketing</span>
            </label>
          </div>
        </details>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => save({ functional: true, analytics: true, marketing: true })}
            className="btn-base btn-primary px-4 py-2 rounded-full body-sm"
          >
            Accept all
          </button>
          <button
            onClick={() => save({ functional: true, analytics: false, marketing: false })}
            className="btn-base btn-outline px-4 py-2 rounded-full body-sm"
          >
            Decline non-essential
          </button>
          <button
            onClick={() => save(prefs)}
            className="btn-base btn-outline px-4 py-2 rounded-full body-sm"
          >
            Save choices
          </button>
          <a href="/legal/privacy" className="ml-auto body-xs underline opacity-80 hover:opacity-100">
            Privacy &amp; Cookies
          </a>
        </div>
      </div>
    </div>
  );
}
