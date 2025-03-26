import { NextResponse } from "next/server"
import { mlmQueries } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    if (!userId) {
      return NextResponse.json({ success: false, message: "ユーザーIDが指定されていません" }, { status: 400 })
    }

    const result = await mlmQueries.getUserRank(userId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        rank: result.rank,
        reason: result.reason,
        stats: result.stats,
      })
    } else {
      return NextResponse.json(
        { success: false, message: "ランク情報の取得に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching user rank:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

