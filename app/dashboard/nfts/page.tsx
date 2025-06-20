"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

interface NFT {
  id: string
  name: string
  price_usdt: number
  daily_return_rate: number
  is_special: boolean
  is_active: boolean
  image_url: string
}

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [userNfts, setUserNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedNft, setSelectedNft] = useState<string>("")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const nftResponse = await fetch("/api/nfts")
        const nftData = await nftResponse.json()

        if (nftData.success) {
          const allNfts = [...(nftData.nfts || []), ...(nftData.specialNfts || [])]
          setNfts(allNfts.map((nft: any) => ({
            id: nft.id,
            name: nft.name,
            price_usdt: nft.price,
            daily_return_rate: nft.dailyReturnRate / 100,
            is_special: nft.isSpecial,
            is_active: true,
            image_url: nft.imageUrl || "/placeholder.svg"
          })))
        }

        const userNftResponse = await fetch("/api/user/nfts")
        const userNftData = await userNftResponse.json()

        if (userNftData.success) {
          setUserNfts(userNftData.nfts)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "データの取得に失敗しました。",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handlePurchase() {
    if (!selectedNft) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "NFTを選択してください。",
      })
      return
    }

    setPurchasing(true)

    try {
      const response = await fetch("/api/nfts/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nftId: selectedNft }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "購入完了",
          description: "NFTの購入が完了しました。実際のNFTは後日ウォレットに送付されます。",
        })
        const userNftResponse = await fetch("/api/user/nfts")
        const userNftData = await userNftResponse.json()
        if (userNftData.success) {
          setUserNfts(userNftData.nfts)
        }
        setSelectedNft("")
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: data.message || "NFTの購入に失敗しました。",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サーバーエラーが発生しました。",
      })
    } finally {
      setPurchasing(false)
    }
  }

  const hasNft = userNfts.length > 0

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NFT投資</h1>
          <p className="text-white/70">
            {hasNft 
              ? "あなたは既にNFTを所有しています。1人1枚まで購入可能です。" 
              : "様々な価格帯のNFTに投資し、日利0.5%～2.0%の報酬を獲得しましょう。1人1枚まで購入可能です。"
            }
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        ) : (
          <>
            {hasNft && (
              <Card className="samurai-card text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    所有NFT
                  </CardTitle>
                  <CardDescription className="text-white/70">あなたが現在所有しているNFT</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {userNfts.map((purchase) => (
                      <div key={purchase.id} className="flex items-center gap-4 p-4 border border-white/10 rounded-lg">
                        <div className="w-16 h-16 overflow-hidden rounded-lg bg-white/10">
                          <Image
                            src={purchase.nfts?.image_url || "/placeholder.svg?height=64&width=64"}
                            alt={purchase.nfts?.name || "NFT"}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{purchase.nfts?.name}</h3>
                          <p className="text-sm text-white/70">
                            購入価格: {purchase.purchase_price?.toLocaleString()} USDT
                          </p>
                          <p className="text-sm text-white/70">
                            配送状況: {purchase.delivery_status === 'pending' ? '準備中' : 
                                     purchase.delivery_status === 'delivered' ? '送付済み' : purchase.delivery_status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!hasNft && (
              <div className="grid gap-6">
                <Card className="samurai-card text-white">
                  <CardHeader>
                    <CardTitle>NFT選択</CardTitle>
                    <CardDescription className="text-white/70">購入するNFTを選択してください（1人1枚まで）</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedNft} onValueChange={setSelectedNft}>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {nfts.map((nft) => (
                          <div key={nft.id} className="relative">
                            <Label
                              htmlFor={nft.id}
                              className="cursor-pointer block border border-white/20 rounded-lg p-4 hover:border-primary/50 transition-colors"
                            >
                              <RadioGroupItem value={nft.id} id={nft.id} className="absolute top-2 left-2" />
                              <div className="aspect-square w-full overflow-hidden rounded-lg bg-white/10 mb-4">
                                <Image
                                  src={nft.image_url || "/placeholder.svg?height=200&width=200"}
                                  alt={nft.name}
                                  width={200}
                                  height={200}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="space-y-2">
                                <h3 className="font-semibold">{nft.name}</h3>
                                <p className="text-sm text-white/70">日利上限: {(nft.daily_return_rate * 100).toFixed(1)}%</p>
                                <div className="text-xl font-bold text-primary">{nft.price_usdt.toLocaleString()} USDT</div>
                                <p className="text-xs text-white/70">
                                  最大報酬: {(nft.price_usdt * 3).toLocaleString()} USDT
                                </p>
                              </div>
                              {selectedNft === nft.id && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={handlePurchase} 
                      disabled={!selectedNft || purchasing}
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          購入処理中...
                        </>
                      ) : (
                        "選択したNFTを購入する"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

