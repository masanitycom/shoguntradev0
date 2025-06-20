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

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId

    const userRankResult = await mlmQueries.getUserRank(userId)
    const referralTreeResult = await mlmQueries.getReferralTree(userId)

    if (!userRankResult.success) {
      return NextResponse.json(userRankResult, { status: 500 })
    }

    if (!referralTreeResult.success) {
      return NextResponse.json(referralTreeResult, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      rank: userRankResult.rank,
      investment: userRankResult.investment,
      referrals: referralTreeResult.referrals?.length || 0,
      nextRankRequirement: userRankResult.nextRankRequirement
    })
  } catch (error) {
    console.error("Error fetching MLM stats:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
