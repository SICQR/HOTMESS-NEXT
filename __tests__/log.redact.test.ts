import { redactEntry } from '@/lib/log';

describe('redactEntry', () => {
  it('redacts secret-like keys and truncates long values', () => {
    const payload = {
      message: 'hi',
      token: 'abcd1234secret',
      nested: { password: 'p', ok: 'v' },
      long: 'x'.repeat(300),
    };
    const r = redactEntry(payload) as Record<string, unknown>;
    expect(r.token).toBe('[REDACTED]');
    expect((r.nested as Record<string, unknown>).password).toBe('[REDACTED]');
    expect(r.long).toMatch(/\[TRUNCATED\]$/);
    expect(r.message).toBe('hi');
  });
});
