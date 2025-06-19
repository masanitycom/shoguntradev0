'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Crown, Coins, Users, TrendingUp, Gift, LogOut } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  user_id: string
  role: string
  created_at: string
}

interface DashboardStats {
  totalInvestment: number
  currentLevel: number
  levelName: string
  directReferrals: number
  indirectReferrals: number
  weeklyEarnings: number
  nftCount: number
}

export default function Dashboard() {
  const [, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalInvestment: 0,
    currentLevel: 1,
    levelName: '足軽',
    directReferrals: 0,
    indirectReferrals: 0,
    weeklyEarnings: 0,
    nftCount: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const mlmLevels = [
    { level: 1, name: '足軽', nameEnglish: 'Ashigaru' },
    { level: 2, name: '武将', nameEnglish: 'Busho' },
    { level: 3, name: '代官', nameEnglish: 'Daimyo' },
    { level: 4, name: '奉行', nameEnglish: 'Bugyo' },
    { level: 5, name: '老中', nameEnglish: 'Rochu' },
    { level: 6, name: '大老', nameEnglish: 'Tairo' },
    { level: 7, name: '大名', nameEnglish: 'Taimei' },
    { level: 8, name: '将軍', nameEnglish: 'Shogun' }
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        
        setStats({
          totalInvestment: 5000,
          currentLevel: 3,
          levelName: '代官',
          directReferrals: 12,
          indirectReferrals: 45,
          weeklyEarnings: 250,
          nftCount: 2
        })
      }

      setLoading(false)
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen samurai-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen samurai-bg">
      {/* Header */}
      <header className="samurai-card border-b border-red-600/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Crown className="h-8 w-8 text-red-600 mr-3" />
            <h1 className="text-2xl font-bold text-white">SHOGUN TRADE</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              {profile?.name} ({profile?.user_id})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-1" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            ようこそ、{profile?.name}さん
          </h2>
          <p className="text-gray-400">
            現在のランク: <span className="text-red-600 font-semibold">{stats.levelName}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">総投資額</p>
                <p className="text-2xl font-bold text-white">${stats.totalInvestment.toLocaleString()}</p>
              </div>
              <Coins className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">直接紹介</p>
                <p className="text-2xl font-bold text-white">{stats.directReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">週間収益</p>
                <p className="text-2xl font-bold text-white">${stats.weeklyEarnings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">保有NFT</p>
                <p className="text-2xl font-bold text-white">{stats.nftCount}</p>
              </div>
              <Gift className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/dashboard/nfts')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <Gift className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">NFT購入</h3>
            <p className="text-gray-400">侍戦士NFTを購入して収益を開始</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/referrals')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <Users className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">紹介管理</h3>
            <p className="text-gray-400">紹介リンクとツリーを確認</p>
          </button>

          <button
            onClick={() => router.push('/dashboard/rewards')}
            className="samurai-card rounded-lg p-6 hover:bg-red-900/20 transition-colors text-left"
          >
            <TrendingUp className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">週間報酬</h3>
            <p className="text-gray-400">エアドロップタスクと報酬</p>
          </button>
        </div>

        {/* MLM Level Progress */}
        <div className="samurai-card rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6">ランク進捗</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {mlmLevels.map((level) => (
              <div
                key={level.level}
                className={`text-center p-4 rounded-lg border ${
                  level.level <= stats.currentLevel
                    ? 'border-red-600 bg-red-900/20'
                    : 'border-gray-600 bg-gray-900/20'
                }`}
              >
                <Crown
                  className={`h-6 w-6 mx-auto mb-2 ${
                    level.level <= stats.currentLevel ? 'text-red-600' : 'text-gray-600'
                  }`}
                />
                <p className={`text-sm font-semibold ${
                  level.level <= stats.currentLevel ? 'text-white' : 'text-gray-400'
                }`}>
                  {level.name}
                </p>
                <p className={`text-xs ${
                  level.level <= stats.currentLevel ? 'text-red-400' : 'text-gray-500'
                }`}>
                  Lv.{level.level}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
