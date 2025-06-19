import { NextRequest, NextResponse } from 'next/server'
import { claimWeeklyAirdropReward } from '../../../../lib/airdrop-system'

export async function POST(request: NextRequest) {
  try {
    const userId = 'current-user-id'
    const amount = await claimWeeklyAirdropReward(userId)
    
    return NextResponse.json({
      success: true,
      amount,
      message: `${amount} USDT claimed successfully`
    })
  } catch (error) {
    console.error('Error claiming weekly reward:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to claim weekly reward' },
      { status: 500 }
    )
  }
}
