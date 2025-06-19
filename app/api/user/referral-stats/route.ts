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

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, name')
      .eq('id', userId)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json({ success: false, message: "ユーザー情報の取得に失敗しました" }, { status: 500 })
    }

    const { data: directReferrals, error: directError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, user_id, total_investment, created_at')
      .eq('referrer_id', userProfile.user_id)

    if (directError) {
      console.error("Error fetching direct referrals:", directError)
      return NextResponse.json({ success: false, message: "紹介者データの取得に失敗しました" }, { status: 500 })
    }

    const totalDirectReferrals = directReferrals?.length || 0
    const totalInvestmentFromReferrals = directReferrals?.reduce((sum, ref) => sum + (ref.total_investment || 0), 0) || 0

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shoguntradev0.vercel.app'
    const referralLink = `${baseUrl}/register?ref=${userProfile.user_id}`

    return NextResponse.json({
      success: true,
      stats: {
        directReferrals: totalDirectReferrals,
        totalInvestment: totalInvestmentFromReferrals,
        referralLink,
        referrals: directReferrals || []
      }
    })
  } catch (error) {
    console.error("Error fetching referral stats:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
