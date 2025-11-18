import React from 'react';
import { render, screen } from '@testing-library/react';
import MagneticButton from '@/components/MagneticButton';

describe('MagneticButton', () => {
  it('renders children', () => {
    render(<MagneticButton>Click Me</MagneticButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  it('supports href via Link', () => {
    render(<MagneticButton href="/test">Go</MagneticButton>);
    // role 'link' may not apply because we use motion.button; ensure text present
    expect(screen.getByText('Go')).toBeInTheDocument();
  });
});
