/* lib/motion.ts
   Motion helpers used by the app.
   Exports:
   - motionEnabled(): boolean
   - prefersReducedMotion(): boolean
   - createFadeUp(prefersReducedOrDelay?, distance?, duration?): Variants
   - containerStagger(stagger?, delayChildren?): Variants
   - itemFadeUp(delay?, distance?, duration?): Variants for children
   - default export contains same helpers
*/
import type { Variants } from 'framer-motion';

export function motionEnabled(): boolean {
  try {
    if (typeof window === 'undefined') return true;
    return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return true;
  }
}

export function prefersReducedMotion(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
}

/**
 * createFadeUp
 * Accepts either a numeric delay or a boolean prefersReduced flag as the first arg
 * to remain compatible with calls like createFadeUp(!!prefersReduced, 16, 0.5)
 */
export function createFadeUp(prefersReducedOrDelay: boolean | number = 0, distance = 12, duration = 0.45): Variants {
  const prefersReduced = typeof prefersReducedOrDelay === 'boolean' ? prefersReducedOrDelay : false;
  const delay = typeof prefersReducedOrDelay === 'number' ? prefersReducedOrDelay : (prefersReduced ? 0 : 0);
  const easing: number[] = [0.2, 0.8, 0.2, 1];

  return {
    hidden: { opacity: 0, y: distance },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: easing as any,
      },
    },
    exit: { opacity: 0, y: distance, transition: { duration: Math.min(0.2, duration / 2) } },
  };
}

export function itemFadeUp(delay = 0, distance = 12, duration = 0.35): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.2, 0.8, 0.2, 1],
      },
    },
    exit: { opacity: 0, y: distance, transition: { duration: Math.min(0.15, duration / 2) } },
  };
}

export function containerStagger(stagger = 0.06, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
    exit: {
      transition: {
        staggerChildren: stagger,
        staggerDirection: -1,
      },
    },
  };
}

const _default = { motionEnabled, prefersReducedMotion, createFadeUp, itemFadeUp, containerStagger };
export default _default;