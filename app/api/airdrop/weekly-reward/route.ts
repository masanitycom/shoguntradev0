import { NextResponse } from 'next/server'
import { calculateWeeklyAirdropReward } from '../../../../lib/airdrop-system'

export async function GET() {
  try {
    const userId = 'current-user-id'
    const amount = await calculateWeeklyAirdropReward(userId)
    
    return NextResponse.json({
      success: true,
      amount
    })
  } catch (error) {
    console.error('Error calculating weekly reward:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate weekly reward' },
      { status: 500 }
    )
  }
}
