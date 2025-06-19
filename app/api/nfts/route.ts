import { NextResponse } from "next/server"
import { ALL_NFTS, STANDARD_NFTS, SPECIAL_NFTS } from "../../../lib/nft-system"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      nfts: STANDARD_NFTS,
      specialNfts: SPECIAL_NFTS,
      totalCount: ALL_NFTS.length
    })
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

