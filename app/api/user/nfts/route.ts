import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const result = await nftQueries.getUserNfts(userId)

    if (result.success) {
      return NextResponse.json({ success: true, nfts: result.nfts })
    } else {
      return NextResponse.json(
        { success: false, message: "NFT情報の取得に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching user NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
