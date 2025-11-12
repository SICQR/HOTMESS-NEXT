export type ServerTrackProps = Record<string, string | number | boolean | null>;

// Best-effort server-side analytics sender to the edge analytics function.
// Requires EDGE_ANALYTICS_URL rewrite (or absolute URL) and optional ANALYTICS_INGEST_SECRET at the destination.
export async function trackServer(event: string, props: ServerTrackProps = {}) {
  try {
    const dest = process.env.EDGE_ANALYTICS_URL || '/edge-analytics';
    const payload = {
      event,
      events: [{ event, props }],
      consent: { analytics: true },
    };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const secret = process.env.ANALYTICS_INGEST_SECRET;
    if (secret) headers['x-hm-analytics-secret'] = secret;
    await fetch(dest, { method: 'POST', headers, body: JSON.stringify(payload) });
  } catch {
    // Deliberately swallow errors to avoid impacting user flow
  }
}
