import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('airdrop_tasks')
      .select('*')
      .eq('is_active', true)

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
      return NextResponse.json({ success: false, message: "タスクの取得に失敗しました" }, { status: 500 })
    }

    const { data: completions, error: completionsError } = await supabaseAdmin
      .from('user_task_completions')
      .select(`
        *,
        profiles!inner(name, user_id)
      `)
      .gte('completed_at', weekStart.toISOString())

    if (completionsError) {
      console.error("Error fetching completions:", completionsError)
      return NextResponse.json({ success: false, message: "完了データの取得に失敗しました" }, { status: 500 })
    }

    const taskStats = tasks?.map(task => {
      const taskCompletions = completions?.filter(c => c.task_id === task.id) || []
      const answerCounts = [0, 0, 0, 0]
      
      taskCompletions.forEach(completion => {
        if (completion.answer_choice >= 0 && completion.answer_choice < 4) {
          answerCounts[completion.answer_choice]++
        }
      })

      return {
        ...task,
        completions: taskCompletions.length,
        answerBreakdown: task.choices.map((choice: string, index: number) => ({
          choice,
          count: answerCounts[index]
        }))
      }
    }) || []

    return NextResponse.json({
      success: true,
      weekStart: weekStart.toISOString().split('T')[0],
      tasks: taskStats,
      totalCompletions: completions?.length || 0
    })
  } catch (error) {
    console.error("Error in weekly tasks route:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
