import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: "ユーザーIDまたはメールアドレスとパスワードを入力してください" }, { status: 400 })
    }

    const isEmail = identifier.includes('@')
    let email = identifier

    if (!isEmail) {
      return NextResponse.json({ success: false, message: "現在はメールアドレスでのログインのみサポートしています" }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ success: false, message: "ログインに失敗しました" }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ success: false, message: "ユーザーが見つかりません" }, { status: 401 })
    }

    const token = jwt.sign(
      { 
        userId: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user'
      },
      process.env.JWT_SECRET || 'shogun-trade-secret',
      { expiresIn: '24h' }
    )

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'user',
        name: data.user.user_metadata?.name,
        user_id: data.user.user_metadata?.user_id
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

