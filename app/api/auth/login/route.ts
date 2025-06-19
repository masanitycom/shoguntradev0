import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  try {
    console.log("=== LOGIN API ROUTE START ===")
    console.log("Environment check:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log("- JWT_SECRET:", !!process.env.JWT_SECRET)
    console.log("- NODE_ENV:", process.env.NODE_ENV)

    const body = await request.json()
    const { identifier, password } = body

    console.log("Login attempt for:", identifier)

    if (!identifier || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ success: false, message: "ユーザーIDまたはメールアドレスとパスワードを入力してください" }, { status: 400 })
    }

    const isEmail = identifier.includes('@')
    let email = identifier

    if (!isEmail) {
      console.log("Not an email address")
      return NextResponse.json({ success: false, message: "現在はメールアドレスでのログインのみサポートしています" }, { status: 400 })
    }

    console.log("Attempting Supabase auth with email:", email)
    console.log("Supabase client initialized:", !!supabase)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("Supabase auth response received")
    console.log("- Error:", !!error, error?.message)
    console.log("- Data:", !!data, !!data?.user)

    if (error) {
      console.error("Supabase auth error:", error)
      return NextResponse.json({ success: false, message: "ログインに失敗しました", error: error.message }, { status: 401 })
    }

    if (!data.user) {
      console.error("No user data returned from Supabase")
      return NextResponse.json({ success: false, message: "ユーザーが見つかりません" }, { status: 401 })
    }

    console.log("User authenticated successfully:", data.user.id)
    console.log("User metadata:", data.user.user_metadata)

    const jwtSecret = process.env.JWT_SECRET || 'shogun-trade-secret'
    console.log("JWT Secret available:", !!jwtSecret)

    console.log("Creating JWT token...")
    const token = jwt.sign(
      { 
        userId: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user'
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    console.log("JWT token created successfully")

    console.log("Setting cookie...")
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
    })

    console.log("Cookie set successfully")

    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user',
        name: data.user.user_metadata?.name,
        user_id: data.user.user_metadata?.user_id
      }
    })

    console.log("=== LOGIN API ROUTE SUCCESS ===")
    return response
  } catch (error) {
    console.error("=== LOGIN API ROUTE ERROR ===")
    console.error("Login error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました", error: errorMessage }, { status: 500 })
  }
}

