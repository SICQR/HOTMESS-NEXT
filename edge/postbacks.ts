import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const schema = z.object({
  click_id: z.string(),
  payout_gross: z.number(),
  net_after_fee: z.number(),
  status: z.string(),
  sig: z.string().optional()
})

serve(async (req) => {
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    await supabase.rpc('award_conversion', { clickid: parsed.click_id, payload: parsed })
    return new Response('ok', { status: 200 })
  } catch (e) {
    console.error(e)
    return new Response('error', { status: 400 })
  }
})
