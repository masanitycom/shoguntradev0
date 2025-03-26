"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface MLMStats {
  rank: string
  stats: {
    totalInvestment: number
    maxLineInvestment: number
    otherLinesInvestment: number
    referralsCount: number
  }
}

interface RankRequirement {
  rank: string
  title: string
  maxLine: number
  otherLines: number
  distributionRate: number
  bonusRate?: number
}

export default function MLMPage() {
  const [mlmStats, setMlmStats] = useState<MLMStats | null>(null)
  const [loading, setLoading] = useState(true)

  // ランク要件
  const rankRequirements: RankRequirement[] = [
    { rank: "足軽", title: "Ashigaru", maxLine: 1000, otherLines: 0, distributionRate: 45 },
    { rank: "武将", title: "Busho", maxLine: 3000, otherLines: 1500, distributionRate: 25 },
    { rank: "代官", title: "Daimyo", maxLine: 5000, otherLines: 2500, distributionRate: 10 },
    { rank: "奉行", title: "Bugyo", maxLine: 10000, otherLines: 5000, distributionRate: 6 },
    { rank: "老中", title: "Rochu", maxLine: 50000, otherLines: 25000, distributionRate: 5 },
    { rank: "大老", title: "Tairo", maxLine: 100000, otherLines: 50000, distributionRate: 4, bonusRate: 22 },
    { rank: "大名", title: "Taimei", maxLine: 300000, otherLines: 150000, distributionRate: 3, bonusRate: 25 },
    { rank: "将軍", title: "Shogun", maxLine: 600000, otherLines: 500000, distributionRate: 2, bonusRate: 30 },
  ]

  useEffect(() => {
    async function fetchMLMStats() {
      try {
        const response = await fetch("/api/mlm/stats")
        const data = await response.json()

        if (data.success) {
          setMlmStats(data.mlmStats)
        } else {
          toast({
            variant: "destructive",
            title: "エラー",
            description: "MLM情報の取得に失敗しました。",
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "サーバーエラーが発生しました。",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMLMStats()
  }, [])

  // 現在のランクインデックスを取得
  const currentRankIndex = mlmStats ? rankRequirements.findIndex((r) => r.rank === mlmStats.rank) : 0

  // 次のランク
  const nextRank = currentRankIndex < rankRequirements.length - 1 ? rankRequirements[currentRankIndex + 1] : null

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">天下統一への道</h1>
          <p className="text-muted-foreground">MLMランクを上げて、より多くの報酬を獲得しましょう。</p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>現在のランク</CardTitle>
                <CardDescription>あなたの現在のMLMランクと進捗状況</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{mlmStats?.rank || "足軽"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rankRequirements.find((r) => r.rank === (mlmStats?.rank || "足軽"))?.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">分配率</p>
                    <p className="text-xl font-bold">
                      {rankRequirements.find((r) => r.rank === (mlmStats?.rank || "足軽"))?.distributionRate}%
                    </p>
                  </div>
                </div>

                {nextRank && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>次のランク: {nextRank.rank}</span>
                      <span>{nextRank.distributionRate}%</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          最大系列: {mlmStats?.stats.maxLineInvestment.toLocaleString() || 0} /{" "}
                          {nextRank.maxLine.toLocaleString()} USDT
                        </span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(((mlmStats?.stats.maxLineInvestment || 0) / nextRank.maxLine) * 100),
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          Math.round(((mlmStats?.stats.maxLineInvestment || 0) / nextRank.maxLine) * 100),
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          他系列: {mlmStats?.stats.otherLinesInvestment.toLocaleString() || 0} /{" "}
                          {nextRank.otherLines.toLocaleString()} USDT
                        </span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(((mlmStats?.stats.otherLinesInvestment || 0) / nextRank.otherLines) * 100),
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          Math.round(((mlmStats?.stats.otherLinesInvestment || 0) / nextRank.otherLines) * 100),
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>天下統一への道</CardTitle>
                <CardDescription>MLMランク一覧と要件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {rankRequirements.map((rank, index) => (
                    <div
                      key={rank.rank}
                      className={`rounded-lg border p-4 ${index === currentRankIndex ? "border-primary bg-primary/10" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">
                            {rank.rank} ({rank.title})
                          </h3>
                          <p className="text-sm text-muted-foreground">分配率: {rank.distributionRate}%</p>
                        </div>
                        {rank.bonusRate && (
                          <div className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium">
                            ボーナス: {rank.bonusRate}%
                          </div>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">最大系列要件:</p>
                          <p className="font-medium">{rank.maxLine.toLocaleString()} USDT</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">他系列要件:</p>
                          <p className="font-medium">{rank.otherLines.toLocaleString()} USDT</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MLM構造</CardTitle>
                <CardDescription>あなたの紹介者ネットワーク</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-4 text-center">
                  <p className="text-muted-foreground">紹介者数: {mlmStats?.stats.referralsCount || 0}人</p>
                  <p className="mt-2 text-sm text-muted-foreground">詳細な構造図は準備中です</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

