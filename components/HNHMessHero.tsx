"use client";
import React from "react";
import { EditorialHeader } from "@/components/EditorialHeader";
import { EnhancedButton } from "@/components/ui/EnhancedButton";
import Link from "next/link";

export function HNHMessHero() {
  return (
    <div className="relative">
      <EditorialHeader
        chapter="HNH MESS"
        title={<span className="text-gradient-primary">HUNG COLLECTION</span> as unknown as string}
        subtitle="Bold, athletic, unapologetic — made for the arena and the afters."
        image="/hnhmess/hung-hero-1.svg"
        overlay="dual"
        height="large"
      />
      <div className="relative mx-auto -mt-16 max-w-5xl px-6">
        <div className="rounded-xl bg-[var(--color-surface)]/70 p-4 backdrop-blur border border-token">
          <p className="text-sm text-muted">Featuring heavyweight cotton, ribbed structures, and engineered fits. Limited drops. 18+ community only.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/shop">
              <EnhancedButton variant="primary" glow className="btn-glow">Shop HNH MESS</EnhancedButton>
            </Link>
            <Link href="/records">
              <EnhancedButton variant="outline">Listen + Train</EnhancedButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
