"use client";
import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { EnhancedButton } from './ui/EnhancedButton';

export type ProductCardProps = {
  name: string;
  category?: string;
  price: number;
  image: string;
  badge?: string;
  onAddToCartAction?: () => void;
  onToggleWishlistAction?: () => void;
  isInWishlist?: boolean;
  className?: string;
};

export function ProductCard({ name, category, price, image, badge, onAddToCartAction, onToggleWishlistAction, isInWishlist=false, className }: ProductCardProps) {
  return (
  <article className={clsx('group relative overflow-hidden border border-token bg-surface rounded-2xl p-3 body-sm', className)}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
        <Image src={image} alt={name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
  {badge && <span className="absolute left-3 top-3 rounded bg-[var(--color-primary)] px-2 py-1 body-xs font-semibold text-white">{badge}</span>}
        <button aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'} onClick={onToggleWishlistAction} className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div className="mt-3">
        {category && <div className="body-xs uppercase tracking-widest text-muted">{category}</div>}
        <h3 className="mt-1 line-clamp-2 body-sm font-semibold">{name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <div className="body-sm text-white">£{price.toFixed(2)}</div>
          <EnhancedButton size="sm" variant="secondary" onClick={onAddToCartAction}>Add</EnhancedButton>
        </div>
      </div>
    </article>
  );
}
