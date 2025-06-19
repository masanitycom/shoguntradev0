import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    cookieStore.delete("auth-token")

    return NextResponse.json({
      success: true,
      message: "ログアウトしました"
    })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ success: false, message: "ログアウトに失敗しました" }, { status: 500 })
  }
}
