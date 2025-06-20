import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

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
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const body = await request.json()
    const { dailyRates } = body

    if (!dailyRates || typeof dailyRates !== 'object') {
      return NextResponse.json({ success: false, message: "日利設定が必要です" }, { status: 400 })
    }

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    const { data: activeNFTs, error: nftsError } = await supabaseAdmin
      .from('user_nfts')
      .select('*')
      .eq('status', 'active')

    if (nftsError) {
      console.error("Error fetching active NFTs:", nftsError)
      return NextResponse.json({ success: false, message: "NFTデータの取得に失敗しました" }, { status: 500 })
    }

    let processedCount = 0

    for (const nft of activeNFTs || []) {
      const nftType = `SHOGUN NFT ${nft.purchase_price}`
      const dailyRate = dailyRates[nftType] || 0
      const actualDailyReturn = (nft.purchase_price * dailyRate) / 100

      const currentEarnings = nft.total_earned || 0
      const maxEarnings = nft.purchase_price * 3
      const newTotalEarnings = currentEarnings + actualDailyReturn

      if (actualDailyReturn > 0 && newTotalEarnings <= maxEarnings) {
        const { data: existingReward, error: checkRewardError } = await supabaseAdmin
          .from('weekly_rewards')
          .select('*')
          .eq('user_id', nft.user_id)
          .eq('week_start', weekStart.toISOString().split('T')[0])
          .single()

        let rewardError = null
        if (existingReward) {
          const { error } = await supabaseAdmin
            .from('weekly_rewards')
            .update({
              nft_rewards: (existingReward.nft_rewards || 0) + actualDailyReturn,
              total_rewards: (existingReward.total_rewards || 0) + actualDailyReturn
            })
            .eq('id', existingReward.id)
          rewardError = error
        } else {
          const { error } = await supabaseAdmin
            .from('weekly_rewards')
            .insert({
              user_id: nft.user_id,
              week_start: weekStart.toISOString().split('T')[0],
              nft_rewards: actualDailyReturn,
              total_rewards: actualDailyReturn,
              is_claimed: false
            })
          rewardError = error
        }

        if (!rewardError) {
          await supabaseAdmin
            .from('user_nfts')
            .update({
              total_earned: newTotalEarnings,
              status: newTotalEarnings >= maxEarnings ? 'completed' : 'active'
            })
            .eq('id', nft.id)

          processedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${processedCount}件のNFT報酬を計算しました`,
      processedCount,
      weekStart: weekStart.toISOString().split('T')[0]
    })
  } catch (error) {
    console.error("Error calculating rewards:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

