import { NextResponse } from "next/server"
import { rewardQueries } from "@/lib/database"

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
    const result = await rewardQueries.claimReward(userId, claimType, feedback)

    if (result.success) {
      return NextResponse.json({
        success: true,
        amount: result.amount,
        fee: result.fee,
        netAmount: result.netAmount,
      })
    } else {
      return NextResponse.json(
        { success: false, message: "報酬申請に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error claiming reward:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

