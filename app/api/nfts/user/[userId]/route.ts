import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    if (!userId) {
      return NextResponse.json({ success: false, message: "ユーザーIDが指定されていません" }, { status: 400 })
    }

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

