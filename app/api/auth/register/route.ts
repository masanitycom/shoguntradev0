import { NextResponse } from "next/server"
import { userQueries } from "@/lib/database"
import * as bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, userId, email, password, phoneNumber, referrerId, usdtAddress, walletType } = body

    // 入力検証
    if (!name || !userId || !email || !password || !phoneNumber || !referrerId) {
      return NextResponse.json({ success: false, message: "必須項目が入力されていません" }, { status: 400 })
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10)

    // ユーザー登録
    const result = await userQueries.createUser({
      name,
      userId,
      email,
      password: hashedPassword,
      phoneNumber,
      referrerId,
      usdtAddress,
      walletType,
    })

    if (result.success) {
      return NextResponse.json({ success: true, userId: result.userId })
    } else {
      return NextResponse.json(
        { success: false, message: "ユーザー登録に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

