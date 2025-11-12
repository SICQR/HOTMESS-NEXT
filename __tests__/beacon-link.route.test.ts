import { sanitizeTtlSeconds, mapIntentToParam } from '@/lib/links';

describe('beacon-link route contract (helpers)', () => {
  it('maps intents correctly', () => {
    expect(mapIntentToParam('listen')).toBe('radio');
    expect(mapIntentToParam('shop')).toBe('uber_home');
    expect(mapIntentToParam('join')).toBe('room');
  });

  it('sanitizes TTL range', () => {
    expect(sanitizeTtlSeconds('3')).toBe(10);
    expect(sanitizeTtlSeconds('2000')).toBe(120);
    expect(sanitizeTtlSeconds(45)).toBe(45);
  });
});
