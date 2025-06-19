import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const { data: purchases, error } = await supabase
      .from('nft_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw error

    const weeklyRewards = (purchases || []).map(purchase => {
      const purchaseDate = new Date(purchase.purchased_at)
      const now = new Date()
      
      const weeksSincePurchase = Math.floor((now.getTime() - purchaseDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      
      let phase = "waiting"
      let canClaim = false
      let weeklyAmount = 0
      
      if (weeksSincePurchase >= 1) {
        phase = "operating"
        
        if (weeksSincePurchase >= 2) {
          phase = "claimable"
          canClaim = true
          
          const dailyRate = purchase.daily_rate / 100
          const weekdaysInWeek = 5
          weeklyAmount = purchase.purchase_price * dailyRate * weekdaysInWeek
        }
      }
      
      const totalEarned = purchase.total_earned || 0
      const maxEarnings = purchase.purchase_price * 3
      const isMaxedOut = totalEarned >= maxEarnings
      
      return {
        nft_id: purchase.nft_id,
        purchase_price: purchase.purchase_price,
        daily_rate: purchase.daily_rate,
        phase,
        canClaim: canClaim && !isMaxedOut,
        weeklyAmount: isMaxedOut ? 0 : weeklyAmount,
        totalEarned,
        maxEarnings,
        isMaxedOut,
        purchaseDate: purchase.purchased_at,
        weeksSincePurchase
      }
    })

    return NextResponse.json({
      success: true,
      weeklyRewards
    })
  } catch (error) {
    console.error("Error fetching weekly rewards:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-secret") as any
    const userId = decoded.userId

    const { nft_id, action, survey_completed } = await request.json()

    if (action === "claim") {
      if (!survey_completed) {
        return NextResponse.json({ success: false, message: "アンケートの回答が必要です" }, { status: 400 })
      }

      const { data: purchase, error: purchaseError } = await supabase
        .from('nft_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('nft_id', nft_id)
        .single()

      if (purchaseError || !purchase) {
        return NextResponse.json({ success: false, message: "NFTが見つかりません" }, { status: 404 })
      }

      const dailyRate = purchase.daily_rate / 100
      const weekdaysInWeek = 5
      const weeklyAmount = purchase.purchase_price * dailyRate * weekdaysInWeek

      const fee = purchase.wallet_type === 'EVO' ? 0.055 : 0.08
      const netAmount = weeklyAmount * (1 - fee)

      const { error: rewardError } = await supabase
        .from('rewards')
        .insert([
          {
            user_id: userId,
            amount: netAmount,
            reward_type: 'weekly',
            description: `${nft_id} 週次報酬`,
            claimed: false,
            created_at: new Date().toISOString()
          }
        ])

      if (rewardError) throw rewardError

      const newTotalEarned = (purchase.total_earned || 0) + weeklyAmount
      const maxEarnings = purchase.purchase_price * 3

      const { error: updateError } = await supabase
        .from('nft_purchases')
        .update({
          total_earned: newTotalEarned,
          status: newTotalEarned >= maxEarnings ? 'completed' : 'active',
          last_reward_claimed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('nft_id', nft_id)

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        message: "報酬申請が完了しました",
        netAmount,
        fee: weeklyAmount * fee
      })
    }

    if (action === "compound") {
      const { data: purchase, error: purchaseError } = await supabase
        .from('nft_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('nft_id', nft_id)
        .single()

      if (purchaseError || !purchase) {
        return NextResponse.json({ success: false, message: "NFTが見つかりません" }, { status: 404 })
      }

      const dailyRate = purchase.daily_rate / 100
      const weekdaysInWeek = 5
      const weeklyAmount = purchase.purchase_price * dailyRate * weekdaysInWeek

      const newPurchasePrice = purchase.purchase_price + weeklyAmount
      const newTotalEarned = (purchase.total_earned || 0) + weeklyAmount
      const maxEarnings = newPurchasePrice * 3

      const { error: updateError } = await supabase
        .from('nft_purchases')
        .update({
          purchase_price: newPurchasePrice,
          total_earned: newTotalEarned,
          status: newTotalEarned >= maxEarnings ? 'completed' : 'active',
          last_reward_claimed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('nft_id', nft_id)

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        message: "複利運用が完了しました",
        newPurchasePrice,
        compoundAmount: weeklyAmount
      })
    }

    return NextResponse.json({ success: false, message: "無効なアクションです" }, { status: 400 })
  } catch (error) {
    console.error("Error processing weekly reward:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
