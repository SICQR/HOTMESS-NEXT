import { render } from '@testing-library/react';
import React from 'react';
import AgeGate, { isAgeVerified } from '../components/AgeGate';

function setRawCookie(v: string) {
  Object.defineProperty(document, 'cookie', {
    value: v,
    writable: true,
    configurable: true
  });
}

describe('AgeGate (cookie)', () => {
  beforeEach(() => {
    setRawCookie('');
  });
  it('renders overlay when cookie missing', () => {
    const { getByText } = render(<AgeGate />);
    expect(getByText(/Adults Only/i)).toBeInTheDocument();
  });
  it('hides when hm_age_ok=1 cookie present', () => {
    setRawCookie('hm_age_ok=1');
    const { queryByText } = render(<AgeGate />);
    expect(queryByText(/Adults Only/i)).toBeNull();
  });
  it('isAgeVerified utility matches cookie', () => {
    setRawCookie('hm_age_ok=1');
    expect(isAgeVerified()).toBe(true);
  });
});
