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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { name, price, daily_rate, is_special, is_active, image_url } = await request.json()

    const { data: nft, error } = await supabaseAdmin
      .from('nft_types')
      .update({
        name,
        price_usdt: price,
        daily_return_rate: daily_rate / 100,
        is_special,
        is_active,
        image_url: image_url || "/placeholder.svg"
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating NFT:', error)
      return NextResponse.json({ success: false, message: "NFTの更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true, nft })
  } catch (error) {
    console.error("Error updating NFT:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await supabaseAdmin
      .from('nft_types')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting NFT:', error)
      return NextResponse.json({ success: false, message: "NFTの削除に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting NFT:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
