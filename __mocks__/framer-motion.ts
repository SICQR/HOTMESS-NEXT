import React from 'react';

interface MotionBaseProps extends React.HTMLAttributes<HTMLElement> {
  whileHover?: unknown;
  whileTap?: unknown;
  animate?: string;
  transition?: unknown;
  variants?: unknown;
  initial?: unknown;
  exit?: unknown;
}

function filterMotionProps(props: MotionBaseProps) {
  // Strip framer-only props so React warnings disappear in tests
  const { animate, ...rest } = props;
  const removed = new Set(['whileHover','whileTap','variants','initial','exit','transition']);
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(rest)) {
    if (!removed.has(key)) cleaned[key] = (rest as unknown as Record<string, unknown>)[key];
  }
  const dataProps: Record<string, string | undefined> = {
    'data-animate': animate ? String(animate) : undefined,
  };
  return { ...cleaned, ...dataProps };
}

function createMock(tag: keyof JSX.IntrinsicElements, displayName: string) {
  const Comp = React.forwardRef<HTMLElement, React.PropsWithChildren<MotionBaseProps>>(
    (props, ref) => {
      const { children } = props;
      return React.createElement(tag, { ref, ...filterMotionProps(props) }, children);
    }
  );
  Comp.displayName = displayName;
  return Comp;
}

const MotionDiv = createMock('div','MotionDivMock');
const MotionButton = createMock('button','MotionButtonMock');
const MotionAnchor = createMock('a','MotionAnchorMock');

export const motion = {
  div: MotionDiv,
  button: MotionButton,
  a: MotionAnchor,
};

export const useReducedMotion = () => false;

// Commonly imported helpers (no-ops)
export function AnimatePresence({ children }: { children?: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}
