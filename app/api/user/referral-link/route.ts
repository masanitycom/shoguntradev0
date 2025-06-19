import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { createClient } from '@supabase/supabase-js'

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

    const userIdForLink = user.user.user_metadata?.user_id || userId
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shoguntradev0.vercel.app'
    const referralLink = `${baseUrl}/register?ref=${userIdForLink}`

    return NextResponse.json({ 
      success: true, 
      referralLink,
      userId: userIdForLink,
      qrCodeData: referralLink
    })
  } catch (error) {
    console.error("Referral link generation error:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
