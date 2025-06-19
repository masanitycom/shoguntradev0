'use client'

import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign } from 'lucide-react'

interface ReferralNode {
  id: string
  name: string
  level: number
  directReferrals: number
  totalInvestment: number
  children?: ReferralNode[]
}

interface ReferralTreeProps {
  data?: ReferralNode[]
  maxDepth?: number
  isAdmin?: boolean
  rootUserId?: string
}

function ReferralTree({ data = [], maxDepth = 3, isAdmin = false, rootUserId }: ReferralTreeProps) {
  const [treeData, setTreeData] = useState<ReferralNode[]>(data)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAdmin && rootUserId) {
      fetchReferralTree()
    } else if (isAdmin && !rootUserId) {
      fetchAllReferrals()
    }
  }, [isAdmin, rootUserId])

  const fetchReferralTree = async () => {
    if (!rootUserId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/referrals/tree?userId=${rootUserId}`)
      const result = await response.json()
      if (result.success) {
        setTreeData(result.data)
      }
    } catch (error) {
      console.error('Error fetching referral tree:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllReferrals = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/referrals/tree')
      const result = await response.json()
      if (result.success) {
        setTreeData(result.data)
      }
    } catch (error) {
      console.error('Error fetching all referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderNode = (node: ReferralNode, depth: number = 0) => {
    if (depth >= maxDepth) return null

    return (
      <div key={node.id} className="relative">
        <div className="samurai-card rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold">ID: {node.id}</h4>
                <p className="text-gray-400 text-sm">レベル {node.level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-400 text-sm">
                <DollarSign className="h-4 w-4 mr-1" />
                ${node.totalInvestment.toLocaleString()}
              </div>
              <div className="flex items-center text-blue-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                {node.directReferrals}人紹介
              </div>
            </div>
          </div>
        </div>

        {node.children && node.children.length > 0 && (
          <div className="ml-8 border-l-2 border-red-600/30 pl-4">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="samurai-card rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="samurai-card rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Users className="h-6 w-6 text-red-600 mr-2" />
          紹介ツリー
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          最大{maxDepth}レベルまで表示しています。パフォーマンス向上のため、全体表示は制限されています。
        </p>
      </div>

      <div className="space-y-4">
        {treeData.map(node => renderNode(node))}
      </div>

      {treeData.length === 0 && !loading && (
        <div className="samurai-card rounded-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">まだ紹介者がいません</p>
          <p className="text-gray-500 text-sm mt-2">
            紹介リンクを共有して、最初の紹介者を獲得しましょう
          </p>
        </div>
      )}
    </div>
  )
}

export default ReferralTree
export { ReferralTree }
