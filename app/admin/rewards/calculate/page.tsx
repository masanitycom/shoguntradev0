"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Calculator, DollarSign, TrendingUp, Loader2 } from "lucide-react"

interface NFTRate {
  name: string
  maxRate: number
  currentRate: number
}

export default function AdminRewardsCalculatePage() {
  const [calculating, setCalculating] = useState(false)
  const [nftRates, setNftRates] = useState<NFTRate[]>([
    { name: "SHOGUN NFT 300", maxRate: 0.5, currentRate: 0 },
    { name: "SHOGUN NFT 500", maxRate: 0.5, currentRate: 0 },
    { name: "SHOGUN NFT 1000", maxRate: 1.0, currentRate: 0 },
    { name: "SHOGUN NFT 3000", maxRate: 1.0, currentRate: 0 },
    { name: "SHOGUN NFT 5000", maxRate: 1.0, currentRate: 0 },
    { name: "SHOGUN NFT 10000", maxRate: 1.25, currentRate: 0 },
    { name: "SHOGUN NFT 30000", maxRate: 1.5, currentRate: 0 },
    { name: "SHOGUN NFT 100000", maxRate: 2.0, currentRate: 0 },
    { name: "SHOGUN NFT 100", maxRate: 0.5, currentRate: 0 },
    { name: "SHOGUN NFT 200", maxRate: 0.5, currentRate: 0 },
    { name: "SHOGUN NFT 600", maxRate: 0.5, currentRate: 0 },
    { name: "SHOGUN NFT 1177", maxRate: 1.25, currentRate: 0 },
    { name: "SHOGUN NFT 1300", maxRate: 1.0, currentRate: 0 },
    { name: "SHOGUN NFT 1500", maxRate: 1.0, currentRate: 0 },
    { name: "SHOGUN NFT 2000", maxRate: 1.0, currentRate: 0 },
    { name: "SHOGUN NFT 6600", maxRate: 1.25, currentRate: 0 },
    { name: "SHOGUN NFT 8000", maxRate: 1.25, currentRate: 0 }
  ])

  const updateRate = (index: number, value: string) => {
    const newRates = [...nftRates]
    newRates[index].currentRate = Math.min(parseFloat(value) || 0, newRates[index].maxRate)
    setNftRates(newRates)
  }

  async function calculateRewards() {
    setCalculating(true)

    try {
      const dailyRates: { [key: string]: number } = {}
      nftRates.forEach(rate => {
        dailyRates[rate.name] = rate.currentRate
      })

      const response = await fetch("/api/admin/rewards/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dailyRates }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: data.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "報酬計算に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setCalculating(false)
    }
  }

  const setMaxRates = () => {
    const newRates = nftRates.map(rate => ({
      ...rate,
      currentRate: rate.maxRate
    }))
    setNftRates(newRates)
  }

  const clearRates = () => {
    const newRates = nftRates.map(rate => ({
      ...rate,
      currentRate: 0
    }))
    setNftRates(newRates)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">週次報酬計算</h1>
          <p className="text-zinc-400">
            各NFTの今週の日利を設定して報酬を計算します。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">通常NFT</CardTitle>
              <DollarSign className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">8</div>
              <p className="text-xs text-zinc-400">
                300 - 100,000 USDT
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">特例NFT</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">9</div>
              <p className="text-xs text-zinc-400">
                100 - 8,000 USDT
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">総NFT数</CardTitle>
              <Calculator className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">17</div>
              <p className="text-xs text-zinc-400">
                全NFTタイプ
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">NFT日利設定</CardTitle>
            <CardDescription className="text-zinc-400">
              各NFTタイプの今週の日利を設定してください（上限値以下）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={setMaxRates} variant="outline" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                上限値に設定
              </Button>
              <Button onClick={clearRates} variant="outline" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
                すべてクリア
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {nftRates.map((rate, index) => (
                <div key={rate.name} className="space-y-2 p-4 rounded-lg border border-zinc-800">
                  <Label className="text-white font-medium">{rate.name}</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      max={rate.maxRate}
                      value={rate.currentRate}
                      onChange={(e) => updateRate(index, e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <span className="text-sm text-zinc-400">%</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    上限: {rate.maxRate}%
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={calculateRewards} 
                disabled={calculating}
                className="bg-red-600 hover:bg-red-700"
              >
                {calculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    計算中...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    週次報酬を計算
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">報酬計算について</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>• 各NFTの日利は上限値以下で設定してください</p>
              <p>• 報酬は300%上限まで累積され、達成後NFTは消滅します</p>
              <p>• 計算は月曜日から金曜日まで適用されます（土日祝日は除く）</p>
              <p>• 設定後、ユーザーマイページに反映されます</p>
              <p>• エアドロップタスク完了者のみが報酬を受け取れます</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
