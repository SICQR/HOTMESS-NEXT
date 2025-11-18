import type { NextApiRequest, NextApiResponse } from 'next';
import { createHmac } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.LINK_SIGNING_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'LINK_SIGNING_SECRET not configured' });
  }

  try {
    const { targetUrl, expiresIn = 86400 } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' });
    }

    // Generate expiration timestamp (default 24 hours)
    const exp = Math.floor(Date.now() / 1000) + expiresIn;

    // Create HMAC signature
    const payload = `${targetUrl}:${exp}`;
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const sig = hmac.digest('hex');

    // Construct signed link
    const url = new URL(targetUrl);
    url.searchParams.set('sig', sig);
    url.searchParams.set('exp', exp.toString());
    const signedLink = url.toString();

    return res.status(200).json({
      signedLink,
      sig,
      exp,
    });
  } catch (error) {
    console.error('Error generating HMAC:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}
