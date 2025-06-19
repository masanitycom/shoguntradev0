import { NextResponse } from "next/server"
import { mlmQueries } from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const referralStats = await mlmQueries.getReferralStats(userId)
    const mlmLevels = await mlmQueries.getMLMLevels()

    return NextResponse.json({ 
      success: true, 
      rank: "足軽", // Default rank for now
      investment: 0,
      referrals: referralStats,
      nextRankRequirement: mlmLevels[0] || null
    })
  } catch (error) {
    console.error("Error fetching MLM stats:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
