"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Package, CheckCircle } from "lucide-react"

interface Purchase {
  id: string
  user_id: string
  nft_id: string
  purchase_price: number
  delivery_status: string
  delivered_at: string | null
  created_at: string
  nfts: {
    name: string
    image_url: string
  }
  users: {
    name: string
    user_id: string
    email: string
  }
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchPurchases()
  }, [])

  async function fetchPurchases() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/purchases")
      const data = await response.json()

      if (data.success) {
        setPurchases(data.purchases)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "購入情報の取得に失敗しました。",
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

  async function handleUpdateDeliveryStatus(purchaseId: string, status: string) {
    setUpdating(purchaseId)

    try {
      const response = await fetch(`/api/admin/purchases/${purchaseId}/delivery`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: `配送状況が${status === 'delivered' ? '送付済み' : status}に更新されました。`,
        })
        fetchPurchases()
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "更新に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setUpdating(null)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">準備中</Badge>
      case 'processing':
        return <Badge variant="outline">処理中</Badge>
      case 'delivered':
        return <Badge variant="default" className="bg-green-600">送付済み</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">NFT購入・配送管理</h1>
        <p className="text-muted-foreground">ユーザーのNFT購入状況と配送ステータスを管理します。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NFT購入一覧</CardTitle>
          <CardDescription>全ユーザーのNFT購入履歴と配送状況</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>NFT</TableHead>
                  <TableHead>購入価格</TableHead>
                  <TableHead>購入日</TableHead>
                  <TableHead>配送状況</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.users?.name}</div>
                        <div className="text-sm text-muted-foreground">{purchase.users?.user_id}</div>
                        <div className="text-sm text-muted-foreground">{purchase.users?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 overflow-hidden rounded bg-muted">
                          <img
                            src={purchase.nfts?.image_url || "/placeholder.svg?height=40&width=40"}
                            alt={purchase.nfts?.name || "NFT"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{purchase.nfts?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{purchase.purchase_price?.toLocaleString()} USDT</TableCell>
                    <TableCell>{new Date(purchase.created_at).toLocaleDateString('ja-JP')}</TableCell>
                    <TableCell>{getStatusBadge(purchase.delivery_status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {purchase.delivery_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateDeliveryStatus(purchase.id, 'processing')}
                            disabled={updating === purchase.id}
                          >
                            {updating === purchase.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Package className="h-4 w-4 mr-1" />
                                処理中
                              </>
                            )}
                          </Button>
                        )}
                        {(purchase.delivery_status === 'pending' || purchase.delivery_status === 'processing') && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateDeliveryStatus(purchase.id, 'delivered')}
                            disabled={updating === purchase.id}
                          >
                            {updating === purchase.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                送付済み
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
