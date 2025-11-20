const SENSITIVE_KEY_RE = /secret|token|password|pass|key|authorization|ssn/i;
const MAX_STRING_LEN = 500;

function isPlainObject(v: any): v is Record<string, any> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export function redactEntry(input: any): any {
  if (input == null) return input;

  if (typeof input === 'string') {
    if (input.length > MAX_STRING_LEN) {
      return input.slice(0, MAX_STRING_LEN) + '...[REDACTED_TRUNCATED]';
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(redactEntry);
  }

  if (isPlainObject(input)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (SENSITIVE_KEY_RE.test(k)) {
        out[k] = '[REDACTED]';
        continue;
      }
      out[k] = redactEntry(v);
    }
    return out;
  }

  // primitives (number, boolean, etc.)
  return input;
}

export default redactEntry;
