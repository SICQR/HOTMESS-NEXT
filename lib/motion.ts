import type { Variants } from 'framer-motion';

export function createFadeUp(prefersReduced: boolean, distance = 24, duration = 0.6): Variants {
  return {
    hidden: { opacity: 0, y: prefersReduced ? 0 : distance },
    show: { opacity: 1, y: 0, transition: { duration } },
  } as const;
}

export const containerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const onceViewport = { once: true, amount: 0.2 } as const;
