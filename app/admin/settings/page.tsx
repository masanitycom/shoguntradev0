"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initializing, setInitializing] = useState(false)

  async function handleSaveSettings() {
    setSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maintenance_mode: maintenanceMode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: "設定が保存されました。",
        })
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "設定の保存に失敗しました。",
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

  async function handleInitializeDatabase() {
    if (!confirm("データベースを初期化してもよろしいですか？この操作は元に戻せません。")) {
      return
    }

    setInitializing(true)

    try {
      const response = await fetch("/api/admin/initialize-database", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: "データベースが初期化されました。",
        })
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "データベースの初期化に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setInitializing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">システム設定</h1>
        <p className="text-muted-foreground">システム全体の設定を管理します。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>一般設定</CardTitle>
            <CardDescription>システム全体の設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              <Label htmlFor="maintenance-mode">メンテナンスモード</Label>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                設定を保存
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>データベース管理</CardTitle>
            <CardDescription>データベースの初期化</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">データベースを初期化します。この操作は元に戻せません。</p>

            <div className="flex justify-end">
              <Button variant="destructive" onClick={handleInitializeDatabase} disabled={initializing}>
                {initializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                データベース初期化
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NFT初期データ</CardTitle>
          <CardDescription>NFTの初期データを登録します</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">以下のNFTが初期データとして登録されます。</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 300</h3>
                <p className="text-sm text-muted-foreground">価格: 300 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 0.5%</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 500</h3>
                <p className="text-sm text-muted-foreground">価格: 500 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 0.5%</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 1,000</h3>
                <p className="text-sm text-muted-foreground">価格: 1,000 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 1.0%</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 3,000</h3>
                <p className="text-sm text-muted-foreground">価格: 3,000 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 1.0%</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 5,000</h3>
                <p className="text-sm text-muted-foreground">価格: 5,000 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 1.0%</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 10,000</h3>
                <p className="text-sm text-muted-foreground">価格: 10,000 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 1.25%</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 30,000</h3>
                <p className="text-sm text-muted-foreground">価格: 30,000 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 1.5%</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium">SHOGUN NFT 100,000</h3>
                <p className="text-sm text-muted-foreground">価格: 100,000 USDT</p>
                <p className="text-sm text-muted-foreground">日利上限: 2.0%</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>初期NFTを登録</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

