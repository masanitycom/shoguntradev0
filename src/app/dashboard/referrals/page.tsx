'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Users, Link as LinkIcon, QrCode, Copy } from 'lucide-react'

interface ReferralStats {
  directReferrals: number
  indirectReferrals: number
  totalEarnings: number
  referralLink: string
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats>({
    directReferrals: 0,
    indirectReferrals: 0,
    totalEarnings: 0,
    referralLink: ''
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', user.id)
          .single()

        if (profile) {
          const referralLink = `${window.location.origin}/register?ref=${profile.user_id}`
          
          setStats({
            directReferrals: 12,
            indirectReferrals: 45,
            totalEarnings: 1250,
            referralLink
          })
        }
      } catch (error) {
        console.error('Referral data fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [router])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const generateQRCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(stats.referralLink)}`
    return qrCodeUrl
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
      <header className="samurai-card border-b border-red-600/30">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Users className="h-8 w-8 text-red-600 mr-3" />
            紹介管理
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-gray-400 text-sm">間接紹介</p>
                <p className="text-2xl font-bold text-white">{stats.indirectReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">紹介収益</p>
                <p className="text-2xl font-bold text-white">${stats.totalEarnings}</p>
              </div>
              <LinkIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="samurai-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <LinkIcon className="h-6 w-6 text-red-600 mr-2" />
              紹介リンク
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  あなたの紹介リンク
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={stats.referralLink}
                    readOnly
                    className="samurai-input flex-1 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="samurai-button px-4 py-3 rounded-r-lg flex items-center"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-2">コピーしました！</p>
                )}
              </div>

              <div className="p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">紹介方法</h3>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• 上記のリンクを友人に共有</li>
                  <li>• SNSやメッセージアプリで拡散</li>
                  <li>• QRコードを印刷して配布</li>
                  <li>• 紹介者が登録すると報酬獲得</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="samurai-card rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <QrCode className="h-6 w-6 text-red-600 mr-2" />
              QRコード
            </h2>
            
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg mb-4">
                <img
                  src={generateQRCode()}
                  alt="紹介QRコード"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-gray-400 text-sm">
                このQRコードをスキャンして登録
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 samurai-card rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">紹介関係ツリー</h2>
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              紹介ツリーは開発中です。<br/>
              リソース負荷を考慮した効率的な表示方法を実装予定です。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
