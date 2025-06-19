"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { User, Mail, Phone, Wallet, Loader2, Save } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  user_id: string
  usdt_address: string
  wallet_type: string
  current_level: number
  total_investment: number
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    usdt_address: "",
    wallet_type: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (data.success) {
        setProfile(data.profile)
        setFormData({
          name: data.profile.name || "",
          phone: data.profile.phone || "",
          usdt_address: data.profile.usdt_address || "",
          wallet_type: data.profile.wallet_type || "その他"
        })
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "プロフィール情報の取得に失敗しました。",
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

  async function handleSaveProfile() {
    setSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: "プロフィールが更新されました。",
        })
        fetchProfile()
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "プロフィールの更新に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setSaving(false)
    }
  }

  const getLevelName = (level: number) => {
    const levels = ["レベルなし", "足軽", "武将", "代官", "奉行", "老中", "大老", "大名", "将軍"]
    return levels[level] || "不明"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">プロフィール</h1>
          <p className="text-zinc-400">
            あなたのアカウント情報を確認・更新できます。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">ユーザーID</CardTitle>
              <User className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{profile?.user_id}</div>
              <p className="text-xs text-zinc-400">
                固有識別番号
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">MLMレベル</CardTitle>
              <User className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {getLevelName(profile?.current_level || 0)}
              </div>
              <p className="text-xs text-zinc-400">
                現在のランク
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">総投資額</CardTitle>
              <Wallet className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {profile?.total_investment?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-zinc-400">
                USDT
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">基本情報</CardTitle>
              <CardDescription className="text-zinc-400">
                変更できない基本的なアカウント情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">メールアドレス</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-300">{profile?.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">登録日</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-zinc-400" />
                  <span className="text-zinc-300">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : "不明"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">編集可能情報</CardTitle>
              <CardDescription className="text-zinc-400">
                更新可能なプロフィール情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">名前</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">電話番号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usdt_address" className="text-white">USDTアドレス</Label>
                <Input
                  id="usdt_address"
                  value={formData.usdt_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, usdt_address: e.target.value }))}
                  placeholder="USDT受取用ウォレットアドレス"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet_type" className="text-white">ウォレットタイプ</Label>
                <Select
                  value={formData.wallet_type}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, wallet_type: value }))}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="EVOカード" className="text-white">EVOカード (手数料5.5%)</SelectItem>
                    <SelectItem value="その他" className="text-white">その他 (手数料8%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    プロフィールを保存
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">重要な注意事項</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>• USDTアドレスは報酬受取に使用されます。正確に入力してください</p>
              <p>• EVOカードを選択すると出金手数料が5.5%になります（通常8%）</p>
              <p>• メールアドレスとユーザーIDは変更できません</p>
              <p>• MLMレベルは組織ボリュームに基づいて自動更新されます</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
