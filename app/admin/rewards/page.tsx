"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Calculator } from "lucide-react"

export default function AdminRewardsPage() {
  const [calculating, setCalculating] = useState(false)
  const [mlmBonus, setMlmBonus] = useState("")
  const [calculatingBonus, setCalculatingBonus] = useState(false)

  async function handleCalculateRewards() {
    setCalculating(true)

    try {
      const response = await fetch("/api/admin/rewards/calculate", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: `${data.processedCount}件のNFTの報酬が計算されました。`,
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

  async function handleCalculateMlmBonus() {
    if (!mlmBonus || isNaN(Number.parseFloat(mlmBonus)) || Number.parseFloat(mlmBonus) <= 0) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "有効な金額を入力してください。",
      })
      return
    }

    setCalculatingBonus(true)

    try {
      const response = await fetch("/api/admin/mlm/calculate-bonus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ totalBonus: Number.parseFloat(mlmBonus) }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: "MLMボーナスが計算されました。",
        })
        setMlmBonus("")
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "MLMボーナス計算に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setCalculatingBonus(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">報酬管理</h1>
        <p className="text-muted-foreground">報酬計算、MLMボーナス計算を行います。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>日利報酬計算</CardTitle>
            <CardDescription>NFTの日利報酬を計算します。平日（月～金）のみ適用されます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              このボタンをクリックすると、すべてのNFTの日利報酬が計算されます。 平日（月～金）のみ報酬が発生します。
            </p>

            <div className="flex justify-end">
              <Button onClick={handleCalculateRewards} disabled={calculating}>
                {calculating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                報酬計算実行
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MLMボーナス計算</CardTitle>
            <CardDescription>天下統一ボーナスを計算します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mlm-bonus">会社利益の20% (USDT)</Label>
              <Input
                id="mlm-bonus"
                type="number"
                step="0.01"
                placeholder="10000"
                value={mlmBonus}
                onChange={(e) => setMlmBonus(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                会社利益の20%を入力してください。各ランクの人数と分配率に応じて分配されます。
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCalculateMlmBonus} disabled={calculatingBonus}>
                {calculatingBonus ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                ボーナス計算実行
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ランク別分配率</CardTitle>
          <CardDescription>各ランクの分配率一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="font-medium">足軽 (Ashigaru)</h3>
              <p className="text-sm text-muted-foreground">分配率: 45%</p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="font-medium">武将 (Busho)</h3>
              <p className="text-sm text-muted-foreground">分配率: 25%</p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="font-medium">代官 (Daimyo)</h3>
              <p className="text-sm text-muted-foreground">分配率: 10%</p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="font-medium">奉行 (Bugyo)</h3>
              <p className="text-sm text-muted-foreground">分配率: 6%</p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="font-medium">老中 (Rochu)</h3>
              <p className="text-sm text-muted-foreground">分配率: 5%</p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="font-medium">大老 (Tairo)</h3>
              <p className="text-sm text-muted-foreground">分配率: 4%</p>
              <p className="text-sm text-muted-foreground">ボーナス率: 22%</p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="font-medium">大名 (Taimei)</h3>
              <p className="text-sm text-muted-foreground">分配率: 3%</p>
              <p className="text-sm text-muted-foreground">ボーナス率: 25%</p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="font-medium">将軍 (Shogun)</h3>
              <p className="text-sm text-muted-foreground">分配率: 2%</p>
              <p className="text-sm text-muted-foreground">ボーナス率: 30%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

