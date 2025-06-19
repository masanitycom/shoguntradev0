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
    console.log("=== REGISTRATION API ROUTE START ===")
    console.log("Environment check:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log("- NODE_ENV:", process.env.NODE_ENV)

    const body = await request.json()
    const { name, userId, email, password, phoneNumber, referrerId, usdtAddress, walletType } = body

    console.log("Registration attempt for:", email)
    console.log("User data:", { name, userId, phoneNumber, referrerId, usdtAddress, walletType })

    // 入力検証
    if (!name || !userId || !email || !password || !phoneNumber) {
      console.log("Missing required fields")
      return NextResponse.json({ success: false, message: "必須項目が入力されていません" }, { status: 400 })
    }

    console.log("Creating Supabase auth user...")
    console.log("Supabase admin client initialized:", !!supabaseAdmin)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    console.log("Supabase auth user creation response received")
    console.log("- Error:", !!authError, authError?.message)
    console.log("- Data:", !!authData, !!authData?.user)

    if (authError) {
      console.error('Auth error details:', authError)
      return NextResponse.json(
        { success: false, message: "ユーザー認証の作成に失敗しました", error: authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      console.error("No user data returned from Supabase")
      return NextResponse.json(
        { success: false, message: "ユーザー作成に失敗しました" },
        { status: 500 }
      )
    }

    console.log("Auth user created successfully:", authData.user.id)

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

    console.log("Updating user metadata...")
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

    console.log("User metadata update response received")
    console.log("- Error:", !!updateError, updateError?.message)
    console.log("- Data:", !!updateResult)

    if (updateError) {
      console.error('User metadata update error details:', updateError)
      console.log("Cleaning up - deleting auth user...")
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { success: false, message: "ユーザー情報の更新に失敗しました", error: updateError.message },
        { status: 500 }
      )
    }

    console.log("User metadata updated successfully")

    console.log("=== REGISTRATION API ROUTE SUCCESS ===")
    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id,
      message: "ユーザー登録が完了しました"
    })
  } catch (error) {
    console.error("=== REGISTRATION API ROUTE ERROR ===")
    console.error("Registration error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました", error: errorMessage }, { status: 500 })
  }
}

