"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { ChevronDown, ChevronRight, Users, Search, Loader2 } from "lucide-react"

interface ReferralUser {
  user_id: string
  name: string
  email: string
  created_at: string
  referrer_id: string
  totalPurchases: number
  childCount: number
  hasChildren: boolean
}

interface ReferralTreeProps {
  className?: string
  isAdmin?: boolean
  rootUserId?: string
}

export function ReferralTree({ className, isAdmin = false, rootUserId }: ReferralTreeProps) {
  const [referrals, setReferrals] = useState<ReferralUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchReferrals()
  }, [currentPage, rootUserId])

  async function fetchReferrals(parentId?: string, reset = false) {
    try {
      if (reset) {
        setLoading(true)
        setReferrals([])
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      })

      if (parentId) {
        params.append("parentId", parentId)
      }

      if (rootUserId && isAdmin) {
        params.append("parentId", rootUserId)
      }

      const response = await fetch(`/api/mlm/referrals?${params}`)
      const data = await response.json()

      if (data.success) {
        if (reset || currentPage === 1) {
          setReferrals(data.referrals)
        } else {
          setReferrals(prev => [...prev, ...data.referrals])
        }
        setHasMore(data.hasMore)
        setTotalCount(data.totalCount)
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "紹介ツリーの取得に失敗しました。",
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

  function toggleExpanded(userId: string) {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedNodes(newExpanded)
  }

  function loadMore() {
    setCurrentPage(prev => prev + 1)
  }

  const filteredReferrals = referrals.filter(referral =>
    referral.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className={`samurai-card text-white ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          紹介ツリー
        </CardTitle>
        <CardDescription className="text-white/70">
          あなたの紹介ネットワークとNFT購入状況 ({totalCount}人)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="ユーザーIDまたはメールで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {loading && referrals.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReferrals.map((referral) => (
              <ReferralNode
                key={referral.user_id}
                referral={referral}
                isExpanded={expandedNodes.has(referral.user_id)}
                onToggle={() => toggleExpanded(referral.user_id)}
                level={0}
              />
            ))}

            {hasMore && !searchTerm && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={loadMore} 
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  さらに読み込む
                </Button>
              </div>
            )}

            {filteredReferrals.length === 0 && !loading && (
              <div className="text-center py-8 text-white/70">
                {searchTerm ? "検索結果が見つかりません" : "まだ紹介者がいません"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ReferralNodeProps {
  referral: ReferralUser
  isExpanded: boolean
  onToggle: () => void
  level: number
}

function ReferralNode({ referral, isExpanded, onToggle, level }: ReferralNodeProps) {
  const [childReferrals, setChildReferrals] = useState<ReferralUser[]>([])
  const [loadingChildren, setLoadingChildren] = useState(false)

  useEffect(() => {
    if (isExpanded && referral.hasChildren && childReferrals.length === 0) {
      fetchChildReferrals()
    }
  }, [isExpanded])

  async function fetchChildReferrals() {
    try {
      setLoadingChildren(true)
      const response = await fetch(`/api/mlm/referrals?parentId=${referral.user_id}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setChildReferrals(data.referrals)
      }
    } catch (error) {
      console.error("Error fetching child referrals:", error)
    } finally {
      setLoadingChildren(false)
    }
  }

  return (
    <div className={`${level > 0 ? 'ml-6 border-l border-white/20 pl-4' : ''}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10">
        {referral.hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-0 h-auto text-white/70 hover:text-white"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{referral.user_id}</span>
            {referral.totalPurchases > 0 && (
              <Badge variant="secondary" className="text-xs">
                {referral.totalPurchases.toLocaleString()} USDT
              </Badge>
            )}
            {referral.hasChildren && (
              <Badge variant="outline" className="text-xs">
                {referral.childCount}人紹介
              </Badge>
            )}
          </div>
          <div className="text-sm text-white/70">
            登録日: {new Date(referral.created_at).toLocaleDateString('ja-JP')}
          </div>
        </div>
      </div>

      {isExpanded && referral.hasChildren && (
        <div className="mt-2">
          {loadingChildren ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {childReferrals.map((child) => (
                <ReferralNode
                  key={child.user_id}
                  referral={child}
                  isExpanded={false}
                  onToggle={() => {}}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
