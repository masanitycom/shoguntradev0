'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Gift, AlertCircle } from 'lucide-react'

interface AirdropInfo {
  canApply: boolean
  message?: string
  weeklyReward?: number
  nftInfo?: {
    name: string
    purchasePrice: number
    totalEarnings: number
    maxEarnings: number
  }
}

export default function RewardsPage() {
  const [airdropInfo, setAirdropInfo] = useState<AirdropInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [surveyAnswers, setSurveyAnswers] = useState({
    satisfaction: '',
    recommendation: '',
    feedback: ''
  })
  const router = useRouter()

  useEffect(() => {
    const checkAirdropStatus = async () => {
      try {
        const response = await fetch('/api/rewards/airdrop')
        const data = await response.json()
        setAirdropInfo(data)
      } catch (error) {
        console.error('Airdrop status check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAirdropStatus()
  }, [])

  const handleAirdropApplication = async (rewardType: 'payout' | 'compound') => {
    setApplying(true)
    try {
      const response = await fetch('/api/rewards/airdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardType,
          surveyAnswers: rewardType === 'payout' ? surveyAnswers : null
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`${rewardType === 'payout' ? '報酬受取' : '複利運用'}を申請しました`)
        router.push('/dashboard')
      } else {
        alert(data.error || 'エラーが発生しました')
      }
    } catch (error) {
      console.error('Airdrop application error:', error)
      alert('エラーが発生しました')
    } finally {
      setApplying(false)
    }
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
            <TrendingUp className="h-8 w-8 text-red-600 mr-3" />
            週間報酬・エアドロップタスク
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!airdropInfo?.canApply ? (
          <div className="samurai-card rounded-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">エアドロップタスク</h2>
            <p className="text-gray-300 text-lg">
              {airdropInfo?.message || 'エアドロップタスクの情報を取得中...'}
            </p>
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ※ エアドロップタスクは平日（月～金）のみ申請可能です<br/>
                ※ NFT購入から1週間の待機期間後、運用開始となります
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="samurai-card rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Gift className="h-8 w-8 text-red-600 mr-3" />
                週間報酬申請
              </h2>
              
              {airdropInfo.nftInfo && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">NFT情報</h3>
                    <p className="text-gray-300">名前: {airdropInfo.nftInfo.name}</p>
                    <p className="text-gray-300">投資額: ${airdropInfo.nftInfo.purchasePrice.toLocaleString()}</p>
                    <p className="text-gray-300">累計収益: ${airdropInfo.nftInfo.totalEarnings.toLocaleString()}</p>
                    <p className="text-gray-300">最大収益: ${airdropInfo.nftInfo.maxEarnings.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">今週の報酬</h3>
                    <p className="text-2xl font-bold text-red-600">
                      ${airdropInfo.weeklyReward?.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      平日5日分の日利報酬
                    </p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="samurai-card rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">報酬受取（エアドロップ）</h3>
                  <p className="text-gray-300 mb-4">
                    アンケート回答必須<br/>
                    手数料: 8%（EVOカード: 5.5%）<br/>
                    USDT支払い
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        サービス満足度
                      </label>
                      <select
                        value={surveyAnswers.satisfaction}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, satisfaction: e.target.value }))}
                        className="samurai-input w-full px-3 py-2 rounded"
                      >
                        <option value="">選択してください</option>
                        <option value="very_satisfied">非常に満足</option>
                        <option value="satisfied">満足</option>
                        <option value="neutral">普通</option>
                        <option value="dissatisfied">不満</option>
                        <option value="very_dissatisfied">非常に不満</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        推奨度
                      </label>
                      <select
                        value={surveyAnswers.recommendation}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, recommendation: e.target.value }))}
                        className="samurai-input w-full px-3 py-2 rounded"
                      >
                        <option value="">選択してください</option>
                        <option value="definitely">絶対に推奨</option>
                        <option value="probably">おそらく推奨</option>
                        <option value="maybe">どちらでもない</option>
                        <option value="probably_not">おそらく推奨しない</option>
                        <option value="definitely_not">絶対に推奨しない</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        フィードバック
                      </label>
                      <textarea
                        value={surveyAnswers.feedback}
                        onChange={(e) => setSurveyAnswers(prev => ({ ...prev, feedback: e.target.value }))}
                        className="samurai-input w-full px-3 py-2 rounded h-20"
                        placeholder="ご意見・ご要望をお聞かせください"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleAirdropApplication('payout')}
                    disabled={applying || !surveyAnswers.satisfaction || !surveyAnswers.recommendation}
                    className="samurai-button w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? '申請中...' : '報酬受取を申請'}
                  </button>
                </div>

                <div className="samurai-card rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">複利運用</h3>
                  <p className="text-gray-300 mb-4">
                    アンケートスキップ<br/>
                    報酬を投資額に加算<br/>
                    新しい合計額で日利計算
                  </p>
                  
                  <button
                    onClick={() => handleAirdropApplication('compound')}
                    disabled={applying}
                    className="samurai-button w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? '申請中...' : '複利運用を申請'}
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">週次報酬プロセス</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• 月～金：日利積立</li>
                  <li>• 翌週月～金：報酬申請（エアドロタスク）期間</li>
                  <li>• 翌週月曜：報酬支払い</li>
                  <li>• 土日はエアドロタスクボタンは押せません</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
