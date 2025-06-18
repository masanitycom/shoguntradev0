"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Copy, Share2, Loader2 } from "lucide-react"
import { QRCodeGenerator } from "./qr-code-generator"

interface ReferralLinkProps {
  className?: string
}

export function ReferralLink({ className }: ReferralLinkProps) {
  const [referralLink, setReferralLink] = useState("")
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    fetchReferralLink()
  }, [])

  async function fetchReferralLink() {
    try {
      setLoading(true)
      const response = await fetch("/api/user/referral-link")
      const data = await response.json()

      if (data.success) {
        setReferralLink(data.referralLink)
        setUserId(data.userId)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "紹介リンクの取得に失敗しました。",
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

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast({
        title: "コピー完了",
        description: "紹介リンクをクリップボードにコピーしました。",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "クリップボードへのコピーに失敗しました。",
      })
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SHOGUN TRADE 紹介リンク",
          text: "SHOGUN TRADEに参加しませんか？",
          url: referralLink,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      copyToClipboard()
    }
  }

  if (loading) {
    return (
      <Card className={`samurai-card text-white ${className}`}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`samurai-card text-white ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          紹介リンク
        </CardTitle>
        <CardDescription className="text-white/70">
          あなたの紹介リンクを使って新しいメンバーを招待しましょう
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white/90">あなたのユーザーID</label>
          <Input
            value={userId}
            readOnly
            className="mt-1 bg-black/20 border-white/20 text-white"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-white/90">紹介リンク</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={referralLink}
              readOnly
              className="bg-black/20 border-white/20 text-white"
            />
            <Button onClick={copyToClipboard} size="sm" variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={shareLink} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            シェア
          </Button>
          <Button 
            onClick={() => setShowQR(!showQR)} 
            variant="outline"
            className="flex-1"
          >
            QRコード{showQR ? "を隠す" : "を表示"}
          </Button>
        </div>

        {showQR && (
          <div className="mt-4">
            <QRCodeGenerator value={referralLink} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
