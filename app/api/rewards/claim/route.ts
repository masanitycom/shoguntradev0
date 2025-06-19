import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, claimType, feedback } = body

    // 入力検証
    if (!userId || !claimType) {
      return NextResponse.json({ success: false, message: "ユーザーIDと申請タイプが必要です" }, { status: 400 })
    }

    // 報酬申請タイプの検証
    if (claimType !== "airdrop" && claimType !== "compound") {
      return NextResponse.json({ success: false, message: "無効な申請タイプです" }, { status: 400 })
    }

    // 報酬受取の場合はフィードバックが必須
    if (claimType === "airdrop" && !feedback) {
      return NextResponse.json(
        { success: false, message: "報酬受取を選択した場合、フィードバックが必須です" },
        { status: 400 },
      )
    }

    // 報酬申請
    const { data: claim, error } = await supabase
      .from('weekly_rewards')
      .insert({
        user_id: userId,
        week_start: new Date().toISOString().split('T')[0],
        week_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        base_reward: 0,
        referral_bonus: 0,
        total_reward: 0,
        is_claimed: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reward claim:', error)
      return NextResponse.json(
        { success: false, message: "報酬申請に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "報酬申請が完了しました",
      claimId: claim.id
    })
  } catch (error) {
    console.error("Error claiming reward:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

