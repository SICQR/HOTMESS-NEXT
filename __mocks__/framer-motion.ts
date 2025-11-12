import React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement> & { animate?: string };

const Div = React.forwardRef<HTMLDivElement, React.PropsWithChildren<DivProps>>(
  ({ children, animate, ...rest }, ref) => {
    return React.createElement('div', { 'data-animate': animate, ref, ...rest }, children);
  }
);
Div.displayName = 'MotionDivMock';

export const motion = {
  div: Div,
};
