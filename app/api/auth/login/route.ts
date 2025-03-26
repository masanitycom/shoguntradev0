import { NextResponse } from "next/server"
import { userQueries } from "@/lib/database"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    // 入力検証
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "ユーザーIDまたはメールアドレスとパスワードを入力してください" },
        { status: 400 },
      )
    }

    // ユーザー認証
    const result = await userQueries.authenticateUser(identifier, "")

    if (!result.success) {
      return NextResponse.json({ success: false, message: "認証に失敗しました" }, { status: 401 })
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, result.user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "パスワードが正しくありません" }, { status: 401 })
    }

    // JWTトークン生成
    const token = sign(
      { userId: result.user.id, role: result.user.role || "user" },
      process.env.JWT_SECRET || "shogun-trade-secret",
      { expiresIn: "1d" },
    )

    // クッキーにトークンを保存
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1日
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        userId: result.user.user_id,
        email: result.user.email,
        role: result.user.role || "user",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

