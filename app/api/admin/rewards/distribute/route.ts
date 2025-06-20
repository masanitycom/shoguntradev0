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
    const { weeklyProfit } = body

    if (!weeklyProfit || weeklyProfit <= 0) {
      return NextResponse.json({ success: false, message: "有効な週次利益を入力してください" }, { status: 400 })
    }

    const distributionAmount = weeklyProfit * 0.2

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, current_level, name, user_id')
      .gte('current_level', 1)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ success: false, message: "ユーザーデータの取得に失敗しました" }, { status: 500 })
    }

    const levelDistribution = [
      { level: 1, rate: 45 },
      { level: 2, rate: 25 },
      { level: 3, rate: 10 },
      { level: 4, rate: 6 },
      { level: 5, rate: 5 },
      { level: 6, rate: 4 },
      { level: 7, rate: 3 },
      { level: 8, rate: 2 }
    ]

    const levelCounts: { [key: number]: number } = {}
    const levelUsers: { [key: number]: any[] } = {}

    levelDistribution.forEach(level => {
      levelCounts[level.level] = 0
      levelUsers[level.level] = []
    })

    users?.forEach(user => {
      if (user.current_level >= 1 && user.current_level <= 8) {
        levelCounts[user.current_level]++
        levelUsers[user.current_level].push(user)
      }
    })

    const totalDistributionPoints = levelDistribution.reduce((sum, level) => {
      return sum + (levelCounts[level.level] * level.rate)
    }, 0)

    if (totalDistributionPoints === 0) {
      return NextResponse.json({ success: false, message: "分配対象のユーザーがいません" }, { status: 400 })
    }

    const bonusDistributions: any[] = []

    for (const level of levelDistribution) {
      const usersAtLevel = levelUsers[level.level]
      if (usersAtLevel.length > 0) {
        const levelTotalPoints = usersAtLevel.length * level.rate
        const levelTotalBonus = (levelTotalPoints / totalDistributionPoints) * distributionAmount
        const bonusPerUser = levelTotalBonus / usersAtLevel.length

        for (const user of usersAtLevel) {
          bonusDistributions.push({
            user_id: user.id,
            week_start: weekStart.toISOString().split('T')[0],
            nft_rewards: 0,
            referral_rewards: bonusPerUser,
            total_rewards: bonusPerUser,
            is_claimed: false,
            created_at: new Date().toISOString()
          })
        }
      }
    }

    if (bonusDistributions.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('weekly_rewards')
        .upsert(bonusDistributions, {
          onConflict: 'user_id,week_start'
        })

      if (insertError) {
        console.error("Error inserting bonus distributions:", insertError)
        return NextResponse.json({ success: false, message: "ボーナス分配の記録に失敗しました" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "天下統一ボーナスが分配されました",
      weeklyProfit,
      distributionAmount,
      distributedUsers: bonusDistributions.length,
      levelBreakdown: levelDistribution.map(level => ({
        level: level.level,
        userCount: levelCounts[level.level],
        distributionRate: level.rate
      }))
    })
  } catch (error) {
    console.error("Error distributing rewards:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
