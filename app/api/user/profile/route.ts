import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createClient } from '@supabase/supabase-js'
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

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

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shogun-trade-secret') as any
    const userId = decoded.userId

    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (error || !user) {
      return NextResponse.json({ success: false, message: "ユーザー情報の取得に失敗しました" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.user.id,
        email: user.user.email,
        name: user.user.user_metadata?.name,
        name_kana: user.user.user_metadata?.name_kana,
        user_id: user.user.user_metadata?.user_id,
        phone: user.user.user_metadata?.phone,
        referrer_id: user.user.user_metadata?.referrer_id,
        usdt_address: user.user.user_metadata?.usdt_address,
        wallet_type: user.user.user_metadata?.wallet_type,
        role: user.user.user_metadata?.role || 'user'
      }
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
