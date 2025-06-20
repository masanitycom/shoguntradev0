import { NextResponse } from "next/server"
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

export async function GET() {
  try {
    console.log("=== ADMIN PURCHASES API START ===")
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    console.log("User ID from JWT:", decoded.userId)
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log("User is not admin:", profile?.role)
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    console.log("Fetching all purchases from user_nfts table...")
    const { data: purchases, error } = await supabaseAdmin
      .from('user_nfts')
      .select(`
        id,
        user_id,
        nft_type_id,
        purchase_price,
        purchase_date,
        is_delivered,
        delivery_date,
        created_at
      `)
      .order('created_at', { ascending: false })

    console.log("Purchases query result:", { count: purchases?.length || 0, error: error?.message })

    if (error) {
      console.error('Error fetching purchases:', error)
      return NextResponse.json({ success: false, message: "購入情報の取得に失敗しました" }, { status: 500 })
    }

    const userIds = [...new Set(purchases.map((purchase: any) => purchase.user_id).filter(Boolean))]
    console.log("User IDs to fetch:", userIds)

    let users: any[] = []
    if (userIds.length > 0) {
      const { data: userProfiles, error: usersError } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, name, email')
        .in('id', userIds)
      
      console.log("User profiles query result:", { count: userProfiles?.length || 0, error: usersError?.message })
      
      if (usersError) {
        console.log("User profiles query failed, using fallback data")
        users = []
      } else {
        users = userProfiles || []
      }
    }

    const formattedPurchases = (purchases || []).map((purchase: any) => {
      const nftPrice = purchase.purchase_price || 300
      const nftName = `SHOGUN NFT${nftPrice}`
      const user = users.find(u => u.id === purchase.user_id)
      
      return {
        id: purchase.id,
        user_id: purchase.user_id,
        nft_id: purchase.nft_type_id,
        purchase_price: nftPrice,
        delivery_status: purchase.is_delivered ? 'delivered' : 'pending',
        delivered_at: purchase.delivery_date,
        created_at: purchase.created_at,
        nfts: {
          name: nftName,
          image_url: "/placeholder.svg"
        },
        users: {
          name: user?.name || `User ${purchase.user_id}`,
          user_id: user?.user_id || `USER${purchase.user_id}`,
          email: user?.email || `user${purchase.user_id}@example.com`
        }
      }
    })

    console.log("Formatted purchases:", formattedPurchases)
    console.log("=== ADMIN PURCHASES API SUCCESS ===")
    return NextResponse.json({ success: true, purchases: formattedPurchases })
  } catch (error) {
    console.error("=== ADMIN PURCHASES API ERROR ===")
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
