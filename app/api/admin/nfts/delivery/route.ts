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

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const body = await request.json()
    const { nftId, isDelivered } = body

    if (!nftId) {
      return NextResponse.json({ 
        success: false, 
        message: "NFT IDが必要です" 
      }, { status: 400 })
    }

    const { data: nft, error } = await supabaseAdmin
      .from('user_nfts')
      .update({
        is_delivered: isDelivered,
        delivery_date: isDelivered ? new Date().toISOString() : null
      })
      .eq('id', nftId)
      .select()
      .single()

    if (error) {
      console.error("Error updating NFT delivery status:", error)
      return NextResponse.json({ success: false, message: "配送状況の更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: isDelivered ? "NFTが送付済みに更新されました" : "NFTが未送付に更新されました",
      nft
    })
  } catch (error) {
    console.error("Error in NFT delivery update:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
