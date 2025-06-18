import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const { data: rewards, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rewards:', error)
      return NextResponse.json({ success: false, message: "報酬の取得に失敗しました" }, { status: 500 })
    }

    const totalRewards = rewards?.reduce((sum, r) => sum + r.amount, 0) || 0
    const claimedRewards = rewards?.filter(r => r.claimed).reduce((sum, r) => sum + r.amount, 0) || 0
    const pendingRewards = totalRewards - claimedRewards

    return NextResponse.json({
      success: true,
      rewards: rewards || [],
      summary: {
        totalRewards,
        claimedRewards,
        pendingRewards
      }
    })
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
