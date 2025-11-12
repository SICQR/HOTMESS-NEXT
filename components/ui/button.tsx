'use client';
import * as React from 'react';
import Link from 'next/link';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  href?: string;
  prefetch?: boolean;
};

export function Button({ asChild, variant = 'default', className = '', href, prefetch, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-full px-5 py-2 font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60';
  const variants: Record<string, string> = {
    default: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-gray-600 text-white hover:bg-gray-800',
    ghost: 'text-red-500 hover:text-red-400',
  };
  const cls = `${base} ${variants[variant] || ''} ${className}`.trim();

  if (asChild && href) {
    return (
      <Link href={href} className={cls} prefetch={prefetch}>
        {props.children}
      </Link>
    );
  }

  return <button className={cls} {...props} />;
}
