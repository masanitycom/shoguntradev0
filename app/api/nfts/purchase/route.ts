import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js"
import { getNFTById } from '../../../../lib/nft-system'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getNFTDatabaseId(nftId: string): number | null {
  const nftIdMap: { [key: string]: number } = {
    'nft-300': 1,
    'nft-500': 2,
    'nft-1000': 3,
    'nft-3000': 4,
    'nft-5000': 5,
    'nft-10000': 6,
    'nft-30000': 7,
    'nft-100000': 8,
    'nft-100': 9,
    'nft-200': 10,
    'nft-600': 11,
    'nft-1177': 12,
    'nft-1300': 13,
    'nft-1500': 14,
    'nft-2000': 15,
    'nft-6600': 16,
    'nft-8000': 17
  }
  return nftIdMap[nftId] || null
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== NFT PURCHASE API START ===")
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId
    console.log("User ID from JWT:", userId)

    const { nftId } = await request.json()
    console.log("NFT ID from request:", nftId)

    if (!nftId) {
      console.log("Missing NFT ID")
      return NextResponse.json({ success: false, message: 'NFT IDが必要です' }, { status: 400 })
    }

    const nft = getNFTById(nftId)
    console.log("NFT from system:", nft)
    if (!nft) {
      console.log("NFT not found in system")
      return NextResponse.json({ success: false, message: 'NFTが見つかりません' }, { status: 404 })
    }

    const databaseNftId = getNFTDatabaseId(nftId)
    console.log("Database NFT ID mapping:", databaseNftId)
    if (!databaseNftId) {
      console.log("Invalid NFT ID mapping")
      return NextResponse.json({ success: false, message: 'NFT IDマッピングが無効です' }, { status: 400 })
    }

    console.log("Checking for existing user NFTs...")
    const { data: existingPurchases, error: existingError } = await supabaseAdmin
      .from('user_nfts')
      .select('id')
      .eq('user_id', userId)

    console.log("Existing NFTs check:", { count: existingPurchases?.length || 0, error: existingError?.message })

    if (existingError) {
      console.error('Error checking existing NFTs:', existingError)
      return NextResponse.json({ success: false, message: "既存のNFTチェックに失敗しました" }, { status: 500 })
    }

    if (existingPurchases && existingPurchases.length > 0) {
      console.log("User already owns an NFT")
      return NextResponse.json({ success: false, message: 'すでにNFTを所有しています（1人1枚まで）' }, { status: 400 })
    }

    console.log("Creating user NFT purchase record...")
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('user_nfts')
      .insert({
        user_id: userId,
        nft_type_id: databaseNftId,
        purchase_price: nft.price,
        is_delivered: false
      })
      .select()
      .single()

    console.log("Purchase creation result:", { success: !!purchase, error: purchaseError?.message })

    if (purchaseError) {
      console.error('Error creating NFT purchase:', purchaseError)
      return NextResponse.json({ success: false, message: 'NFT購入の作成に失敗しました' }, { status: 500 })
    }

    console.log("=== NFT PURCHASE API SUCCESS ===")
    return NextResponse.json({
      success: true,
      message: 'NFT購入が完了しました。管理者が入金確認後、ウォレットにNFTを送付します。',
      purchase: {
        id: purchase.id,
        nft_name: nft.name,
        price: nft.price,
        daily_rate: nft.dailyReturnRate * 100
      }
    })
  } catch (error) {
    console.error("=== NFT PURCHASE API ERROR ===")
    console.error('Error processing NFT purchase:', error)
    return NextResponse.json({ success: false, message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

