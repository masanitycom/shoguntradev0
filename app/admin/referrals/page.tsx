"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Search, Users, TrendingUp, Loader2 } from "lucide-react"
import { ReferralTree } from "@/components/referral/referral-tree"

interface ReferralStats {
  totalUsers: number
  totalReferrals: number
  totalInvestment: number
  activeReferrers: number
}

interface TopReferrer {
  user_id: string
  name: string
  email: string
  referralCount: number
  totalInvestment: number
  rank: string
}

export default function AdminReferralsPage() {
  const [stats, setStats] = useState<ReferralStats>({
    totalUsers: 0,
    totalReferrals: 0,
    totalInvestment: 0,
    activeReferrers: 0
  })
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchUserId, setSearchUserId] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchReferralStats()
    fetchTopReferrers()
  }, [])

  async function fetchReferralStats() {
    try {
      const response = await fetch("/api/admin/referrals/stats")
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error)
    }
  }

  async function fetchTopReferrers() {
    try {
      const response = await fetch("/api/admin/referrals/top")
      const data = await response.json()

      if (data.success) {
        setTopReferrers(data.referrers)
      }
    } catch (error) {
      console.error("Error fetching top referrers:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearchUser() {
    if (searchUserId.trim()) {
      setSelectedUserId(searchUserId.trim())
    } else {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "ユーザーIDを入力してください。",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">紹介管理</h1>
        <p className="text-muted-foreground">システム全体の紹介ネットワークと統計を管理します。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">登録済みユーザー</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総紹介数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">紹介による登録</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総投資額</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvestment.toLocaleString()} USDT</div>
            <p className="text-xs text-muted-foreground">全ユーザーの投資額</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ紹介者</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReferrers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">紹介実績のあるユーザー</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー検索</CardTitle>
          <CardDescription>特定のユーザーの紹介ツリーを表示します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="ユーザーIDを入力..."
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearchUser}>
              <Search className="h-4 w-4 mr-2" />
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>紹介ツリー: {selectedUserId}</CardTitle>
            <CardDescription>選択されたユーザーの紹介ネットワーク</CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralTree isAdmin={true} rootUserId={selectedUserId} />
          </CardContent>
        </Card>
      )}

      {!selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>システム全体の紹介ツリー</CardTitle>
            <CardDescription>全ユーザーの紹介関係を表示します</CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralTree isAdmin={true} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
