import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"

export async function GET() {
  try {
    const nfts = await nftQueries.getAllNFTs()

    // 特別NFTをフィルタリング（通常ユーザー向け）
    const regularNfts = nfts.filter((nft: any) => !nft.is_special)

    return NextResponse.json({ success: true, nfts: regularNfts })
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

