import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const cookieStore = cookies()
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

    const { count: totalPurchases, error: purchasesError } = await supabase
      .from('nft_purchases')
      .select('*', { count: 'exact', head: true })

    const { data: purchases, error: purchaseDataError } = await supabase
      .from('nft_purchases')
      .select('purchase_price')

    const totalRevenue = purchases?.reduce((sum, p) => sum + p.purchase_price, 0) || 0

    const { count: pendingDeliveries, error: deliveryError } = await supabase
      .from('nft_purchases')
      .select('*', { count: 'exact', head: true })
      .neq('delivery_status', 'delivered')

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalPurchases: totalPurchases || 0,
        totalRevenue,
        pendingDeliveries: pendingDeliveries || 0
      }
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
