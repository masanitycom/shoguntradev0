import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Coins, TrendingUp, Gift, Users } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ダッシュボード</h1>
          <p className="text-white/70">SHOGUN TRADEへようこそ。あなたの投資状況を確認しましょう。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">保有NFT数</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-white/70">NFTを購入して投資を始めましょう</p>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総投資額</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 USDT</div>
              <p className="text-xs text-white/70">NFTを購入して投資を始めましょう</p>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現在の報酬</CardTitle>
              <Gift className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 USDT</div>
              <p className="text-xs text-white/70">NFTを購入して報酬を獲得しましょう</p>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現在のランク</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">足軽</div>
              <p className="text-xs text-white/70">天下統一への道を進みましょう</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="samurai-card text-white">
            <CardHeader>
              <CardTitle>NFT運用状況</CardTitle>
              <CardDescription className="text-white/70">あなたの保有NFTと運用状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 p-4 text-center">
                <p className="text-white/70">NFTを購入すると、ここに運用状況が表示されます</p>
              </div>
            </CardContent>
          </Card>

          <Card className="samurai-card text-white">
            <CardHeader>
              <CardTitle>報酬履歴</CardTitle>
              <CardDescription className="text-white/70">直近の報酬履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 p-4 text-center">
                <p className="text-white/70">報酬が発生すると、ここに履歴が表示されます</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

