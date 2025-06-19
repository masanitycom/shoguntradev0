import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"
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

    const userNFTs = await nftQueries.getUserNFTs(userId)
    return NextResponse.json({ success: true, nfts: userNFTs })
  } catch (error) {
    console.error("Error fetching user NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
