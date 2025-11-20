import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { u: userId, exp, sig, affiliateCode, targetUrl } = req.query || {};
  if (!userId || !exp || !sig || !affiliateCode || !targetUrl) {
    res.status(400).json({ error: 'Missing query parameters' });
    return;
  }

  const secret = process.env.LINK_SIGNING_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Signing secret not configured' });
    return;
  }

  const expires = Number(exp);
  if (Date.now() / 1000 > expires) {
    res.status(401).json({ valid: false, reason: 'expired' });
    return;
  }

  // Stronger verification: include targetUrl in payload
  const payload = `${userId}|${affiliateCode}|${targetUrl}|${exp}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const valid = expected === sig;
  res.status(200).json({ valid });
}
