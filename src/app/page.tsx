'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Sword, Shield, Crown } from 'lucide-react'

export default function Home() {
  const [, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-8">
            <Crown className="h-16 w-16 text-red-600 mr-4" />
            <h1 className="text-6xl font-bold text-white">
              SHOGUN TRADE
            </h1>
            <Crown className="h-16 w-16 text-red-600 ml-4" />
          </div>
          <p className="text-2xl text-gray-300 mb-8">
            戦国時代をテーマにしたNFTとMLMプラットフォーム
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            侍戦士NFTを購入し、紹介システムで収益を得る。足軽から将軍まで8段階のランクシステムで、あなたの戦国時代の冒険が始まります。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="samurai-card rounded-lg p-8 text-center">
            <Sword className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">NFTシステム</h3>
            <p className="text-gray-300">
              通常NFT（300-100,000 USDT）と特別NFT（100-8,000 USDT）の26種類。
              1人1枚限定で、日利最大1.0%の収益。
            </p>
          </div>

          <div className="samurai-card rounded-lg p-8 text-center">
            <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">MLMシステム</h3>
            <p className="text-gray-300">
              足軽から将軍まで8段階のランクシステム。
              投資額と紹介実績に応じてランクアップし、ボーナスを獲得。
            </p>
          </div>

          <div className="samurai-card rounded-lg p-8 text-center nft-glow">
            <Crown className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">週間報酬</h3>
            <p className="text-gray-300">
              エアドロップタスクを完了して週間報酬を獲得。
              紹介ツリーの成長に応じて追加ボーナス。
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="samurai-button text-white px-8 py-4 rounded-lg text-lg font-semibold"
            >
              ログイン
            </button>
            <button
              onClick={() => router.push('/register')}
              className="bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              新規登録
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
