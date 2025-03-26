import { NextResponse } from "next/server"
import { rewardQueries } from "@/lib/database"

export async function POST() {
  try {
    // 報酬計算
    const result = await rewardQueries.calculateRewards()

    if (result.success) {
      return NextResponse.json({
        success: true,
        processedCount: result.processedCount,
      })
    } else {
      return NextResponse.json(
        { success: false, message: "報酬計算に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error calculating rewards:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

