// JWT + utility crypto helpers (server-only usage for sensitive functions)
import { SignJWT, jwtVerify } from 'jose';
import { JwtUser } from './types';

const secret = process.env.JWT_SECRET;

function getKey() {
  if (!secret) throw new Error('JWT_SECRET not configured');
  return new TextEncoder().encode(secret);
}

export async function signUser(user: Omit<JwtUser, 'iat' | 'exp'>, ttlSeconds = 60 * 60) {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtUser = { ...user, iat: now, exp: now + ttlSeconds };
  const token = await new SignJWT({ tier: payload.tier })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt(payload.iat)
    .setExpirationTime(payload.exp)
    .sign(getKey());
  return { token, payload };
}

export async function verifyUserToken(token: string): Promise<JwtUser> {
  const { payload, protectedHeader } = await jwtVerify(token, getKey());
  if (protectedHeader.alg !== 'HS256') throw new Error('Unexpected alg');
  const tier = typeof (payload as Record<string, unknown>).tier === 'string'
    ? (payload as Record<string, unknown>).tier as JwtUser['tier']
    : 'guest';
  return {
    sub: payload.sub as string,
    tier,
    iat: payload.iat as number,
    exp: payload.exp as number,
  };
}
