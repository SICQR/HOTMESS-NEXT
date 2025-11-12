'use client';

import React from 'react';

export default function ProgressBar({ progress = 0 }: { progress?: number }) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div aria-label="progress" className="w-full h-3 bg-surface rounded-full border border-token overflow-hidden mb-6">
      <div
        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
