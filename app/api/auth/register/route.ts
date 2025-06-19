import { NextResponse } from "next/server"
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

    if (!name || !userId || !email || !password || !phoneNumber) {
      console.log("Missing required fields")
      return NextResponse.json({ success: false, message: "必須項目が入力されていません" }, { status: 400 })
    }

    console.log("Creating Supabase auth user...")
    console.log("Supabase admin client initialized:", !!supabaseAdmin)

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        name_kana: name,
        user_id: userId,
        phone: phoneNumber,
        referrer_id: referrerId || null,
        usdt_address: usdtAddress || null,
        wallet_type: walletType || 'その他',
        role: 'user',
        current_level: 0,
        total_investment: 0,
        total_referrals: 0,
        direct_referrals: 0
      }
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

    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          name,
          name_kana: name,
          user_id: userId,
          phone: phoneNumber,
          referrer_id: referrerId || null,
          usdt_address: usdtAddress || null,
          wallet_type: walletType || 'その他',
          role: 'user',
          current_level: 0,
          total_investment: 0,
          total_referrals: 0,
          direct_referrals: 0
        })
        .select()
        .single()

      if (profileError) {
        console.log("Profile insertion failed, using metadata approach:", profileError.message)
      } else {
        console.log("Profile inserted successfully:", profileData)
      }
    } catch (profileInsertError) {
      console.log("Profile insertion failed, continuing with metadata approach:", profileInsertError)
    }

    if (referrerId) {
      try {
        const { data: referrerData, error: referrerError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('user_id', referrerId)
          .single()

        if (!referrerError && referrerData) {
          await supabaseAdmin
            .from('referral_tree')
            .insert({
              user_id: authData.user.id,
              referrer_id: referrerData.id,
              level: 1
            })

          await supabaseAdmin
            .from('profiles')
            .update({ 
              direct_referrals: supabaseAdmin.rpc('increment', { x: 1 }),
              total_referrals: supabaseAdmin.rpc('increment', { x: 1 })
            })
            .eq('id', referrerData.id)
        }
      } catch (referralError) {
        console.log("Referral tree creation failed:", referralError)
      }
    }

    console.log("=== REGISTRATION API ROUTE SUCCESS ===")
    return NextResponse.json({ 
      success: true, 
      message: "ユーザー登録が完了しました",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        user_id: userId
      }
    })
  } catch (error) {
    console.error("=== REGISTRATION API ROUTE ERROR ===")
    console.error("Registration error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました", error: errorMessage }, { status: 500 })
  }
}

