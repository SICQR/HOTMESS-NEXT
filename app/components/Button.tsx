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
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-pink-500 to-violet-700 text-white hover:opacity-95 focus:ring-pink-400'
      : 'bg-[#333] text-white hover:bg-[#3a3a3a] focus:ring-[#666]';

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {text}
    </button>
  );
}
