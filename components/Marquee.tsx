'use client';
import React from 'react'

interface MarqueeProps {
  text: string
}

export default function Marquee({ text }: MarqueeProps) {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-neutral-900 py-2">
      <div className="animate-marquee whitespace-nowrap text-xs uppercase tracking-wider opacity-70">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="inline-block px-8">{text}</span>
        ))}
      </div>
    </div>
  )
}
