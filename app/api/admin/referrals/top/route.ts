import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, name, email')
      .limit(10)

    if (error) throw error

    const topReferrers = await Promise.all(
      (users || []).map(async (user) => {
        const { count: referralCount, error: refError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', user.user_id)

        const { data: purchases, error: purchaseError } = await supabase
          .from('nft_purchases')
          .select('purchase_price')
          .eq('user_id', user.user_id)

        const totalInvestment = purchases?.reduce((sum, p) => sum + p.purchase_price, 0) || 0

        return {
          ...user,
          referralCount: referralCount || 0,
          totalInvestment,
          rank: "足軽"
        }
      })
    )

    return NextResponse.json({
      success: true,
      referrers: topReferrers.sort((a, b) => b.referralCount - a.referralCount)
    })
  } catch (error) {
    console.error("Error fetching top referrers:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
