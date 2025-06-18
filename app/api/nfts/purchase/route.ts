import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nftId } = body

    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    // 入力検証
    if (!nftId) {
      return NextResponse.json({ success: false, message: "NFT IDが必要です" }, { status: 400 })
    }

    // NFT購入
    const result = await nftQueries.purchaseNft(userId, nftId)

    if (result.success) {
      return NextResponse.json({ success: true, purchase: result.purchase })
    } else {
      return NextResponse.json(
        { success: false, message: result.error || "NFT購入に失敗しました" },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error purchasing NFT:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

