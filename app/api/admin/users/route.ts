import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const offset = (page - 1) * limit

    let query = supabase
      .from('users')
      .select(`
        user_id,
        name,
        email,
        phone_number,
        referrer_id,
        created_at,
        role
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`user_id.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error } = await query

    if (error) throw error

    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) throw countError

    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { data: purchases, error: purchaseError } = await supabase
          .from('nft_purchases')
          .select('purchase_price')
          .eq('user_id', user.user_id)

        const { count: referralCount, error: referralError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', user.user_id)

        const totalInvestment = purchases?.reduce((sum, p) => sum + p.purchase_price, 0) || 0

        return {
          ...user,
          totalInvestment,
          referralCount: referralCount || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      totalCount: count || 0,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
