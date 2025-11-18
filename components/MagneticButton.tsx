import React from 'react';
import { motion } from 'framer-motion';
import { makeTransition } from '../lib/motion';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

export function MagneticButton({ children, className = '', ...rest }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={makeTransition(0.18)}
      className={`bg-[var(--hm-color-primary)] text-white px-4 py-2 rounded ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export default MagneticButton;
