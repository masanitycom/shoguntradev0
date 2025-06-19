import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nftId } = body

    const cookieStore = await cookies()
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
    const nftTypes = await nftQueries.getAllNFTs()
    const selectedNFT = nftTypes.find(nft => nft.id === nftId)
    
    if (!selectedNFT) {
      return NextResponse.json({ success: false, message: "NFTが見つかりません" }, { status: 404 })
    }

    const userNFT = await nftQueries.createUserNFT({
      user_id: userId,
      nft_type_id: nftId,
      purchase_price: selectedNFT.price_usdt,
      purchase_date: new Date().toISOString(),
      total_earned: 0,
      is_active: true
    })

    if (userNFT) {
      return NextResponse.json({ success: true, purchase: userNFT })
    } else {
      return NextResponse.json(
        { success: false, message: "NFT購入に失敗しました" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error purchasing NFT:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

