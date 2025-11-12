'use client';

import React from 'react';

export default function ProgressBar({ progress = 0 }: { progress?: number }) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div aria-label="progress" className="w-full h-3 bg-[#111] rounded-full border border-[#333] overflow-hidden mb-6">
      <div
        className="h-full bg-gradient-to-r from-pink-500 to-violet-700 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
