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
      <a>
        Skip to content
      </a>

      
