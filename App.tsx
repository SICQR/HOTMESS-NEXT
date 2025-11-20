import React from 'react';
import './styles/globals.css';
import './styles/hotmess-overrides.css';

import { motion } from 'motion/react';

import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { AppRouter } from './components/AppRouter';
import { AgeGate } from './components/AgeGate';
import { ScrollProgress } from './components/ScrollProgress';
import { ConciergeWidget } from './components/ConciergeWidget';

import { EcosystemGrid } from './components/EcosystemGrid';
import { RadioShowsSection } from './components/RadioShowsSection';
import { ManifestoSection } from './components/ManifestoSection';
import { FeaturesStrip } from './components/FeaturesStrip';
import { ParallaxHero } from './components/ParallaxHero';

import { GlitchText } from './components/GlitchText';
import { DynamicBackground } from './components/DynamicBackground';
import { MagneticButton } from './components/MagneticButton';
// import { NeonCursor } from './components/NeonCursor';

function HomePage() {
  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main" className="skip-to-content focus-hotmess">
        Skip to content
      </a>

      <ScrollProgress />
      <Navigation />

      <main className="relative bg-bg text-text overflow-hidden">
        {/* Optional global neon cursor – enable if you want the full effect */}
        {/* <NeonCursor color="dual" size={24} /> */}

        {/* HERO SECTION */}
        <section className="relative min-h-[80vh] flex items-center justify-center bg-noise scanlines">
          {/* Layered dynamic backgrounds */}
          <DynamicBackground variant="gradient" intensity="medium" color="dual" />
          <DynamicBackground variant="particles" intensity="low" color="dual" />
          <DynamicBackground variant="noise" />

          <ParallaxHero>
            <div
              id="main"
              className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 max-w-4xl mx-auto"
            >
              <GlitchText
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gradient-primary animate-neon-flicker"
                intensity="high"
                continuous
              >
                HOTMESS
              </GlitchText>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                className="mt-6 text-lg md:text-xl text-text-muted max-w-2xl"
              >
                Men-only ecosystem — Radio, Records, Lube, Care. Care-first. Bold. Responsible.
                Aftercare is information and services, not medical advice.
              </motion.p>

              <motion.div
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <MagneticButton
                  variant="primary"
                  size="lg"
                  strength={0.5}
                  onClick={() => {
                    window.location.href = '/shop';
                  }}
                >
                  SHOP HNH MESS
                </MagneticButton>

                <MagneticButton
                  variant="secondary"
                  size="lg"
                  strength={0.4}
                  onClick={() => {
                    window.location.href = '/radio';
                  }}
                >
                  LISTEN LIVE
                </MagneticButton>

                <MagneticButton
                  variant="accent"
                  size="md"
                  strength={0.35}
                  onClick={() => {
                    window.location.href = '/care';
                  }}
                >
                  CARE & AFTERCARE RESOURCES
                </MagneticButton>
              </motion.div>

              {/* Men-only + 18+ microcopy for clarity */}
              <p className="mt-4 text-xs text-text-muted">
                Men-only • 18+ • Consent first • Aftercare is info/services, not medical advice.
              </p>
            </div>
          </ParallaxHero>
        </section>

        {/* ECOSYSTEM GRID – should link out to Shop / Radio / Records / Care / Earn */}
        <EcosystemGrid />

        {/* RADIO HIGHLIGHTS */}
        <RadioShowsSection />

        {/* MANIFESTO / BRAND STORY */}
        <ManifestoSection />

        {/* FEATURE STRIP – delivery, care, safety */}
        <FeaturesStrip />
      </main>

      <Footer />
    </>
  );
}

export default function HotmessFullSite() {
  return (
    <>
      <AgeGate />
      <ConciergeWidget />
      <AppRouter>
        <HomePage />
      </AppRouter>
    </>
  );
}
