import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/log';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id_required' }, { status: 400 });
    }

    // Placeholder: return empty rewards for now
    return NextResponse.json({ success: true, data: { userId, totalPoints: 0, rewards: [], scanCount: 0 } });
  } catch (error) {
    logger.error('QR rewards GET error', { error });
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const redeemSchema = z.object({
      userId: z.string().min(1, 'User ID required'),
      pointsToRedeem: z.number().min(1, 'Must redeem at least 1 point'),
      rewardType: z.string().min(1, 'Reward type required'),
    });

    const result = redeemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      );
    }

    const { userId, pointsToRedeem, rewardType } = result.data;

    // Enforce UUID userId in production unless explicit dev flag is set
    const allowMock = process.env.NEXT_PUBLIC_ALLOW_MOCK_IDS === '1' || process.env.NODE_ENV !== 'production';
    if (!allowMock) {
      const uuidCheck = z.string().uuid().safeParse(userId);
      if (!uuidCheck.success) {
        return NextResponse.json({ success: false, error: 'Invalid user ID format' }, { status: 400 });
      }
    }

    // TODO: Implement actual reward redemption logic
    logger.info('Points redeemed', { userId, pointsToRedeem, rewardType });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Points redeemed successfully!',
        pointsRedeemed: pointsToRedeem,
        remainingPoints: 0,
        rewardType,
      },
    });

  } catch (error) {
    logger.error('QR rewards redemption API error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}