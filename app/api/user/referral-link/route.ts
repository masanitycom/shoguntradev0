import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import * as QRCode from 'qrcode'

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

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId
    console.log("=== REFERRAL LINK DEBUG ===")
    console.log("JWT decoded payload:", decoded)
    console.log("Extracted userId:", userId)

    let { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, name')
      .eq('id', userId)
      .single()
    
    console.log("Database query result:", { userData, userError })

    if (userError && userError.code === 'PGRST116') {
      console.log("User profile not found, creating from JWT data...")
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: decoded.email,
          name: decoded.email.split('@')[0], // Use email prefix as name
          name_kana: decoded.email.split('@')[0],
          user_id: `USER${Date.now()}`, // Generate unique user_id
          phone: '',
          referrer_id: null,
          usdt_address: null,
          wallet_type: 'その他',
          role: decoded.role || 'user',
          current_level: 0,
          total_investment: 0,
          total_referrals: 0,
          direct_referrals: 0
        })
        .select('id, user_id, name')
        .single()
      
      if (createError) {
        console.error('Error creating user profile:', createError)
        return NextResponse.json({ success: false, message: "ユーザープロフィールの作成に失敗しました" }, { status: 500 })
      }
      
      userData = newProfile
      console.log("User profile created successfully:", userData)
    }

    if (!userData) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json({ success: false, message: "ユーザー情報の取得に失敗しました" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shoguntradev0.vercel.app'
    const referralLink = `${baseUrl}/register?ref=${userData.user_id}`

    let qrCodeDataUrl = ''
    try {
      qrCodeDataUrl = await QRCode.toDataURL(referralLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (qrError) {
      console.error('Error generating QR code:', qrError)
      qrCodeDataUrl = ''
    }

    const { data: referralStats, error: statsError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('referrer_id', userData.user_id)

    const directReferrals = referralStats?.length || 0
    const totalReferrals = directReferrals

    return NextResponse.json({
      success: true,
      referralLink,
      qrCode: qrCodeDataUrl,
      userInfo: {
        userId: userData.user_id,
        name: userData.name
      },
      stats: {
        directReferrals,
        totalReferrals
      }
    })
  } catch (error) {
    console.error("Error generating referral link:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
