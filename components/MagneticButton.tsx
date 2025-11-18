import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { makeTransition } from '../lib/motion';

type Variant = 'primary' | 'outline' | 'ghost';
interface BaseProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLElement>;
}

function variantClasses(v: Variant): string {
  switch (v) {
    case 'outline':
      return 'border border-white/30 text-white hover:border-white/60 bg-transparent';
    case 'ghost':
      return 'text-white/80 hover:text-white bg-transparent';
    default:
      return 'bg-red-600 hover:bg-red-700 text-white';
  }
}

export function MagneticButton({ children, className = '', variant = 'primary', href, type = 'button', ...rest }: BaseProps) {
  const shared = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.98 },
    transition: makeTransition(0.18),
    className: `inline-flex select-none items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${variantClasses(variant)} ${className}`,
    ...rest,
  };
  if (href) {
    return (
      <Link href={href} prefetch legacyBehavior>
        {React.createElement(motion.a, { ...shared }, children)}
      </Link>
    );
  }
  return React.createElement(motion.button, { ...shared, type }, children);
}

export default MagneticButton;
