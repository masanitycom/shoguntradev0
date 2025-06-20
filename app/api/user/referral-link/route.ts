import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import * as QRCode from 'qrcode'

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
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId

    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, name')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, message: "ユーザー情報の取得に失敗しました" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shoguntradev0.vercel.app'
    const referralLink = `${baseUrl}/register?ref=${userData.user_id}`

    const qrCodeDataUrl = await QRCode.toDataURL(referralLink, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    const { data: referralStats, error: statsError } = await supabaseAdmin
      .from('profiles')
      .select('direct_referrals, total_referrals')
      .eq('referrer_id', userData.user_id)

    const directReferrals = referralStats?.length || 0
    const totalReferrals = (referralStats?.reduce((sum, ref) => sum + (ref.total_referrals || 0), 0) || 0) + directReferrals

    return NextResponse.json({
      success: true,
      referralLink,
      qrCode: qrCodeDataUrl,
      userInfo: {
        userId: userData.user_id,
        name: userData.name
      },
      stats: {
        directReferrals,
        totalReferrals
      }
    })
  } catch (error) {
    console.error("Error generating referral link:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
