"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Coins, TrendingUp, Gift, Users } from "lucide-react"

interface DashboardStats {
  nftCount: number
  totalInvestment: number
  currentRewards: number
  currentRank: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    nftCount: 0,
    totalInvestment: 0,
    currentRewards: 0,
    currentRank: "足軽"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    try {
      const [nftsResponse, mlmResponse, rewardsResponse] = await Promise.all([
        fetch("/api/user/nfts"),
        fetch("/api/mlm/stats"),
        fetch("/api/rewards/claim")
      ])

      const [nftsData, mlmData, rewardsData] = await Promise.all([
        nftsResponse.json(),
        mlmResponse.json(),
        rewardsResponse.json()
      ])

      setStats({
        nftCount: nftsData.success ? nftsData.nfts.length : 0,
        totalInvestment: mlmData.success ? mlmData.investment : 0,
        currentRewards: rewardsData.success ? rewardsData.pendingRewards : 0,
        currentRank: mlmData.success ? mlmData.rank : "足軽"
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ダッシュボード</h1>
          <p className="text-white/70">SHOGUN TRADEへようこそ。あなたの投資状況を確認しましょう。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">保有NFT数</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nftCount}</div>
              <p className="text-xs text-white/70">
                {stats.nftCount === 0 ? "NFTを購入して投資を始めましょう" : "NFT運用中"}
              </p>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総投資額</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvestment.toLocaleString()} USDT</div>
              <p className="text-xs text-white/70">
                {stats.totalInvestment === 0 ? "NFTを購入して投資を始めましょう" : "投資運用中"}
              </p>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現在の報酬</CardTitle>
              <Gift className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentRewards.toLocaleString()} USDT</div>
              <p className="text-xs text-white/70">
                {stats.currentRewards === 0 ? "NFTを購入して報酬を獲得しましょう" : "報酬獲得中"}
              </p>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現在のランク</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentRank}</div>
              <p className="text-xs text-white/70">天下統一への道を進みましょう</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="samurai-card text-white">
            <CardHeader>
              <CardTitle>NFT運用状況</CardTitle>
              <CardDescription className="text-white/70">あなたの保有NFTと運用状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 p-4 text-center">
                <p className="text-white/70">
                  {stats.nftCount === 0 
                    ? "NFTを購入すると、ここに運用状況が表示されます" 
                    : `${stats.nftCount}個のNFTを運用中です`
                  }
                </p>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </DashboardLayout>
  )
}

