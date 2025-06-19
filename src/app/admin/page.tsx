'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Shield, Users, Gift, TrendingUp, Settings, FileText } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalNFTs: number
  totalInvestment: number
  pendingDeliveries: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalNFTs: 0,
    totalInvestment: 0,
    pendingDeliveries: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile || profile.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setStats({
          totalUsers: 156,
          totalNFTs: 89,
          totalInvestment: 245000,
          pendingDeliveries: 12
        })
      } catch (error) {
        console.error('Admin access check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen samurai-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen samurai-bg">
      <header className="samurai-card border-b border-red-600/30">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Shield className="h-8 w-8 text-red-600 mr-3" />
            管理者ダッシュボード
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">総ユーザー数</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">販売NFT数</p>
                <p className="text-2xl font-bold text-white">{stats.totalNFTs}</p>
              </div>
              <Gift className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">総投資額</p>
                <p className="text-2xl font-bold text-white">${stats.totalInvestment.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">配送待ち</p>
                <p className="text-2xl font-bold text-white">{stats.pendingDeliveries}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/admin/users')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <Users className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">ユーザー管理</h3>
            <p className="text-gray-400">ユーザー情報の確認・編集</p>
          </button>

          <button
            onClick={() => router.push('/admin/nfts')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <Gift className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">NFT管理</h3>
            <p className="text-gray-400">NFT配送状況・特別NFT付与</p>
          </button>

          <button
            onClick={() => router.push('/admin/rewards')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <TrendingUp className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">報酬管理</h3>
            <p className="text-gray-400">週間報酬・エアドロップ申請</p>
          </button>

          <button
            onClick={() => router.push('/admin/referrals')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <Users className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">紹介管理</h3>
            <p className="text-gray-400">紹介関係ツリー・統計</p>
          </button>

          <button
            onClick={() => router.push('/admin/mlm')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <Shield className="h-8 w-8 text-yellow-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">MLM管理</h3>
            <p className="text-gray-400">ランク管理・天下統一ボーナス</p>
          </button>

          <button
            onClick={() => router.push('/admin/settings')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <Settings className="h-8 w-8 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">システム設定</h3>
            <p className="text-gray-400">メンテナンス・システム管理</p>
          </button>
        </div>
      </div>
    </div>
  )
}
