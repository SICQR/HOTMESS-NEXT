// HOTMESS ADD
'use client';
import { useEffect, useState } from 'react';

export function Splash() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const cookie = document.cookie.match(/hm_splash=1/);
    if (!cookie) {
      // HOTMESS ADD: defer setState to avoid cascading renders per lint rule
      const open = setTimeout(() => setShow(true), 0);
      document.cookie = `hm_splash=1; path=/; max-age=${60 * 60 * 24 * 30}`; // 30d
      const t = setTimeout(() => setShow(false), 2500);
      return () => { clearTimeout(t); clearTimeout(open); };
    }
  }, []);
  if (!show) return null;
  return (
    <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-center p-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" style={{ animation: 'fadeIn 0.6s ease' }}>HOTMESS</h1>
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) { h1 { animation: none !important; } }
        @keyframes fadeIn { from {opacity:0; transform:scale(.96)} to {opacity:1; transform:scale(1)} }
      `}</style>
    </div>
  );
}
export default Splash;
