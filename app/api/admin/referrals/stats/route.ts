import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError

    const { count: totalReferrals, error: referralsError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('referrer_id', 'is', null)

    if (referralsError) throw referralsError

    const { data: purchases, error: purchasesError } = await supabase
      .from('nft_purchases')
      .select('purchase_price')

    if (purchasesError) throw purchasesError

    const totalInvestment = purchases?.reduce((sum, p) => sum + p.purchase_price, 0) || 0

    const { count: activeReferrers, error: activeError } = await supabase
      .from('users')
      .select('referrer_id', { count: 'exact', head: true })
      .not('referrer_id', 'is', null)

    if (activeError) throw activeError

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalReferrals: totalReferrals || 0,
        totalInvestment,
        activeReferrers: activeReferrers || 0
      }
    })
  } catch (error) {
    console.error("Error fetching admin referral stats:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
