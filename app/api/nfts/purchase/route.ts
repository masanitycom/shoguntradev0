import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, nftId } = body

    // 入力検証
    if (!userId || !nftId) {
      return NextResponse.json({ success: false, message: "ユーザーIDとNFT IDが必要です" }, { status: 400 })
    }

    // NFT購入
    const result = await nftQueries.purchaseNft(userId, nftId)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, message: "NFT購入に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error purchasing NFT:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

