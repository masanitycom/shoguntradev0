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

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const { data: tasks, error } = await supabaseAdmin
      .from('airdrop_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching airdrop tasks:", error)
      return NextResponse.json({ success: false, message: "タスクの取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || []
    })
  } catch (error) {
    console.error("Error in admin airdrop tasks route:", error)
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

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, reward_amount, question, choices } = body

    if (!name || !description || !reward_amount || !question || !choices || choices.length !== 4) {
      return NextResponse.json({ 
        success: false, 
        message: "名前、説明、報酬額、質問、4つの選択肢が必要です" 
      }, { status: 400 })
    }

    const { data: task, error } = await supabaseAdmin
      .from('airdrop_tasks')
      .insert({
        name,
        description,
        reward_amount,
        question,
        choices,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating airdrop task:", error)
      return NextResponse.json({ success: false, message: "タスクの作成に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "タスクが作成されました",
      task
    })
  } catch (error) {
    console.error("Error creating airdrop task:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
