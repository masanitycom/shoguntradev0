import { NextResponse } from "next/server"
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, userId, email, password, phoneNumber, referrerId, usdtAddress, walletType } = body

    // 入力検証
    if (!name || !userId || !email || !password || !phoneNumber) {
      return NextResponse.json({ success: false, message: "必須項目が入力されていません" }, { status: 400 })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { success: false, message: "ユーザー認証の作成に失敗しました" },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: "ユーザー作成に失敗しました" },
        { status: 500 }
      )
    }

    const profileData = {
      id: authData.user.id,
      name,
      name_kana: name,
      user_id: userId,
      email,
      phone: phoneNumber,
      referrer_id: referrerId || null,
      usdt_address: usdtAddress || null,
      wallet_type: walletType || 'その他',
      role: 'user'
    }

    console.log('Profile data to insert:', JSON.stringify(profileData, null, 2))
    console.log('Auth user created:', JSON.stringify(authData.user, null, 2))

    const { data: updateResult, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authData.user.id,
      {
        user_metadata: {
          name,
          name_kana: name,
          user_id: userId,
          phone: phoneNumber,
          referrer_id: referrerId || null,
          usdt_address: usdtAddress || null,
          wallet_type: walletType || 'その他',
          role: 'user'
        }
      }
    )

    if (updateError) {
      console.error('User metadata update error:', updateError)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { success: false, message: "ユーザー情報の更新に失敗しました", error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id,
      message: "ユーザー登録が完了しました"
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

