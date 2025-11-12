// Test utilities for building Requests and setting env safely

export type EnvMap = Record<string, string>;

// Build a minimal Request-like object that satisfies route handlers (no undici/global deps)
export function buildJsonRequest(
  url: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {}
) {
  const map = new Map<string, string>();
  // normalize header keys to lowercase for case-insensitive get()
  for (const [k, v] of Object.entries({ 'Content-Type': 'application/json', ...headers })) {
    map.set(k.toLowerCase(), v);
  }
  const req = {
    url,
    method,
    headers: {
      get: (key: string) => map.get(key.toLowerCase()) ?? null,
      has: (key: string) => map.has(key.toLowerCase()),
    },
    async json() {
      return body;
    },
    async text() {
      try { return JSON.stringify(body); } catch { return String(body); }
    },
  } as unknown as Request;
  return req;
}

export async function withEnv<T>(env: EnvMap, fn: () => Promise<T>): Promise<T> {
  const prev: Record<string, string | undefined> = {};
  for (const k of Object.keys(env)) {
    prev[k] = process.env[k];
    process.env[k] = env[k];
  }
  try {
    return await fn();
  } finally {
    for (const k of Object.keys(env)) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k] as string;
    }
  }
}

// Ensure this helper file doesn't fail Jest's requirement for at least one test when discovered
test('utils noop', () => { expect(true).toBe(true); });
