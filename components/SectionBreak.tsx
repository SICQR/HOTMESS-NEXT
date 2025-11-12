"use client";
import React from "react";
import clsx from "clsx";

export type SectionBreakProps = {
  type?: "brutalist" | "split" | "glitch";
  text?: string;
  accent?: "single" | "dual";
  className?: string;
};

export function SectionBreak({ type = "brutalist", text, accent = "single", className }: SectionBreakProps) {
  return (
    <div className={clsx("relative my-16 flex items-center justify-center", className)}>
      {type === "brutalist" && (
        <div className="w-full h-12 bg-[var(--color-surface)] border border-token grid grid-cols-12">
          <div className="col-span-2 bg-[var(--color-primary)]" />
          <div className="col-span-8 flex items-center justify-center">
            {text && <span className="tracking-widest text-xs text-muted">{text}</span>}
          </div>
          <div className="col-span-2 bg-[var(--color-accent)]" />
        </div>
      )}
      {type === "split" && (
        <div className="w-full h-2 bg-[var(--color-surface)] border border-token flex">
          <div className="h-full flex-1 bg-[var(--color-primary)]" />
          {accent === "dual" && <div className="h-full flex-1 bg-[var(--color-accent)]" />}
        </div>
      )}
      {type === "glitch" && (
        <div className="w-full h-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--color-surface)] border border-token" />
          <div className="absolute inset-0 mix-blend-screen opacity-60 bg-repeat" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,39,104,.3) 0, rgba(255,39,104,.3) 2px, transparent 2px, transparent 6px)' }} />
          {text && <div className="relative z-10 flex h-full items-center justify-center text-xs text-muted">{text}</div>}
        </div>
      )}
    </div>
  );
}

export function VerticalDivider({ text }: { text?: string }) {
  return (
    <div className="mx-auto my-16 flex flex-col items-center">
      <div className="h-24 w-px bg-[var(--color-border)]" />
      {text && <div className="mt-3 text-xs tracking-widest text-muted">{text}</div>}
    </div>
  );
}

export function ChapterBreak({ chapter, title, subtitle }: { chapter: string; title: string; subtitle?: string }) {
  return (
    <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center text-center">
      <div className="absolute inset-0 bg-[var(--color-bg)]" />
      <div className="relative z-10">
        <div className="text-xs tracking-[0.25em] text-muted">{chapter}</div>
        <h2 className="mt-2 font-semibold">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-center text-muted">{subtitle}</p>}
      </div>
    </section>
  );
}
