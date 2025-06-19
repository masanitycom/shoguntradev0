"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Plus, Loader2, Calendar } from "lucide-react"

interface NFTType {
  id: number
  name: string
  price_usdt: number
  daily_return_rate: number
  category: string
  is_special: boolean
}

export default function AdminNFTAssignPage() {
  const [nftTypes, setNftTypes] = useState<NFTType[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [formData, setFormData] = useState({
    userId: "",
    nftTypeId: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    isDelivered: false
  })

  useEffect(() => {
    fetchNFTTypes()
  }, [])

  async function fetchNFTTypes() {
    try {
      const response = await fetch("/api/nfts")
      const data = await response.json()

      if (data.success) {
        const allNfts = [...(data.nfts || []), ...(data.specialNfts || [])]
        setNftTypes(allNfts)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "NFTタイプの取得に失敗しました。",
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

  async function handleAssignNFT() {
    if (!formData.userId || !formData.nftTypeId || !formData.purchasePrice) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "すべての必須項目を入力してください。",
      })
      return
    }

    setAssigning(true)

    try {
      const response = await fetch("/api/admin/nfts/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: formData.userId,
          nftTypeId: parseInt(formData.nftTypeId),
          purchasePrice: parseFloat(formData.purchasePrice),
          purchaseDate: formData.purchaseDate,
          isDelivered: formData.isDelivered
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "成功",
          description: "NFTが正常に割り当てられました。",
        })
        setFormData({
          userId: "",
          nftTypeId: "",
          purchasePrice: "",
          purchaseDate: new Date().toISOString().split('T')[0],
          isDelivered: false
        })
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "NFT割り当てに失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setAssigning(false)
    }
  }

  const selectedNFT = nftTypes.find(nft => nft.id.toString() === formData.nftTypeId)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">NFT手動割り当て</h1>
          <p className="text-zinc-400">
            既存ユーザーにNFTを手動で割り当てます。過去の購入日設定も可能です。
          </p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">NFT割り当て</CardTitle>
            <CardDescription className="text-zinc-400">
              ユーザーIDとNFTタイプを選択してNFTを割り当てます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-white">ユーザーID *</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="ユーザーのUUIDを入力"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nftType" className="text-white">NFTタイプ *</Label>
                <Select
                  value={formData.nftTypeId}
                  onValueChange={(value: string) => {
                    const nft = nftTypes.find(n => n.id.toString() === value)
                    setFormData(prev => ({ 
                      ...prev, 
                      nftTypeId: value,
                      purchasePrice: nft ? nft.price_usdt.toString() : ""
                    }))
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="NFTタイプを選択" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {loading ? (
                      <SelectItem value="loading" disabled>読み込み中...</SelectItem>
                    ) : (
                      nftTypes.map((nft) => (
                        <SelectItem key={nft.id} value={nft.id.toString()} className="text-white">
                          {nft.name} - {nft.price_usdt} USDT
                          {nft.is_special && " (特例)"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-white">購入価格 (USDT) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="購入価格を入力"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-white">購入日</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isDelivered"
                checked={formData.isDelivered}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDelivered: checked }))}
              />
              <Label htmlFor="isDelivered" className="text-white">
                NFTを送付済みとしてマーク
              </Label>
            </div>

            {selectedNFT && (
              <div className="rounded-md border border-zinc-800 p-4">
                <h4 className="font-medium text-white mb-2">選択されたNFT詳細</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">名前:</span>
                    <span className="ml-2 text-white">{selectedNFT.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">価格:</span>
                    <span className="ml-2 text-green-500">{selectedNFT.price_usdt} USDT</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">日利:</span>
                    <span className="ml-2 text-blue-500">{(selectedNFT.daily_return_rate * 100).toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">カテゴリ:</span>
                    <span className="ml-2 text-white">
                      {selectedNFT.is_special ? "特例NFT" : "通常NFT"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleAssignNFT} 
                disabled={assigning}
                className="bg-red-600 hover:bg-red-700"
              >
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    割り当て中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    NFTを割り当て
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">重要な注意事項</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>• ユーザーは1人1枚のNFTのみ保有可能です</p>
              <p>• 購入日は日利計算の開始日として使用されます</p>
              <p>• 過去の日付を設定することで、既存ユーザーの履歴を正確に反映できます</p>
              <p>• 送付済みマークを付けると、即座に日利計算が開始されます</p>
              <p>• 特例NFTは既存投資者向けの特別価格NFTです</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
