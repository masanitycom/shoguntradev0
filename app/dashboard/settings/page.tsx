"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { User, Mail, Phone, Calendar, UserCheck } from "lucide-react"

interface UserProfile {
  user_id: string
  name: string
  email: string
  phone_number: string
  referrer_id: string
  created_at: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (data.success) {
        setProfile(data.user)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "プロフィールの取得に失敗しました。",
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-white/70">読み込み中...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">設定</h1>
          <p className="text-white/70">アカウント情報を確認・管理します。</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="samurai-card text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                プロフィール情報
              </CardTitle>
              <CardDescription className="text-white/70">
                あなたのアカウント情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">ユーザーID</Label>
                <Input
                  value={profile?.user_id || ""}
                  readOnly
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">お名前</Label>
                <Input
                  value={profile?.name || ""}
                  readOnly
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">メールアドレス</Label>
                <Input
                  value={profile?.email || ""}
                  readOnly
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">電話番号</Label>
                <Input
                  value={profile?.phone_number || ""}
                  readOnly
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                紹介情報
              </CardTitle>
              <CardDescription className="text-white/70">
                紹介関係の情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">紹介者ID</Label>
                <Input
                  value={profile?.referrer_id || "なし"}
                  readOnly
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">登録日</Label>
                <Input
                  value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : ""}
                  readOnly
                  className="bg-black/20 border-white/20 text-white"
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full" disabled>
                  プロフィール編集（準備中）
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="samurai-card text-white">
          <CardHeader>
            <CardTitle>セキュリティ設定</CardTitle>
            <CardDescription className="text-white/70">
              アカウントのセキュリティを管理します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" disabled>
              パスワード変更（準備中）
            </Button>
            <Button variant="outline" disabled>
              二段階認証設定（準備中）
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
