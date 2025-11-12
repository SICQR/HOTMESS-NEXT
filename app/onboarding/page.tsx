import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
  title: 'Onboarding Hub • HOTMESS',
};

export default function OnboardingHubPage() {
  const cardStyle: CSSProperties = {
    background: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gap: 20,
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    marginTop: 32,
  };

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>HOTMESS Onboarding</h2>
      <p style={{ opacity: 0.8 }}>Choose a path to get started.</p>
      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: 0 }}>Seller</h3>
          <p style={{ flexGrow: 1, fontSize: 14, opacity: 0.75 }}>Apply to list products, ship with bold branding, and earn.</p>
          <Link href="/onboarding/seller" style={{ color: '#FF0080' }}>Start Seller Flow →</Link>
        </div>
        <div style={cardStyle}>
          <h3 style={{ margin: 0 }}>Customer</h3>
          <p style={{ flexGrow: 1, fontSize: 14, opacity: 0.75 }}>Learn how to scan beacons, tune in, and collect rewards.</p>
          <Link href="/onboarding/customer" style={{ color: '#FF0080' }}>Start Customer Flow →</Link>
        </div>
      </div>
    </div>
  );
}
