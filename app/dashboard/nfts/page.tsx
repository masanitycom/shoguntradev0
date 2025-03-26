"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface NFT {
  id: string
  name: string
  price: number
  daily_rate: number
  is_special: boolean
  is_active: boolean
  image_url: string
}

export default function NFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNFTs() {
      try {
        const response = await fetch("/api/nfts")
        const data = await response.json()

        if (data.success) {
          // 通常のNFTのみを表示（特別NFTは非表示）
          setNfts(data.nfts.filter((nft: NFT) => !nft.is_special && nft.is_active))
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

    fetchNFTs()
  }, [])

  async function handlePurchase(nftId: string) {
    setPurchasing(nftId)

    try {
      const response = await fetch("/api/nfts/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nftId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "購入完了",
          description: "NFTの購入が完了しました。",
        })
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
      setPurchasing(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">NFT投資</h1>
          <p className="text-muted-foreground">様々な価格帯のNFTに投資し、日利0.5%～2.0%の報酬を獲得しましょう。</p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nfts.map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={nft.image_url || "/placeholder.svg?height=300&width=300"}
                    alt={nft.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{nft.name}</CardTitle>
                  <CardDescription>日利上限: {nft.daily_rate}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{nft.price.toLocaleString()} USDT</div>
                  <p className="text-sm text-muted-foreground">
                    最大報酬: {(nft.price * 3).toLocaleString()} USDT (投資額の300%)
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handlePurchase(nft.id)} disabled={purchasing === nft.id}>
                    {purchasing === nft.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        購入処理中...
                      </>
                    ) : (
                      "購入する"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

