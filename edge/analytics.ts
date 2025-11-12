// @ts-nocheck
// HOTMESS EDGE: analytics ingest (consent-gated)
// Hardened: env validation, secret header optional, allowlist events, consent gating, CORS, structured JSON responses.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AnalyticsEvent { event?: string; props?: Record<string, unknown> | null }
interface AnalyticsPayload {
  event?: string; // single event form
  events?: AnalyticsEvent[]; // batch form
  consent?: { analytics?: boolean } | null;
  props?: Record<string, unknown> | null; // single event props
  occurredAt?: string;
  user?: { id?: string } | null;
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const INGEST_SECRET = Deno.env.get('ANALYTICS_INGEST_SECRET'); // optional shared secret

// Fail closed if core env missing
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[HM] edge/analytics missing Supabase env');
}

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const allowedEvents = new Set([
  'page_view',
  'radio_play',
  'qr_scan',
  'offer_click',
  'login',
  'logout'
]);

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-HM-Analytics-Secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  } as Record<string,string>;
}

serve(async (req: Request) => {
  const method = req.method.toUpperCase();
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (method !== 'POST') {
    return json(405, { success: false, error: { message: 'method_not_allowed' } });
  }

  // Secret header check (if configured)
  if (INGEST_SECRET) {
    const provided = req.headers.get('x-hm-analytics-secret');
    if (!provided || provided !== INGEST_SECRET) {
      return json(403, { success: false, error: { message: 'forbidden' } });
    }
  }

  let body: AnalyticsPayload;
  try {
    body = await req.json() as AnalyticsPayload;
  } catch {
    return json(400, { success: false, error: { message: 'bad_json' } });
  }

  const { event, events, consent, props, occurredAt, user } = body || {};
  if (!event && (!events || !Array.isArray(events) || events.length === 0)) {
    return json(400, { success: false, error: { message: 'invalid_event' } });
  }
  // Validate all events
  const evts: AnalyticsEvent[] = events && Array.isArray(events) && events.length > 0
    ? events
    : [{ event, props }];
  if (!evts.every(e => e.event && allowedEvents.has(e.event))) {
    return json(400, { success: false, error: { message: 'invalid_event' } });
  }
  if (!(consent?.analytics)) {
    // Respect consent: acknowledge but do not persist
    return json(202, { success: true, data: { accepted: false, reason: 'no_consent' } });
  }

  if (!supabase) {
    return json(500, { success: false, error: { message: 'server_misconfig' } });
  }

  const roomId = (props?.room_id as string) || 'site';
  const nowIso = new Date().toISOString();
  const when = occurredAt && !Number.isNaN(Date.parse(occurredAt)) ? occurredAt : nowIso;
  const userId = user?.id || null;

  const rows = evts.map(e => ({
    room_id: roomId,
    template_id: e.event,
    sent_count: 1,
    occurred_at: when,
    user_id: userId,
    meta: e.props || {},
  })) as Record<string, unknown>[];

  const { error } = await supabase.from('messages').insert(rows);
  if (error) {
    console.error('[HM] analytics insert error', error);
    return json(500, { success: false, error: { message: 'insert_failed' } });
  }
  return new Response(JSON.stringify({ success: true, data: { stored: true } }), {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  });
});
