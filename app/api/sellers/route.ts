import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/log';
import { SellerOnboardingSchema } from '@/lib/schemas/onboarding';

export async function POST(request: Request) {
  try {
    const body = await request.json();
  const parsed = SellerOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }
    const { name, shopName, email, productCategory, productDescription, brandingAgreement } = parsed.data;

    // If an Edge Function URL is configured, proxy to it for validation/rate limiting.
    const edgeUrl = process.env.SELLERS_FUNCTION_URL;
    if (edgeUrl) {
      const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
      const resp = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ip ? { 'x-forwarded-for': ip } : {}),
        },
        body: JSON.stringify({ name, shopName, email, productCategory, productDescription, brandingAgreement }),
      });
      const payload = await safeJson(resp);
      return NextResponse.json(payload, { status: resp.status });
    }

    // Insert via Supabase anon key (ensure RLS permits inserts)
    const { data, error } = await supabase
      .from('sellers')
      .insert([
        {
          name,
          shop_name: shopName,
          email,
          product_category: productCategory ?? null,
          product_description: productDescription ?? null,
          branding_agreement: !!brandingAgreement,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error('sellers.insert', { error });
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function safeJson(resp: Response): Promise<unknown> {
  try {
    return await resp.json();
  } catch {
    return { ok: resp.ok };
  }
}

// curl examples:
// Create seller (replace values as needed)
// curl -sS -X POST http://localhost:3000/api/sellers \
//   -H 'Content-Type: application/json' \
//   -d '{
//         "name": "Alex",
//         "shopName": "Bold Designs Co",
//         "email": "alex@example.com",
//         "productCategory": "apparel",
//         "productDescription": "Graphic tees",
//         "brandingAgreement": true
//       }' | jq .
