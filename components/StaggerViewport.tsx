'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { containerStagger } from '@/lib/motion';

type Props = {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  amount?: number;
  ariaLabelledby?: string;
  role?: React.AriaRole;
};

export default function StaggerViewport({
  children,
  className,
  once = true,
  amount = 0.2,
  ariaLabelledby,
  role,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || show) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= amount) {
            setShow(true);
            if (once) observer.disconnect();
            break;
          }
        }
      },
      { threshold: [amount, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount, once, show]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerStagger}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      aria-labelledby={ariaLabelledby}
      role={role}
      data-show={show ? 'true' : 'false'}
    >
      {children}
    </motion.div>
  );
}
