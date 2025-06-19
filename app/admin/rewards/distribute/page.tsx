"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Calculator, DollarSign, Users, Loader2 } from "lucide-react"

interface DistributionResult {
  weeklyProfit: number
  distributionAmount: number
  distributedUsers: number
  levelBreakdown: Array<{
    level: number
    userCount: number
    distributionRate: number
  }>
}

export default function AdminRewardsDistributePage() {
  const [weeklyProfit, setWeeklyProfit] = useState("")
  const [distributing, setDistributing] = useState(false)
  const [lastResult, setLastResult] = useState<DistributionResult | null>(null)

  async function handleDistributeRewards() {
    if (!weeklyProfit || parseFloat(weeklyProfit) <= 0) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "有効な週次利益を入力してください。",
      })
      return
    }

    setDistributing(true)

    try {
      const response = await fetch("/api/admin/rewards/distribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weeklyProfit: parseFloat(weeklyProfit)
        }),
      })

      const data = await response.json()

      if (data.success) {
        setLastResult(data)
        toast({
          title: "成功",
          description: `${data.distributedUsers}人に天下統一ボーナスが分配されました。`,
        })
        setWeeklyProfit("")
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "ボーナス分配に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setDistributing(false)
    }
  }

  const getLevelName = (level: number) => {
    const levels = ["", "足軽", "武将", "代官", "奉行", "老中", "大老", "大名", "将軍"]
    return levels[level] || "不明"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">天下統一ボーナス分配</h1>
          <p className="text-zinc-400">
            週次利益の20%をMLMレベルに応じて分配します。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">分配率</CardTitle>
              <Calculator className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">20%</div>
              <p className="text-xs text-zinc-400">
                週次利益の分配割合
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">前回分配額</CardTitle>
              <DollarSign className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {lastResult ? `${lastResult.distributionAmount.toLocaleString()}` : "0"}
              </div>
              <p className="text-xs text-zinc-400">
                USDT
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">前回対象者</CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {lastResult ? lastResult.distributedUsers : 0}
              </div>
              <p className="text-xs text-zinc-400">
                人
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">週次利益入力</CardTitle>
            <CardDescription className="text-zinc-400">
              今週の会社利益を入力して天下統一ボーナスを計算・分配します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weeklyProfit" className="text-white">今週の利益 (USDT)</Label>
              <Input
                id="weeklyProfit"
                type="number"
                step="0.01"
                value={weeklyProfit}
                onChange={(e) => setWeeklyProfit(e.target.value)}
                placeholder="1000000.00"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-sm text-zinc-400">
                入力した金額の20%（{weeklyProfit ? (parseFloat(weeklyProfit) * 0.2).toLocaleString() : "0"} USDT）が分配されます
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleDistributeRewards} 
                disabled={distributing || !weeklyProfit}
                className="bg-red-600 hover:bg-red-700"
              >
                {distributing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分配中...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    天下統一ボーナス分配実行
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {lastResult && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">前回の分配結果</CardTitle>
              <CardDescription className="text-zinc-400">
                最新の天下統一ボーナス分配の詳細
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">週次利益:</span>
                    <span className="ml-2 text-white">{lastResult.weeklyProfit.toLocaleString()} USDT</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">分配総額:</span>
                    <span className="ml-2 text-green-500">{lastResult.distributionAmount.toLocaleString()} USDT</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-3">レベル別分配</h4>
                  <div className="space-y-2">
                    {lastResult.levelBreakdown.map((level) => (
                      <div key={level.level} className="flex justify-between items-center p-2 rounded border border-zinc-800">
                        <span className="text-zinc-300">{getLevelName(level.level)}</span>
                        <div className="text-right">
                          <div className="text-white">{level.userCount}人</div>
                          <div className="text-xs text-zinc-400">分配率: {level.distributionRate}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">分配システム説明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>• 週次利益の20%が天下統一ボーナスとして分配されます</p>
              <p>• 各MLMレベルに応じた分配率で計算されます</p>
              <p>• 同じレベルのユーザー間では均等分配されます</p>
              <p>• 分配は毎週月曜日に実行されます</p>
              <p>• レベル1（足軽）以上のユーザーが対象です</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
