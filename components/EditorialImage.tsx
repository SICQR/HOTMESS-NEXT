"use client";
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export type EditorialImageProps = {
  src: string;
  alt: string;
  blendMode?: 'screen' | 'multiply' | 'overlay';
  overlay?: 'primary' | 'accent' | 'dual' | 'dark';
  parallax?: boolean;
  className?: string;
};

function overlayClass(o?: EditorialImageProps['overlay']) {
  switch (o) {
    case 'primary': return 'bg-[var(--color-primary)]/30';
    case 'accent': return 'bg-[var(--color-accent)]/30';
    case 'dual': return 'bg-gradient-to-r from-[var(--color-primary)]/30 to-[var(--color-accent)]/30';
    case 'dark': return 'bg-black/50';
    default: return '';
  }
}

export function EditorialImage({ src, alt, blendMode='screen', overlay, parallax=false, className }: EditorialImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!parallax) return;
    const handle = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height/2;
      const windowCenter = window.innerHeight/2;
      const delta = (windowCenter - center) / window.innerHeight; // -0.5..0.5
      setOffset(delta * 40); // scale px
    };
    handle();
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, [parallax]);

  return (
    <div ref={ref} className={clsx('relative overflow-hidden', className)} style={parallax ? { transform: `translateY(${offset.toFixed(2)}px)`, willChange:'transform' } : undefined}>
      <Image src={src} alt={alt} fill sizes="100vw" className={clsx('object-cover', blendMode ? `mix-blend-${blendMode}` : '')} />
      {overlay && <div className={clsx('absolute inset-0 pointer-events-none', overlayClass(overlay))} />}
    </div>
  );
}
