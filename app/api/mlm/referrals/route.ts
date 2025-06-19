import { NextResponse } from "next/server"
import { mlmQueries } from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const parentId = searchParams.get("parentId")

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const referrals = await mlmQueries.getReferralTree(userId)

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReferrals = referrals.slice(startIndex, endIndex)

    return NextResponse.json({ 
      success: true, 
      referrals: paginatedReferrals,
      totalCount: referrals.length,
      hasMore: endIndex < referrals.length
    })
  } catch (error) {
    console.error("Error fetching referral tree:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
