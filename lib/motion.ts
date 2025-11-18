/* lib/motion.ts - unified motion utilities */
import type { Variants, Transition } from 'framer-motion';

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

export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  function sampleCurveX(t: number) {
    return ((ax * t + bx) * t + cx) * t;
  }
  function sampleCurveY(t: number) {
    return ((ay * t + by) * t + cy) * t;
  }
  function sampleCurveDerivativeX(t: number) {
    return (3 * ax * t + 2 * bx) * t + cx;
  }
  function solveCurveX(x: number, epsilon = 1e-6) {
    let t0 = 0;
    let t1 = 1;
    let t2 = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < epsilon) return t2;
      const d2 = sampleCurveDerivativeX(t2);
      if (Math.abs(d2) < 1e-6) break;
      t2 = t2 - x2 / d2;
    }
    while (t0 < t1) {
      const x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < epsilon) return t2;
      if (x > x2) t0 = t2;
      else t1 = t2;
      t2 = (t1 + t0) / 2;
    }
    return t2;
  }
  return (t: number) => sampleCurveY(solveCurveX(t));
}

export const EASINGS = {
  hotmess: cubicBezier(0.2, 0.8, 0.2, 1),
  standard: cubicBezier(0.25, 0.1, 0.25, 1),
  decelerate: cubicBezier(0.0, 0.0, 0.2, 1),
} as const;

export function makeTransition(duration = 0.3, ease = EASINGS.hotmess): Transition {
  if (prefersReducedMotion()) return { duration: 0.001 };
  return { duration, ease: ease as any };
}

export function createFadeUp(prefersReducedOrDelay: boolean | number = 0, distance = 12, duration = 0.45): Variants {
  const prefersReduced = typeof prefersReducedOrDelay === 'boolean' ? prefersReducedOrDelay : false;
  const delay = typeof prefersReducedOrDelay === 'number' ? prefersReducedOrDelay : (prefersReduced ? 0 : 0);
  const easing = EASINGS.hotmess;
  return {
    hidden: { opacity: 0, y: distance },
    show: { opacity: 1, y: 0, transition: { duration, delay, ease: easing as any } },
    exit: { opacity: 0, y: distance, transition: { duration: Math.min(0.2, duration / 2) } },
  };
}

export default { motionEnabled, prefersReducedMotion, createFadeUp, EASINGS, makeTransition };
