// HOTMESS UPDATE: use unified JSON helpers to avoid brittle NextResponse in tests
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/log';
import { QRScanSchema } from '@/lib/schemas/qr';
import { deterministicPoints } from '@/lib/points';
import { jsonErr, jsonOk } from '@/lib/errors';

// Input validated via shared schema

export async function POST(request: Request | NextRequest) {
  try {
  const body = await request.json();
  const result = QRScanSchema.safeParse(body);
    
    if (!result.success) {
      return jsonErr('Invalid request data', 'bad_request', result.error.issues, { status: 400 });
    }

  const { qrCode, userId } = result.data;
  // Deterministic points 10..50 for same QR code
  const points = deterministicPoints(qrCode);

    // Log the scan event
    const { error: logError } = await supabase
      .from('qr_events')
      .insert([
        {
          qr_code: qrCode,
          user_id: userId || null,
          event_type: 'scan',
          points_awarded: points,
          created_at: new Date().toISOString(),
        },
      ]);

    if (logError) {
      logger.error('Failed to log QR scan event', { error: logError, qrCode, userId });
    }

    // If user is provided, upsert their rewards
    if (userId) {
      const { error: rewardError } = await supabase
        .from('user_rewards')
        .upsert([
          {
            user_id: userId,
            qr_code: qrCode,
            points: points,
            updated_at: new Date().toISOString(),
          },
        ], {
          onConflict: 'user_id,qr_code',
          ignoreDuplicates: false,
        });

      if (rewardError) {
        // Non-fatal: record the scan and still return points to the client
        logger.error('Failed to upsert user rewards', { error: rewardError, userId, qrCode });
      }
    }

    return jsonOk({
      points,
      message: `You earned ${points} points!`,
      qrCode,
    });

  } catch (error) {
    logger.error('QR scan API error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return jsonErr('Internal server error', 'internal', undefined, { status: 500 });
  }
}

// curl examples:
// Simulate scan (userId optional)
// curl -sS -X POST http://localhost:3000/api/qr/scan \
//   -H 'Content-Type: application/json' \
//   -d '{ "qrCode": "DEMO-CODE-123", "userId": "demo_user" }' | jq .