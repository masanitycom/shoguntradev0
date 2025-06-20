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
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId

    const { data: userNfts, error } = await supabaseAdmin
      .from('user_nfts')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user NFTs (basic query):', error)
      const { data: altNfts, error: altError } = await supabaseAdmin
        .from('nft_purchases')
        .select('*')
        .eq('user_id', userId)
      
      if (altError) {
        console.error('Error fetching from nft_purchases:', altError)
        return NextResponse.json({ success: false, message: "NFTの取得に失敗しました" }, { status: 500 })
      }
      
      const formattedNfts = (altNfts || []).map((nft: any) => ({
        id: nft.id,
        purchase_price: nft.price || nft.purchase_price,
        delivery_status: nft.status === 'delivered' ? 'delivered' : 'pending',
        created_at: nft.created_at,
        nfts: {
          id: nft.nft_type_id,
          name: `SHOGUN NFT ${nft.price || nft.purchase_price}`,
          price_usdt: nft.price || nft.purchase_price,
          daily_return_rate: nft.daily_return_rate || 0.005,
          is_special: false,
          image_url: "/placeholder.svg"
        }
      }))
      
      return NextResponse.json({ success: true, nfts: formattedNfts })
    }

    const nftTypeIds = userNfts.map((nft: any) => nft.nft_type_id).filter(Boolean)
    let nftTypes: any[] = []
    
    if (nftTypeIds.length > 0) {
      const { data: types } = await supabaseAdmin
        .from('nft_types')
        .select('*')
        .in('id', nftTypeIds)
      nftTypes = types || []
    }

    const formattedNfts = (userNfts || []).map((nft: any) => {
      const nftType = nftTypes.find(type => type.id === nft.nft_type_id)
      return {
        id: nft.id,
        purchase_price: nft.purchase_price,
        delivery_status: nft.is_delivered ? 'delivered' : 'pending',
        created_at: nft.created_at,
        nfts: {
          id: nftType?.id || nft.nft_type_id,
          name: nftType?.name || `SHOGUN NFT ${nft.purchase_price}`,
          price_usdt: nftType?.price_usdt || nft.purchase_price,
          daily_return_rate: nftType?.daily_return_rate || 0.005,
          is_special: nftType?.is_special || false,
          image_url: "/placeholder.svg"
        }
      }
    })

    return NextResponse.json({ success: true, nfts: formattedNfts })
  } catch (error) {
    console.error("Error fetching user NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
