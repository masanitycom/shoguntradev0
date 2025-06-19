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

    let profileData = null

    try {
      const { data: dbProfile, error: dbError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!dbError && dbProfile) {
        profileData = dbProfile
      }
    } catch (dbFetchError) {
      console.log("Database profile fetch failed, trying user metadata")
    }

    if (!profileData) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (userError || !userData) {
        return NextResponse.json({ success: false, message: "ユーザー情報の取得に失敗しました" }, { status: 500 })
      }

      profileData = {
        id: userData.user.id,
        name: userData.user.user_metadata?.name || '',
        email: userData.user.email || '',
        phone: userData.user.user_metadata?.phone || '',
        user_id: userData.user.user_metadata?.user_id || '',
        usdt_address: userData.user.user_metadata?.usdt_address || '',
        wallet_type: userData.user.user_metadata?.wallet_type || 'その他',
        current_level: userData.user.user_metadata?.current_level || 0,
        total_investment: userData.user.user_metadata?.total_investment || 0,
        created_at: userData.user.created_at
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileData
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const body = await request.json()
    const { name, phone, usdt_address, wallet_type } = body

    try {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          name,
          phone,
          usdt_address,
          wallet_type
        })
        .eq('id', userId)

      if (updateError) {
        console.log("Database update failed, updating user metadata")
        
        const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            name,
            phone,
            usdt_address,
            wallet_type
          }
        })

        if (metadataError) {
          return NextResponse.json({ success: false, message: "プロフィールの更新に失敗しました" }, { status: 500 })
        }
      }
    } catch (updateError) {
      console.log("Both database and metadata update failed:", updateError)
      return NextResponse.json({ success: false, message: "プロフィールの更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "プロフィールが更新されました"
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
