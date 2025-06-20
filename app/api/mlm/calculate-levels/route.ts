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

const MLM_LEVELS = [
  { level: 1, name: "足軽", minInvestment: 1000, maxSeries: 0, otherSeries: 0, organizationTotal: 1000 },
  { level: 2, name: "武将", minInvestment: 1000, maxSeries: 3000, otherSeries: 1500, organizationTotal: 4500 },
  { level: 3, name: "代官", minInvestment: 1000, maxSeries: 5000, otherSeries: 2500, organizationTotal: 7500 },
  { level: 4, name: "奉行", minInvestment: 1000, maxSeries: 10000, otherSeries: 5000, organizationTotal: 15000 },
  { level: 5, name: "老中", minInvestment: 1000, maxSeries: 50000, otherSeries: 25000, organizationTotal: 75000 },
  { level: 6, name: "大老", minInvestment: 1000, maxSeries: 100000, otherSeries: 50000, organizationTotal: 150000 },
  { level: 7, name: "大名", minInvestment: 1000, maxSeries: 300000, otherSeries: 150000, organizationTotal: 450000 },
  { level: 8, name: "将軍", minInvestment: 1000, maxSeries: 600000, otherSeries: 500000, organizationTotal: 1100000 }
]

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

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        user_id,
        name,
        total_investment,
        current_level,
        referrer_id
      `)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ success: false, message: "ユーザーデータの取得に失敗しました" }, { status: 500 })
    }

    const { data: userNfts, error: nftsError } = await supabaseAdmin
      .from('user_nfts')
      .select('user_id, purchase_price')
      .eq('is_delivered', true)

    if (nftsError) {
      console.error("Error fetching NFTs:", nftsError)
      return NextResponse.json({ success: false, message: "NFTデータの取得に失敗しました" }, { status: 500 })
    }

    const userInvestments = new Map()
    userNfts?.forEach(nft => {
      const current = userInvestments.get(nft.user_id) || 0
      userInvestments.set(nft.user_id, current + nft.purchase_price)
    })

    function calculateOrganizationVolume(userId: string, visited = new Set()): number {
      if (visited.has(userId)) return 0
      visited.add(userId)

      const directReferrals = users?.filter(u => u.referrer_id === userId) || []
      let totalVolume = userInvestments.get(userId) || 0

      directReferrals.forEach(referral => {
        totalVolume += calculateOrganizationVolume(referral.id, new Set(visited))
      })

      return totalVolume
    }

    function calculateMaxAndOtherSeries(userId: string): { maxSeries: number, otherSeries: number } {
      const directReferrals = users?.filter(u => u.referrer_id === userId) || []
      const seriesVolumes = directReferrals.map(referral => 
        calculateOrganizationVolume(referral.id)
      )

      if (seriesVolumes.length === 0) return { maxSeries: 0, otherSeries: 0 }

      seriesVolumes.sort((a, b) => b - a)
      const maxSeries = seriesVolumes[0] || 0
      const otherSeries = seriesVolumes.slice(1).reduce((sum, vol) => sum + vol, 0)

      return { maxSeries, otherSeries }
    }

    let updatedCount = 0
    const levelUpdates = []

    for (const user of users || []) {
      const userInvestment = userInvestments.get(user.id) || 0
      
      if (userInvestment < 1000) continue

      const { maxSeries, otherSeries } = calculateMaxAndOtherSeries(user.id)
      let newLevel = 0

      for (let i = MLM_LEVELS.length - 1; i >= 0; i--) {
        const level = MLM_LEVELS[i]
        if (userInvestment >= level.minInvestment && 
            maxSeries >= level.maxSeries && 
            otherSeries >= level.otherSeries) {
          newLevel = level.level
          break
        }
      }

      if (newLevel !== user.current_level) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            current_level: newLevel,
            total_investment: userInvestment
          })
          .eq('id', user.id)

        if (!updateError) {
          updatedCount++
          levelUpdates.push({
            userId: user.user_id,
            name: user.name,
            oldLevel: user.current_level,
            newLevel,
            maxSeries,
            otherSeries,
            totalInvestment: userInvestment
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount}人のMLMレベルが更新されました`,
      updatedCount,
      levelUpdates
    })
  } catch (error) {
    console.error("Error calculating MLM levels:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
