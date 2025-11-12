import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/log';

const rewardsQuerySchema = z.object({
  userId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = rewardsQuerySchema.safeParse({
      userId: searchParams.get('userId'),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID', details: result.error.issues },
        { status: 400 }
      );
    }

    const { userId } = result.data;

    // Get user's total rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId);

    if (rewardsError) {
      logger.error('Failed to fetch user rewards', { error: rewardsError, userId });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rewards' },
        { status: 500 }
      );
    }

    // Calculate total points
    const totalPoints = rewards?.reduce((sum, reward) => sum + (reward.points || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        userId,
        totalPoints,
        rewards: rewards || [],
        scanCount: rewards?.length || 0,
      },
    });

  } catch (error) {
    logger.error('QR rewards API error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// curl examples:
// Fetch user rewards
// curl -sS "http://localhost:3000/api/qr/rewards?userId=demo_user" | jq .

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const redeemSchema = z.object({
      userId: z.string().uuid('Invalid user ID'),
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

    // Get user's current total points
    const { data: rewards, error: rewardsError } = await supabase
      .from('user_rewards')
      .select('points')
      .eq('user_id', userId);

    if (rewardsError) {
      logger.error('Failed to fetch user rewards for redemption', { error: rewardsError, userId });
      return NextResponse.json(
        { success: false, error: 'Failed to check points balance' },
        { status: 500 }
      );
    }

    const totalPoints = rewards?.reduce((sum, reward) => sum + (reward.points || 0), 0) || 0;

    if (totalPoints < pointsToRedeem) {
      return NextResponse.json(
        { success: false, error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // TODO: Implement actual reward redemption logic
    // For now, just log the redemption
    logger.info('Points redeemed', { userId, pointsToRedeem, rewardType, availablePoints: totalPoints });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Points redeemed successfully!',
        pointsRedeemed: pointsToRedeem,
        remainingPoints: totalPoints - pointsToRedeem,
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