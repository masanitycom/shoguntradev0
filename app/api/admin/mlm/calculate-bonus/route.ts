import { NextResponse } from "next/server"
import { mlmQueries } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { totalBonus } = body

    // 入力検証
    if (!totalBonus || isNaN(totalBonus) || totalBonus <= 0) {
      return NextResponse.json({ success: false, message: "有効なボーナス金額を指定してください" }, { status: 400 })
    }

    // MLMボーナス計算
    const result = await mlmQueries.calculateMlmBonus(totalBonus)

    if (result.success) {
      return NextResponse.json({
        success: true,
        ranksData: result.ranksData,
      })
    } else {
      return NextResponse.json(
        { success: false, message: "MLMボーナス計算に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error calculating MLM bonus:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

