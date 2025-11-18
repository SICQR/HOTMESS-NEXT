import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.LINK_SIGNING_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'LINK_SIGNING_SECRET not configured' });
  }

  try {
    const { targetUrl, sig, exp } = req.query;

    if (!targetUrl || !sig || !exp) {
      return res.status(400).json({ 
        error: 'targetUrl, sig, and exp are required',
        valid: false 
      });
    }

    // Check expiration
    const expTimestamp = parseInt(exp as string, 10);
    const now = Math.floor(Date.now() / 1000);
    
    if (now > expTimestamp) {
      return res.status(200).json({ 
        valid: false, 
        reason: 'Link expired' 
      });
    }

    // Verify HMAC signature
    const payload = `${targetUrl}:${exp}`;
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSig = hmac.digest('hex');

    // Use timing-safe comparison
    const sigBuffer = Buffer.from(sig as string, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    const valid = sigBuffer.length === expectedBuffer.length && 
                  timingSafeEqual(sigBuffer, expectedBuffer);

    return res.status(200).json({ valid });
  } catch (error) {
    console.error('Error verifying HMAC:', error);
    return res.status(500).json({ 
      error: 'Failed to verify signature',
      valid: false 
    });
  }
}
