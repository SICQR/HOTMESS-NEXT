import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, affiliateCode, targetUrl, expirySeconds = 86400 } = req.body || {};
  if (!userId || !affiliateCode || !targetUrl) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  const secret = process.env.LINK_SIGNING_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Signing secret not configured' });
    return;
  }

  const exp = Math.floor(Date.now() / 1000) + Number(expirySeconds);
  const payload = `${userId}|${affiliateCode}|${targetUrl}|${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const signedLink = `${targetUrl.replace(/\/$/, '')}/a/${affiliateCode}?u=${encodeURIComponent(userId)}&exp=${exp}&sig=${sig}`;

  res.status(200).json({ signedLink, sig, exp });
}
