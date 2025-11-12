// Centralized API error helper and types
export type ApiError = {
  message: string;
  code?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: ApiError | string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function apiError(message: string, code?: string, details?: unknown): ApiFailure {
  return { success: false, error: { message, ...(code ? { code } : {}) }, ...(details ? { details } : {}) };
}

// HOTMESS ADD: unified JSON helpers
export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  const body = JSON.stringify({ success: true, data });
  if (typeof globalThis.Response !== 'undefined') {
    return new Response(body, { ...(init || {}), headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  }
  // Fallback minimal response-like object for tests
  return { status: (init?.status as number) || 200, ok: true, json: async () => JSON.parse(body) } as unknown as Response;
}

export function jsonErr(message: string, code?: string, details?: unknown, init?: ResponseInit): Response {
  const body = JSON.stringify(apiError(message, code, details));
  if (typeof globalThis.Response !== 'undefined') {
    return new Response(body, { ...(init || {}), headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  }
  // Fallback minimal response-like object for tests
  return { status: (init?.status as number) || 200, ok: false, json: async () => JSON.parse(body) } as unknown as Response;
}
