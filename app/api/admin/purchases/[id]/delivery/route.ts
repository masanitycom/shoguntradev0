import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

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

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { status } = body
    const resolvedParams = await params
    const purchaseId = resolvedParams.id

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    console.log("User ID from JWT:", decoded.userId)
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!profile || profile.role !== 'admin') {
      console.log("User is not admin:", profile?.role)
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    if (!status || !purchaseId) {
      return NextResponse.json({ success: false, message: "ステータスと購入IDが必要です" }, { status: 400 })
    }

    console.log("Updating delivery status for purchase:", purchaseId, "to status:", status)
    
    const { data: updatedPurchase, error: updateError } = await supabaseAdmin
      .from('user_nfts')
      .update({
        is_delivered: status === 'delivered',
        delivery_date: status === 'delivered' ? new Date().toISOString() : null
      })
      .eq('id', purchaseId)
      .select()
      .single()

    console.log("Update result:", { success: !!updatedPurchase, error: updateError?.message })

    if (updateError) {
      console.error('Error updating delivery status:', updateError)
      return NextResponse.json({ success: false, message: "配送状況の更新に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "配送状況を更新しました",
      purchase: updatedPurchase 
    })
  } catch (error) {
    console.error("Error updating delivery status:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
