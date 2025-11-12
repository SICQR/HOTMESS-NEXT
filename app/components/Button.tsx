'use client';

import React from 'react';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
};

export default function Button({
  type = 'button',
  text,
  onClick,
  disabled,
  className = '',
  variant = 'primary',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-gradient-brand text-white hover:opacity-95'
      : 'bg-surface text-white border border-token hover:brightness-110';

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {text}
    </button>
  );
}
