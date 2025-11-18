"use client";
import React from 'react';
import Marquee from '@/components/Marquee';
import { motion, useReducedMotion } from 'framer-motion';
import MagneticButton from '@/components/MagneticButton';
import { Card, CardContent } from '@/components/ui/card';
import { createFadeUp } from '@/lib/motion';
import FadeIn from '@/components/FadeIn';
import AftercareDisclaimer from '@/components/AftercareDisclaimer';

export default function Home() {
  const prefersReduced = useReducedMotion();
  const fadeUp = createFadeUp(!!prefersReduced, 24, 0.6);

  const ecosystem = [
    { title: 'HNH MESS', desc: 'Lube & Aftercare', link: '/shop' },
    { title: 'HOTMESS RADIO', desc: '24/7 Broadcast', link: '/radio' },
    { title: 'RAW CONVICT RECORDS', desc: 'Artists & Beats', link: '/records' },
    { title: 'APPAREL', desc: 'RAW / HUNG / HIGH / SUPER', link: '/shop' },
    { title: 'HAND N HAND', desc: 'Care & Consent Services', link: '/care' },
    { title: 'COMMUNITY', desc: 'Events & Connections', link: '/community' },
  ];

  const shows = [
    { title: 'Wake the Mess (AM)', desc: 'Morning radio that hits hard.', link: '/radio' },
    { title: 'Dial‑A‑Daddy', desc: '3× weekly — real talk & connection.', link: '/radio' },
    { title: 'Hand N Hand Sunday', desc: 'Care broadcast. Stories & Aftercare.', link: '/care' },
  ];

  const [showNoise, setShowNoise] = React.useState(false);
  const [parallax, setParallax] = React.useState(0);

  React.useEffect(() => {
    // defer noise to after first paint
    if (!prefersReduced) setShowNoise(true);
  }, [prefersReduced]);

  React.useEffect(() => {
    if (prefersReduced) return;
    const onScroll = () => {
      const y = window.scrollY;
      setParallax(Math.min(60, y * 0.08));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prefersReduced]);

  return (
    <main className="bg-black text-white font-sans">
      {/* Sticky HNH MESS ticker below the navbar */}
      <div className="sticky top-14 z-40">
        <Marquee text="HNH MESS DROP · HUNG COLLECTION · ESSENTIALS AVAILABLE · XXXTREME HOTMESS · 18+ MEN‑ONLY · CONSENT FIRST" />
      </div>
      {/* HERO */}
      <section aria-labelledby="hero-title" role="region" className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-40 pb-24 overflow-hidden">
        {/* Background radial + noise */}
        <div className="pointer-events-none absolute inset-0 will-change-transform" style={{ background: 'var(--hero-gradient)', transform: `translateY(${prefersReduced ? 0 : parallax}px)` }} />
        {showNoise && (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen"
            style={{
              backgroundImage:
                "url(data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='400' height='400' filter='url(%23n)' opacity='0.5'/></svg>)",
              backgroundSize: '400px 400px',
            }}
          />
        )}
        <motion.h1 id="hero-title" variants={fadeUp} initial="hidden" animate="show" className="text-gradient-primary text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 tracking-tight leading-[0.9]">
          HOTMESS LONDON
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl">
          Men-only ecosystem — Radio, Records, Lube, Care. Care-first. Bold. Responsible.
        </motion.p>
        <div className="flex flex-wrap gap-4 mt-12 justify-center" aria-label="Primary call to actions">
          <MagneticButton href="/shop" className="text-sm sm:text-base md:text-lg px-6 md:px-8 py-3 md:py-4" variant="primary">EXPLORE ECOSYSTEM</MagneticButton>
          <MagneticButton href="/radio" className="text-sm sm:text-base md:text-lg px-6 md:px-8 py-3 md:py-4" variant="outline">LISTEN LIVE</MagneticButton>
          <MagneticButton href="/about" className="text-sm sm:text-base md:text-lg px-4 md:px-6 py-3 md:py-4" variant="ghost">Learn More →</MagneticButton>
        </div>
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
      </section>

      {/* ECOSYSTEM GRID */}
      <section id="ecosystem" aria-labelledby="ecosystem-title" role="region" className="py-32 px-6 max-w-7xl mx-auto">
        <h2 id="ecosystem-title" className="text-5xl font-semibold mb-12 text-center">THE HOTMESS ECOSYSTEM</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" role="list" aria-labelledby="ecosystem-title">
          {ecosystem.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.06} className="contents" >
              <Card className="bg-neutral-900 border border-neutral-700 hover:-translate-y-1 hover:bg-neutral-800 transition-all">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400 mb-4">{item.desc}</p>
                  <MagneticButton href={item.link} variant="ghost" className="px-0">Explore</MagneticButton>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* SHOWS */}
      <section aria-labelledby="shows-title" role="region" className="py-32 bg-gradient-to-b from-neutral-900 to-black text-center px-6">
        <h2 id="shows-title" className="text-5xl font-semibold mb-12">LIVE THE MESS</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" role="list" aria-labelledby="shows-title">
          {shows.map((show, i) => (
            <FadeIn key={show.title} delay={i * 0.08}>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-8 hover:bg-neutral-900 transition" role="listitem">
              <h3 className="text-2xl font-semibold mb-2">{show.title}</h3>
              <p className="text-gray-400 mb-4">{show.desc}</p>
              <MagneticButton href={show.link} variant="ghost" className="px-0">Listen</MagneticButton>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section aria-labelledby="manifesto-title" role="region" className="py-32 text-center px-6">
        <h2 id="manifesto-title" className="text-5xl font-semibold mb-6">THE MANIFESTO</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Built by one man with a mission: make queer care real, raw, and responsible. HOTMESS exists for those who live loud, love harder, and clean up after.
        </p>
  <MagneticButton href="/about" variant="primary" className="px-6 py-3">Read the Manifesto</MagneticButton>
      </section>

      <div className="px-6 max-w-5xl mx-auto">
        <AftercareDisclaimer />
      </div>
      {/* Footer is provided globally by RootLayout */}
    </main>
  );
}
