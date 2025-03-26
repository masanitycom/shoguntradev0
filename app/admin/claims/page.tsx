"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Check, X } from "lucide-react"

interface Claim {
  id: string
  user_id: string
  user_name: string
  user_email: string
  claim_type: string
  amount: number
  fee: number
  net_amount: number
  feedback: string
  status: string
  created_at: string
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [])

  async function fetchClaims() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/claims")
      const data = await response.json()

      if (data.success) {
        setClaims(data.claims)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "報酬申請情報の取得に失敗しました。",
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

  async function handleProcessClaim(id: string, approve: boolean) {
    setProcessing(id)

    try {
      const response = await fetch(`/api/admin/claims/${id}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approve }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: approve ? "報酬申請が承認されました。" : "報酬申請が拒否されました。",
        })
        fetchClaims()
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "処理に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">報酬申請一覧</h1>
        <p className="text-muted-foreground">ユーザーからの報酬申請を管理します。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>報酬申請一覧</CardTitle>
          <CardDescription>ユーザーからの報酬申請一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ユーザー</TableHead>
                    <TableHead>申請タイプ</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>手数料</TableHead>
                    <TableHead>純額</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>申請日</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        報酬申請がありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <div className="font-medium">{claim.user_name}</div>
                          <div className="text-xs text-muted-foreground">{claim.user_email}</div>
                        </TableCell>
                        <TableCell>{claim.claim_type === "airdrop" ? "報酬受取" : "複利運用"}</TableCell>
                        <TableCell>{claim.amount.toLocaleString()} USDT</TableCell>
                        <TableCell>{claim.fee.toLocaleString()} USDT</TableCell>
                        <TableCell>{claim.net_amount.toLocaleString()} USDT</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              claim.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                                : claim.status === "approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                            }`}
                          >
                            {claim.status === "pending" ? "保留中" : claim.status === "approved" ? "承認済" : "拒否"}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(claim.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {claim.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleProcessClaim(claim.id, true)}
                                disabled={processing === claim.id}
                              >
                                {processing === claim.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleProcessClaim(claim.id, false)}
                                disabled={processing === claim.id}
                              >
                                {processing === claim.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">処理済み</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {claims.some((claim) => claim.claim_type === "airdrop" && claim.status === "pending") && (
        <Card>
          <CardHeader>
            <CardTitle>アンケート回答</CardTitle>
            <CardDescription>報酬受取申請のアンケート回答</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claims
                .filter((claim) => claim.claim_type === "airdrop" && claim.status === "pending")
                .map((claim) => (
                  <div key={`feedback-${claim.id}`} className="rounded-md border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">{claim.user_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(claim.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{claim.feedback || "アンケート回答なし"}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

