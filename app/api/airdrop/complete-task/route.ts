import { NextRequest, NextResponse } from 'next/server'
import { completeTask } from '../../../../lib/airdrop-system'

export async function POST(request: NextRequest) {
  try {
    const { taskId, answerChoice } = await request.json()
    const userId = 'current-user-id'
    
    const success = await completeTask(userId, taskId, answerChoice)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Task completed successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Task already completed or failed to complete' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error completing task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete task' },
      { status: 500 }
    )
  }
}
