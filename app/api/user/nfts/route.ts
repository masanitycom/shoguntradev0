import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
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

export async function GET() {
  try {
    console.log("=== USER NFTS API START ===")
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId
    console.log("User ID from JWT:", userId)

    console.log("Querying user_nfts table for user:", userId)
    const { data: userNfts, error } = await supabaseAdmin
      .from('user_nfts')
      .select('*')
      .eq('user_id', userId)

    console.log("User NFTs query result:", { count: userNfts?.length || 0, error: error?.message })

    if (error) {
      console.error('Error fetching user NFTs:', error)
      return NextResponse.json({ success: false, message: "NFTの取得に失敗しました" }, { status: 500 })
    }

    console.log("Raw user NFTs data:", userNfts)

    if (!userNfts || userNfts.length === 0) {
      console.log("No user NFTs found")
      return NextResponse.json({ success: true, nfts: [] })
    }

    const nftTypeIds = userNfts.map((nft: any) => nft.nft_type_id).filter(Boolean)
    console.log("NFT type IDs to fetch:", nftTypeIds)

    let nftTypes: any[] = []
    if (nftTypeIds.length > 0) {
      const { data: types, error: typesError } = await supabaseAdmin
        .from('nft_types')
        .select('*')
        .in('id', nftTypeIds)
      
      console.log("NFT types query result:", { count: types?.length || 0, error: typesError?.message })
      
      if (typesError) {
        console.log("NFT types query failed, using fallback data")
        nftTypes = []
      } else {
        nftTypes = types || []
      }
    }

    const formattedNfts = (userNfts || []).map((nft: any) => {
      console.log("Processing NFT:", nft)
      const nftType = nftTypes.find(type => type.id === nft.nft_type_id)
      console.log("Found NFT type:", nftType)
      
      const nftPrice = nft.purchase_price || 300
      const nftName = nftType?.name || `SHOGUN NFT${nftPrice}`
      const dailyRate = nftType?.daily_return_rate || (nftPrice <= 500 ? 0.005 : nftPrice <= 5000 ? 0.01 : nftPrice <= 10000 ? 0.0125 : nftPrice <= 30000 ? 0.015 : nftPrice <= 50000 ? 0.0175 : 0.02)
      
      return {
        id: nft.id,
        purchase_price: nftPrice,
        delivery_status: nft.is_delivered ? 'delivered' : 'pending',
        created_at: nft.created_at,
        nfts: {
          id: nftType?.id || nft.nft_type_id,
          name: nftName,
          price_usdt: nftType?.price_usdt || nftPrice,
          daily_return_rate: dailyRate,
          is_special: nftType?.is_special || false,
          image_url: nftType?.image_url || "/placeholder.svg"
        }
      }
    })

    console.log("Formatted NFTs:", formattedNfts)
    console.log("=== USER NFTS API SUCCESS ===")
    return NextResponse.json({ success: true, nfts: formattedNfts })
  } catch (error) {
    console.error("=== USER NFTS API ERROR ===")
    console.error("Error fetching user NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
