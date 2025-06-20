import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shogun-trade-jwt-secret-key') as any
    const userId = decoded.userId

    const { data: currentUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !currentUser) {
      return NextResponse.json({ success: false, message: "ユーザー情報の取得に失敗しました" }, { status: 404 })
    }

    const currentUserIdForRef = currentUser.user.user_metadata?.user_id

    const { data: allUsers, error: allUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (allUsersError) {
      return NextResponse.json({ success: false, message: "紹介者情報の取得に失敗しました" }, { status: 500 })
    }

    const referrals = allUsers.users.filter(user => 
      user.user_metadata?.referrer_id === currentUserIdForRef
    ).map(user => ({
      id: user.id,
      name: user.user_metadata?.name || 'Unknown',
      user_id: user.user_metadata?.user_id,
      email: user.email,
      created_at: user.created_at,
      nft_purchases: 0,
      total_investment: 0
    }))

    return NextResponse.json({ 
      success: true, 
      referrals,
      totalReferrals: referrals.length,
      directReferrals: referrals.length,
      indirectReferrals: 0
    })
  } catch (error) {
    console.error("Referrals fetch error:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
