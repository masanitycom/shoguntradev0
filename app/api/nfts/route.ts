import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"

export async function GET() {
  try {
    const result = await nftQueries.getAllNfts()

    if (result.success) {
      // 特別NFTをフィルタリング（通常ユーザー向け）
      const regularNfts = result.nfts.filter((nft) => !nft.is_special && nft.is_active)

      return NextResponse.json({ success: true, nfts: regularNfts })
    } else {
      return NextResponse.json(
        { success: false, message: "NFT情報の取得に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

