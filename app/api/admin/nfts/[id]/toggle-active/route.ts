import { NextRequest, NextResponse } from 'next/server'
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', decoded.userId)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const { is_active } = await request.json()

    const { data: nft, error } = await supabaseAdmin
      .from('nft_types')
      .update({ is_active })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling NFT active status:', error)
      return NextResponse.json({ success: false, message: "NFTの状態変更に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true, nft })
  } catch (error) {
    console.error("Error toggling NFT active status:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
