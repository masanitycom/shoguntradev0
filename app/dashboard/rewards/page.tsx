"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Gift, TrendingUp, Loader2 } from "lucide-react"

interface RewardSummary {
  totalReward: number
  pendingReward: number
  claimedReward: number
  maxReward: number
}

export default function RewardsPage() {
  const [summary, setSummary] = useState<RewardSummary>({
    totalReward: 0,
    pendingReward: 0,
    claimedReward: 0,
    maxReward: 0,
  })
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    async function fetchRewardSummary() {
      try {
        const response = await fetch("/api/rewards/summary")
        const data = await response.json()

        if (data.success) {
          setSummary(data.summary)
        } else {
          toast({
            variant: "destructive",
            title: "エラー",
            description: "報酬情報の取得に失敗しました。",
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

    fetchRewardSummary()
  }, [])

  async function handleClaim(claimType: string) {
    setClaiming(true)

    try {
      const response = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimType,
          feedback: claimType === "airdrop" ? feedback : "",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "申請完了",
          description: claimType === "airdrop" ? "報酬受取の申請が完了しました。" : "複利運用の申請が完了しました。",
        })

        // 報酬情報を更新
        setSummary({
          ...summary,
          pendingReward: 0,
        })

        setFeedback("")
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "報酬申請に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setClaiming(false)
    }
  }

  // 平日かどうかチェック（月～金）
  const today = new Date()
  const dayOfWeek = today.getDay()
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">報酬管理</h1>
          <p className="text-muted-foreground">報酬の受取や複利運用を管理します。</p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">現在の報酬</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.pendingReward.toLocaleString()} USDT</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">累計報酬</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.claimedReward.toLocaleString()} USDT</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">最大報酬</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.maxReward.toLocaleString()} USDT</div>
                  <p className="text-xs text-muted-foreground">投資額の300%まで</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>報酬申請</CardTitle>
                <CardDescription>報酬の受取方法を選択してください。</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="airdrop">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="airdrop">報酬受取（エアドロップ）</TabsTrigger>
                    <TabsTrigger value="compound">複利運用</TabsTrigger>
                  </TabsList>
                  <TabsContent value="airdrop" className="space-y-4 pt-4">
                    <div>
                      <h3 className="font-medium">報酬受取（エアドロップ）</h3>
                      <p className="text-sm text-muted-foreground">報酬をUSDTで受け取ります。手数料がかかります。</p>
                      <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                        <li>通常の手数料: 8%</li>
                        <li>EVOカード利用時の手数料: 5.5%</li>
                        <li>アンケート回答が必要です</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">アンケート回答</label>
                      <Textarea
                        placeholder="報酬受取にはアンケートへの回答が必要です。"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="compound" className="space-y-4 pt-4">
                    <div>
                      <h3 className="font-medium">複利運用</h3>
                      <p className="text-sm text-muted-foreground">
                        報酬を再投資して複利効果を得ます。手数料はかかりません。
                      </p>
                      <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                        <li>手数料: 0%</li>
                        <li>アンケート回答は不要です</li>
                        <li>報酬が投資額に加算されます</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleClaim("compound")}
                  disabled={claiming || summary.pendingReward <= 0 || !isWeekday}
                >
                  {claiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  複利運用を申請
                </Button>
                <Button
                  onClick={() => handleClaim("airdrop")}
                  disabled={claiming || summary.pendingReward <= 0 || !isWeekday || !feedback.trim()}
                >
                  {claiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  報酬受取を申請
                </Button>
              </CardFooter>
            </Card>

            {!isWeekday && (
              <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-500">
                  報酬申請は平日（月曜日～金曜日）のみ可能です。土日はエアドロタスクボタンは押せません。
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

