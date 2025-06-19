"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Calculator, Users, TrendingUp, Loader2 } from "lucide-react"

interface LevelUpdate {
  userId: string
  name: string
  oldLevel: number
  newLevel: number
  maxSeries: number
  otherSeries: number
  totalInvestment: number
}

interface MLMCalculationResult {
  updatedCount: number
  levelUpdates: LevelUpdate[]
}

export default function AdminMLMPage() {
  const [calculating, setCalculating] = useState(false)
  const [lastResult, setLastResult] = useState<MLMCalculationResult | null>(null)

  async function handleCalculateLevels() {
    setCalculating(true)

    try {
      const response = await fetch("/api/mlm/calculate-levels", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setLastResult(data)
        toast({
          title: "成功",
          description: `${data.updatedCount}人のMLMレベルが更新されました。`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "MLMレベル計算に失敗しました。",
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

  const getLevelName = (level: number) => {
    const levels = ["レベルなし", "足軽", "武将", "代官", "奉行", "老中", "大老", "大名", "将軍"]
    return levels[level] || "不明"
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">MLMレベル管理</h1>
          <p className="text-zinc-400">
            組織ボリュームに基づいてMLMレベルを自動計算・更新します。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">MLMレベル</CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">8階級</div>
              <p className="text-xs text-zinc-400">
                足軽から将軍まで
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">最終更新</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {lastResult ? lastResult.updatedCount : 0}
              </div>
              <p className="text-xs text-zinc-400">
                前回更新されたユーザー数
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">計算システム</CardTitle>
              <Calculator className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">自動</div>
              <p className="text-xs text-zinc-400">
                組織ボリューム基準
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">MLMレベル計算</CardTitle>
            <CardDescription className="text-zinc-400">
              全ユーザーの組織ボリュームを計算してMLMレベルを更新します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-white">計算基準</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• 最低投資額: 1,000 USDT (SHOGUN NFT 1000以上)</li>
                <li>• 最大系列: 直接紹介者の中で最も大きい組織ボリューム</li>
                <li>• 他系列全体: 最大系列以外の全ての組織ボリューム合計</li>
                <li>• 自動昇格: 条件を満たした場合に自動的にレベルアップ</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleCalculateLevels} 
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
                    MLMレベル計算実行
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {lastResult && lastResult.levelUpdates.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">最新の更新結果</CardTitle>
              <CardDescription className="text-zinc-400">
                前回の計算で更新されたユーザーのMLMレベル変更
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-300">ユーザーID</TableHead>
                    <TableHead className="text-zinc-300">名前</TableHead>
                    <TableHead className="text-zinc-300">旧レベル</TableHead>
                    <TableHead className="text-zinc-300">新レベル</TableHead>
                    <TableHead className="text-zinc-300">最大系列</TableHead>
                    <TableHead className="text-zinc-300">他系列全体</TableHead>
                    <TableHead className="text-zinc-300">総投資額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastResult.levelUpdates.map((update, index) => (
                    <TableRow key={index} className="border-zinc-800">
                      <TableCell className="font-medium text-white">{update.userId}</TableCell>
                      <TableCell className="text-zinc-300">{update.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                          {getLevelName(update.oldLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600 text-white">
                          {getLevelName(update.newLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {update.maxSeries.toLocaleString()} USDT
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {update.otherSeries.toLocaleString()} USDT
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {update.totalInvestment.toLocaleString()} USDT
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">MLMレベル一覧</CardTitle>
            <CardDescription className="text-zinc-400">
              各レベルの昇格条件と分配率
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { level: 1, name: "足軽", maxSeries: 0, otherSeries: 0, rate: 45 },
                { level: 2, name: "武将", maxSeries: 3000, otherSeries: 1500, rate: 25 },
                { level: 3, name: "代官", maxSeries: 5000, otherSeries: 2500, rate: 10 },
                { level: 4, name: "奉行", maxSeries: 10000, otherSeries: 5000, rate: 6 },
                { level: 5, name: "老中", maxSeries: 50000, otherSeries: 25000, rate: 5 },
                { level: 6, name: "大老", maxSeries: 100000, otherSeries: 50000, rate: 4 },
                { level: 7, name: "大名", maxSeries: 300000, otherSeries: 150000, rate: 3 },
                { level: 8, name: "将軍", maxSeries: 600000, otherSeries: 500000, rate: 2 }
              ].map((level) => (
                <div key={level.level} className="rounded-md border border-zinc-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{level.name}</h3>
                      <p className="text-sm text-zinc-400">
                        最大系列: {level.maxSeries.toLocaleString()} USDT, 
                        他系列全体: {level.otherSeries.toLocaleString()} USDT
                      </p>
                    </div>
                    <Badge className="bg-red-600 text-white">
                      分配率: {level.rate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
