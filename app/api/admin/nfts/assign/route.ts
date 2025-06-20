import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, nftTypeId, purchasePrice, purchaseDate, isDelivered } = body

    if (!userId || !nftTypeId || !purchasePrice) {
      return NextResponse.json({ 
        success: false, 
        message: "ユーザーID、NFTタイプID、購入価格が必要です" 
      }, { status: 400 })
    }

    const { data: existingNft, error: checkError } = await supabaseAdmin
      .from('user_nfts')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingNft) {
      return NextResponse.json({ 
        success: false, 
        message: "このユーザーは既にNFTを保有しています（1人1枚制限）" 
      }, { status: 400 })
    }

    const { data: nftAssignment, error } = await supabaseAdmin
      .from('user_nfts')
      .insert({
        user_id: userId,
        nft_type_id: nftTypeId,
        purchase_price: purchasePrice,
        purchase_date: purchaseDate || new Date().toISOString(),
        is_delivered: isDelivered || false,
        delivery_date: isDelivered ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) {
      console.error("Error assigning NFT:", error)
      return NextResponse.json({ success: false, message: "NFT割り当てに失敗しました" }, { status: 500 })
    }

    await supabaseAdmin
      .from('profiles')
      .update({ 
        total_investment: supabaseAdmin.rpc('increment', { x: purchasePrice })
      })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      message: "NFTが正常に割り当てられました",
      assignment: nftAssignment
    })
  } catch (error) {
    console.error("Error in NFT assignment:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
