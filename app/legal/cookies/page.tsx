import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Cookie Policy — HOTMESS London',
  description: 'How we use cookies and tracking.',
};

export default function Cookies() {
  return (
    <div className="px-6 py-32 max-w-3xl mx-auto space-y-6">
      <h1 className="text-6xl md:text-8xl font-bold uppercase mb-6">Cookie Policy</h1>
      <p className="text-sm opacity-70">Last updated: November 2025</p>
      <section>
        <h2 className="text-2xl font-semibold mb-3">Essential Cookies</h2>
        <ul className="list-disc list-inside opacity-80 space-y-2">
          <li><code>hm_age_ok</code> — Age gate verification (7 days)</li>
          <li><code>hm_cookie_prefs</code> — Consent preferences</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-3">Analytics</h2>
        <p className="opacity-80">GA4 and Umami only load after consent. No PII collected without explicit opt-in.</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-3">Affiliate Tracking</h2>
        <p className="opacity-80">QR scans log city, surface, timestamp. HMAC-signed. Cookies hold affiliate attribution for 24h.</p>
      </section>
    </div>
  )
}
