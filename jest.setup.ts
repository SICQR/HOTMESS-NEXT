import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { TextEncoder, TextDecoder } from 'util';

// Ensure TextEncoder/TextDecoder are available (used by various libs)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).TextEncoder === 'undefined') { (globalThis as any).TextEncoder = TextEncoder as any; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).TextDecoder === 'undefined') { (globalThis as any).TextDecoder = TextDecoder as any; }

// Provide a noop/stub fetch so tests can spyOn it even in jsdom without fetch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).fetch === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).fetch = (() => { throw new Error('Unexpected fetch() call in test'); }) as any;
}

// Minimal Web API stubs so next/server can import in Jest without real WHATWG env
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).Headers === 'undefined') {
  class SimpleHeaders {
    private m = new Map<string, string>();
    constructor(init?: Record<string, string>) {
      if (init) for (const [k, v] of Object.entries(init)) this.m.set(k.toLowerCase(), v);
    }
    get(k: string): string | null { return this.m.get(k.toLowerCase()) ?? null; }
    has(k: string): boolean { return this.m.has(k.toLowerCase()); }
    set(k: string, v: string): void { this.m.set(k.toLowerCase(), v); }
    append(k: string, v: string): void { this.set(k, v); }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Headers = SimpleHeaders;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).Request === 'undefined') {
  class StubRequest {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Request = StubRequest;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (globalThis as any).Response === 'undefined') {
  class StubResponse {
    private _body: unknown;
    public status: number;
    public ok: boolean;
    public headers: Headers;
    constructor(body?: unknown, init?: ResponseInit) {
      this._body = body;
      this.status = (init?.status as number) ?? 200;
      this.ok = this.status >= 200 && this.status < 300;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const H: any = (globalThis as any).Headers;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.headers = new H((init?.headers as any) as Record<string, string>);
    }
    async json(): Promise<unknown> {
      try { return typeof this._body === 'string' ? JSON.parse(this._body) : JSON.parse(JSON.stringify(this._body ?? {})); }
      catch { return this._body; }
    }
    async text(): Promise<string> { return typeof this._body === 'string' ? this._body : JSON.stringify(this._body ?? {}); }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Response = StubResponse;
}

// Add static Response.json if missing (NextResponse.json relies on it)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(globalThis as any).Response.json) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Response.json = (data: unknown, init?: ResponseInit) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const R: any = (globalThis as any).Response;
    return new R(JSON.stringify(data), { ...(init || {}), headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  };
}

  // Use safe mode env defaults during tests to avoid throwing on missing envs
  process.env.NEXT_SAFE_MODE = process.env.NEXT_SAFE_MODE || '1';

class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    // simulate asynchronous intersection
    setTimeout(() => {
      this.callback([
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target,
          time: Date.now(),
          boundingClientRect: target.getBoundingClientRect(),
          rootBounds: target.getBoundingClientRect(),
        } as IntersectionObserverEntry,
      ], this as unknown as IntersectionObserver);
    }, 0);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

// @ts-expect-error Assigning test mock
global.IntersectionObserver = MockIntersectionObserver;

// Use safe mode env defaults during tests to avoid throwing on missing envs
process.env.NEXT_SAFE_MODE = process.env.NEXT_SAFE_MODE || '1';
