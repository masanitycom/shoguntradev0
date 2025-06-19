import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: nftTypes, error } = await supabase
      .from('nft_types')
      .select('*')
      .eq('is_active', true)
      .order('price_usdt', { ascending: true })

    if (error) {
      console.error("Error fetching NFTs from database:", error)
      return NextResponse.json({ success: false, message: "NFTデータの取得に失敗しました" }, { status: 500 })
    }

    const regularNfts = nftTypes?.filter((nft) => !nft.is_special) || []
    const specialNfts = nftTypes?.filter((nft) => nft.is_special) || []

    return NextResponse.json({ 
      success: true, 
      nfts: regularNfts,
      specialNfts: specialNfts,
      totalCount: nftTypes?.length || 0
    })
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

