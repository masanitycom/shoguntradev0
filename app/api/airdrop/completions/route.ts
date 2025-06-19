import { NextResponse } from 'next/server'
import { getUserTaskCompletions } from '../../../../lib/airdrop-system'

export async function GET() {
  try {
    const userId = 'current-user-id'
    const completions = await getUserTaskCompletions(userId)
    
    return NextResponse.json({
      success: true,
      completions
    })
  } catch (error) {
    console.error('Error fetching task completions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task completions' },
      { status: 500 }
    )
  }
}
