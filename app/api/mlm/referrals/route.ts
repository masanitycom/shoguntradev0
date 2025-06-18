import { NextResponse } from "next/server"
import { mlmQueries } from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const parentId = searchParams.get("parentId")

    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const result = await mlmQueries.getReferralTree(userId, page, limit, parentId || undefined)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        referrals: result.referrals,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      })
    } else {
      return NextResponse.json(
        { success: false, message: "紹介ツリーの取得に失敗しました", error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error fetching referral tree:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
