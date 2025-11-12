// Edge/Deno environment shim declarations to satisfy TypeScript in Next.js project.
// These minimal declarations prevent build errors without altering logic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RequestHandler = (req: Request) => Promise<Response>;
// These imports remain external when deployed on Deno edge (Supabase Functions). For local TS, stub types.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const token = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')!

serve(async (req: Request) => {
  const signature = req.headers.get('x-hm-signature')
  if (signature !== token) return new Response('unauthorized', { status: 401 })
  const update = await req.json()
  const text = update.message?.text || ''
  if (text.startsWith('/checkin')) {
    await supabase.from('checkins').insert({ user_id: null, mood: 'ok' })
  }
  return new Response('ok')
})
