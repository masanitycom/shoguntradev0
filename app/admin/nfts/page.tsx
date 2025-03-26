"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash } from "lucide-react"

interface NFT {
  id: string
  name: string
  price: number
  daily_rate: number
  is_special: boolean
  is_active: boolean
  image_url: string
}

export default function AdminNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNft, setEditingNft] = useState<NFT | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    daily_rate: "",
    is_special: false,
    is_active: true,
    image_url: "",
  })

  useEffect(() => {
    fetchNFTs()
  }, [])

  async function fetchNFTs() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/nfts")
      const data = await response.json()

      if (data.success) {
        setNfts(data.nfts)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "NFT情報の取得に失敗しました。",
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

  function handleEdit(nft: NFT) {
    setEditingNft(nft)
    setFormData({
      name: nft.name,
      price: nft.price.toString(),
      daily_rate: nft.daily_rate.toString(),
      is_special: nft.is_special,
      is_active: nft.is_active,
      image_url: nft.image_url,
    })
  }

  function handleNew() {
    setEditingNft(null)
    setFormData({
      name: "",
      price: "",
      daily_rate: "",
      is_special: false,
      is_active: true,
      image_url: "",
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const payload = {
        ...formData,
        price: Number.parseFloat(formData.price),
        daily_rate: Number.parseFloat(formData.daily_rate),
      }

      const url = editingNft ? `/api/admin/nfts/${editingNft.id}` : "/api/admin/nfts"

      const method = editingNft ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: editingNft ? "NFTが更新されました。" : "NFTが作成されました。",
        })
        fetchNFTs()
        setEditingNft(null)
        setFormData({
          name: "",
          price: "",
          daily_rate: "",
          is_special: false,
          is_active: true,
          image_url: "",
        })
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "操作に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("このNFTを削除してもよろしいですか？")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/nfts/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: "NFTが削除されました。",
        })
        fetchNFTs()
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "削除に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const response = await fetch(`/api/admin/nfts/${id}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: `NFTが${!isActive ? "有効" : "無効"}になりました。`,
        })
        fetchNFTs()
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "操作に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">NFT管理</h1>
          <p className="text-muted-foreground">NFTの登録、編集、削除を行います。</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          新規NFT
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>NFT一覧</CardTitle>
            <CardDescription>登録されているNFT一覧</CardDescription>
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
                      <TableHead>名前</TableHead>
                      <TableHead>価格</TableHead>
                      <TableHead>日利</TableHead>
                      <TableHead>特別</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nfts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          NFTがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      nfts.map((nft) => (
                        <TableRow key={nft.id}>
                          <TableCell>{nft.name}</TableCell>
                          <TableCell>{nft.price.toLocaleString()} USDT</TableCell>
                          <TableCell>{nft.daily_rate}%</TableCell>
                          <TableCell>{nft.is_special ? "はい" : "いいえ"}</TableCell>
                          <TableCell>
                            <Switch
                              checked={nft.is_active}
                              onCheckedChange={() => handleToggleActive(nft.id, nft.is_active)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(nft)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(nft.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
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

        <Card>
          <CardHeader>
            <CardTitle>{editingNft ? "NFT編集" : "新規NFT登録"}</CardTitle>
            <CardDescription>{editingNft ? "NFT情報を編集します" : "新しいNFTを登録します"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">NFT名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">価格 (USDT)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_rate">日利上限 (%)</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">画像URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_special"
                  checked={formData.is_special}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_special: checked })}
                />
                <Label htmlFor="is_special">特別NFT</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">有効</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingNft(null)}>
                  キャンセル
                </Button>
                <Button type="submit">{editingNft ? "更新" : "登録"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

