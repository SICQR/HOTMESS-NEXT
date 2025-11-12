// HOTMESS ADD
import { deterministicPoints } from '@/lib/points';

describe('deterministicPoints', () => {
  it('is stable and within range', () => {
    const code = 'ABC123';
    const first = deterministicPoints(code);
    const second = deterministicPoints(code);
    expect(first).toBe(second);
    expect(first).toBeGreaterThanOrEqual(10);
    expect(first).toBeLessThanOrEqual(50);
  });
});
