import { NextResponse } from "next/server"
import { nftQueries } from "@/lib/database"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body
    const purchaseId = params.id

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    if (!status || !purchaseId) {
      return NextResponse.json({ success: false, message: "ステータスと購入IDが必要です" }, { status: 400 })
    }

    const result = await nftQueries.updateDeliveryStatus(purchaseId, status)

    if (result.success) {
      return NextResponse.json({ success: true, purchase: result.purchase })
    } else {
      return NextResponse.json(
        { success: false, message: "配送状況の更新に失敗しました", error: result.error },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating delivery status:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
