'use client';
import * as React from 'react';
import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
};

export default function FadeIn({ children, distance = 24, duration = 0.6, delay = 0, className }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || show) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShow(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [show]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={show ? { opacity: 1, y: 0, transition: { duration, delay } } : {}}
      className={className}
    >
      {children}
    </motion.div>
  );
}
