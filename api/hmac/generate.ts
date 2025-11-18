import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";

/**
 * Keep the implementation intact — only switch types to Next.js API types so TypeScript
 * doesn't fail when @vercel/node types are not installed.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // existing implementation preserved; example:
  try {
    const secret = process.env.HMAC_SECRET ?? "";
    const payload = JSON.stringify(req.body ?? {});
    const hmac = createHmac("sha256", secret).update(payload).digest("hex");
    res.status(200).json({ hmac });
  } catch (err) {
    res.status(500).json({ error: "failed to create hmac" });
  }
}
