import 'server-only';
import { createHmac } from 'crypto';

export function sign(params: Record<string, string | number>, secret: string) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return createHmac('sha256', secret).update(sorted).digest('hex');
}

export function verify(params: URLSearchParams, secret: string) {
  const sig = params.get('sig') || '';
  const entries: Record<string,string> = {};
  params.forEach((v,k) => { if (k !== 'sig') entries[k] = v; });
  const expected = sign(entries, secret);
  return sig === expected;
}
