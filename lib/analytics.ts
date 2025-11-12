import ky from 'ky'

export interface AnalyticsPayload {
  event: string;
  props: Record<string, string | number | boolean | null>;
  ts: number;
}

type TrackProps = Record<string, string | number | boolean | null>;

export async function track(event: string, props: TrackProps = {}) {
  const payload: AnalyticsPayload = { event, props, ts: Date.now() };
  try {
    await ky.post('/api/analytics', { json: payload });
  } catch {
    // swallow errors silently
  }
}
