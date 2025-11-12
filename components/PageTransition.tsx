"use client";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { TargetAndTransition, VariantLabels } from "framer-motion";
import React from "react";

export type PageTransitionType = "wipe" | "slide" | "reveal" | "fade" | "cut" | "shutter";
type Variant = {
  initial?: TargetAndTransition | boolean;
  animate?: TargetAndTransition | VariantLabels | boolean;
  exit?: TargetAndTransition | VariantLabels;
};

export function PageTransition({ type = "fade", children }: { type?: PageTransitionType; children: React.ReactNode }) {
  const key = usePathname() || "";
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variants: Record<PageTransitionType, Variant> = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    cut: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } },
    slide: { initial: { x: prefersReduced ? 0 : 40, opacity: prefersReduced ? 1 : 0 }, animate: { x: 0, opacity: 1 }, exit: { x: prefersReduced ? 0 : -30, opacity: prefersReduced ? 1 : 0 } },
    reveal: { initial: { y: prefersReduced ? 0 : 40, opacity: prefersReduced ? 1 : 0 }, animate: { y: 0, opacity: 1 }, exit: { y: prefersReduced ? 0 : -20, opacity: prefersReduced ? 1 : 0 } },
    wipe: { initial: { clipPath: prefersReduced ? undefined : 'inset(0 0 100% 0)' }, animate: { clipPath: prefersReduced ? undefined : 'inset(0 0 0% 0)' }, exit: { clipPath: prefersReduced ? undefined : 'inset(100% 0 0 0)' } },
    shutter: { initial: { scaleY: prefersReduced ? 1 : 0.98, opacity: prefersReduced ? 1 : 0 }, animate: { scaleY: 1, opacity: 1 }, exit: { scaleY: prefersReduced ? 1 : 0.98, opacity: prefersReduced ? 1 : 0 } },
  };

  const timing = { duration: prefersReduced ? 0 : 0.35, ease: "easeOut" as const };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={key} initial={variants[type].initial} animate={variants[type].animate} exit={variants[type].exit} transition={timing}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
