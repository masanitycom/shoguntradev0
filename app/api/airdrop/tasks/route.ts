import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId

    const { data: tasks, error: tasksError } = await supabase
      .from('airdrop_tasks')
      .select('*')
      .eq('is_active', true)

    if (tasksError) {
      console.error("Error fetching airdrop tasks:", tasksError)
      return NextResponse.json({ success: false, message: "タスクの取得に失敗しました" }, { status: 500 })
    }

    const { data: completions, error: completionsError } = await supabase
      .from('user_task_completions')
      .select('task_id, completed_at, reward_claimed')
      .eq('user_id', userId)

    if (completionsError) {
      console.error("Error fetching task completions:", completionsError)
      return NextResponse.json({ success: false, message: "完了状況の取得に失敗しました" }, { status: 500 })
    }

    const tasksWithStatus = tasks?.map(task => {
      const completion = completions?.find(c => c.task_id === task.id)
      return {
        ...task,
        completed: !!completion,
        completed_at: completion?.completed_at,
        reward_claimed: completion?.reward_claimed || false
      }
    }) || []

    return NextResponse.json({
      success: true,
      tasks: tasksWithStatus
    })
  } catch (error) {
    console.error("Error in airdrop tasks route:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId

    const body = await request.json()
    const { taskId, answers } = body

    if (!taskId || !answers) {
      return NextResponse.json({ success: false, message: "タスクIDと回答が必要です" }, { status: 400 })
    }

    const { data: existingCompletion, error: checkError } = await supabase
      .from('user_task_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single()

    if (existingCompletion) {
      return NextResponse.json({ success: false, message: "このタスクは既に完了しています" }, { status: 400 })
    }

    const { data: task, error: taskError } = await supabase
      .from('airdrop_tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ success: false, message: "タスクが見つかりません" }, { status: 404 })
    }

    const { data: completion, error: completionError } = await supabaseAdmin
      .from('user_task_completions')
      .insert({
        user_id: userId,
        task_id: taskId,
        completed_at: new Date().toISOString(),
        reward_claimed: false
      })
      .select()
      .single()

    if (completionError) {
      console.error("Error creating task completion:", completionError)
      return NextResponse.json({ success: false, message: "タスク完了の記録に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "タスクが完了しました",
      completion
    })
  } catch (error) {
    console.error("Error completing airdrop task:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
