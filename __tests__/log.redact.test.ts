import { redactEntry } from '@/lib/log';

describe('redactEntry', () => {
  it('redacts sensitive keys', () => {
    const input = {
      username: 'alice',
      password: 'secret123',
      token: 'bearer-xyz',
      apiKey: 'key-abc',
      ssn: '123-45-6789',
      email: 'alice@example.com',
    };

    const result = redactEntry(input) as Record<string, unknown>;

    expect(result.username).toBe('alice');
    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.apiKey).toBe('[REDACTED]');
    expect(result.ssn).toBe('[REDACTED]');
    expect(result.email).toBe('alice@example.com');
  });

  it('truncates long strings', () => {
    const longString = 'a'.repeat(600);
    const result = redactEntry(longString);

    expect(typeof result).toBe('string');
    expect((result as string).length).toBeLessThan(600);
    expect((result as string).endsWith('...[truncated]')).toBe(true);
  });

  it('preserves non-sensitive fields', () => {
    const input = {
      name: 'John Doe',
      age: 30,
      isActive: true,
      metadata: {
        userId: '12345',
        level: 'premium',
      },
    };

    const result = redactEntry(input) as Record<string, unknown>;

    expect(result.name).toBe('John Doe');
    expect(result.age).toBe(30);
    expect(result.isActive).toBe(true);
    expect(result.metadata).toEqual({
      userId: '12345',
      level: 'premium',
    });
  });

  it('handles nested objects with sensitive keys', () => {
    const input = {
      user: {
        name: 'Bob',
        credentials: {
          password: 'hidden',
          secret: 'also-hidden',
        },
      },
      publicData: 'visible',
    };

    const result = redactEntry(input) as Record<string, unknown>;
    const user = result.user as Record<string, unknown>;
    const credentials = user.credentials as Record<string, unknown>;

    expect(user.name).toBe('Bob');
    expect(credentials.password).toBe('[REDACTED]');
    expect(credentials.secret).toBe('[REDACTED]');
    expect(result.publicData).toBe('visible');
  });

  it('handles arrays', () => {
    const input = [
      { name: 'item1', token: 'secret1' },
      { name: 'item2', token: 'secret2' },
    ];

    const result = redactEntry(input) as Array<Record<string, unknown>>;

    expect(result[0].name).toBe('item1');
    expect(result[0].token).toBe('[REDACTED]');
    expect(result[1].name).toBe('item2');
    expect(result[1].token).toBe('[REDACTED]');
  });

  it('handles null and undefined', () => {
    expect(redactEntry(null)).toBe(null);
    expect(redactEntry(undefined)).toBe(undefined);
  });

  it('handles primitives', () => {
    expect(redactEntry(42)).toBe(42);
    expect(redactEntry(true)).toBe(true);
    expect(redactEntry('hello')).toBe('hello');
  });

  it('matches case-insensitive sensitive patterns', () => {
    const input = {
      PASSWORD: 'should-redact',
      Token: 'should-redact',
      API_KEY: 'should-redact',
      Authorization: 'should-redact',
    };

    const result = redactEntry(input) as Record<string, unknown>;

    expect(result.PASSWORD).toBe('[REDACTED]');
    expect(result.Token).toBe('[REDACTED]');
    expect(result.API_KEY).toBe('[REDACTED]');
    expect(result.Authorization).toBe('[REDACTED]');
  });
});
