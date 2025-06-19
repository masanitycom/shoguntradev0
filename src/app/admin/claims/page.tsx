'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

interface RewardClaim {
  id: number
  user_id: string
  user_name: string
  nft_name: string
  week_start: string
  week_end: string
  daily_rewards: number
  total_reward: number
  claim_type: 'payout' | 'compound'
  status: 'pending' | 'approved' | 'rejected'
  survey_satisfaction?: number
  survey_recommendation?: number
  created_at: string
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<RewardClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/admin/claims')
      if (response.ok) {
        const data = await response.json()
        setClaims(data)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateClaimStatus = async (claimId: number, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setClaims(claims.map(claim => 
          claim.id === claimId ? { ...claim, status } : claim
        ))
      }
    } catch (error) {
      console.error('Error updating claim status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" />保留中</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />承認済み</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />拒否</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getClaimTypeBadge = (type: string) => {
    return type === 'payout' ? 
      <Badge variant="outline" className="border-blue-600 text-blue-400">出金</Badge> :
      <Badge variant="outline" className="border-green-600 text-green-400">複利</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">報酬申請管理</h1>
        <p className="text-gray-400 mt-2">ユーザーからの報酬申請を管理します</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="samurai-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">総申請数</CardTitle>
            <Clock className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{claims.length}</div>
          </CardContent>
        </Card>

        <Card className="samurai-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">保留中</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {claims.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card className="samurai-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">承認済み</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {claims.filter(c => c.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card className="samurai-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">拒否</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {claims.filter(c => c.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="samurai-card">
        <CardHeader>
          <CardTitle className="text-white">報酬申請一覧</CardTitle>
          <CardDescription className="text-gray-400">
            ユーザーからの報酬申請を確認・承認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">ユーザー</TableHead>
                <TableHead className="text-gray-300">NFT</TableHead>
                <TableHead className="text-gray-300">期間</TableHead>
                <TableHead className="text-gray-300">報酬額</TableHead>
                <TableHead className="text-gray-300">種類</TableHead>
                <TableHead className="text-gray-300">ステータス</TableHead>
                <TableHead className="text-gray-300">申請日</TableHead>
                <TableHead className="text-gray-300">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400">
                    報酬申請がありません
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id} className="border-gray-700">
                    <TableCell className="text-white">{claim.user_name}</TableCell>
                    <TableCell className="text-white">{claim.nft_name}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(claim.week_start).toLocaleDateString('ja-JP')} - {new Date(claim.week_end).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell className="text-white">{claim.total_reward.toFixed(2)} USDT</TableCell>
                    <TableCell>{getClaimTypeBadge(claim.claim_type)}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(claim.created_at).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {claim.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateClaimStatus(claim.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              承認
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateClaimStatus(claim.id, 'rejected')}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              拒否
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedClaim(claim)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          詳細
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
