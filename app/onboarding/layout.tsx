import { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: '#0D0D0D', color: '#FFF', minHeight: '100vh', padding: '20px' }}>
      <header style={{ textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #FF0080, #7400b8)' }}>
        <h1>HOTMESS Onboarding</h1>
      </header>
      <main style={{ maxWidth: '600px', margin: '0 auto' }}>{children}</main>
    </div>
  );
}
