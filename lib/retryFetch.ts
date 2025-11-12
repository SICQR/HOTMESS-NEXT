// Exponential-ish backoff with jitter for fetch
// Retries on network errors and 5xx status codes

export type RetryOptions = {
  attempts?: number; // total attempts including initial try
  minDelayMs?: number;
  maxDelayMs?: number;
  retryOnStatuses?: number[]; // defaults to 500-599
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit, opts: RetryOptions = {}): Promise<Response> {
  const attempts = Math.max(1, opts.attempts ?? 3);
  const minDelay = opts.minDelayMs ?? 200;
  const maxDelay = opts.maxDelayMs ?? 500;
  const retryStatuses = opts.retryOnStatuses ?? [];

  let lastErr: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(input, init);
      const status = res.status;
      const retryable = status >= 500 && status < 600 || (retryStatuses.length > 0 && retryStatuses.includes(status));
      if (!retryable) return res;
    } catch (e) {
      lastErr = e;
    }
    // jitter delay
    const delay = minDelay + Math.random() * Math.max(0, maxDelay - minDelay);
    await sleep(delay);
  }
  if (lastErr) throw lastErr;
  // One final attempt (best effort)
  return fetch(input, init);
}
