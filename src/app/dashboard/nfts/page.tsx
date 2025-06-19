'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Gift, ShoppingCart, AlertCircle } from 'lucide-react'

interface NFTType {
  id: number
  name: string
  description: string
  price_usdt: number
  daily_return_rate: number
  category: string
  image_url: string
  is_special: boolean
}

export default function NFTsPage() {
  const [nftTypes, setNftTypes] = useState<NFTType[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [userHasNft, setUserHasNft] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data: existingNft } = await supabase
          .from('user_nfts')
          .select('id')
          .eq('user_id', user.id)
          .single()

        setUserHasNft(!!existingNft)

        const response = await fetch('/api/nfts')
        const data = await response.json()
        
        if (data.nftTypes) {
          setNftTypes(data.nftTypes)
        }
      } catch (error) {
        console.error('NFT fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [router])

  const handlePurchase = async (nftTypeId: number, price: number) => {
    if (userHasNft) {
      alert('既にNFTを保有しています。1人1枚まで購入可能です。')
      return
    }

    setPurchasing(nftTypeId)
    try {
      const response = await fetch('/api/nfts/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftTypeId,
          purchasePrice: price
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('NFT購入が完了しました！')
        setUserHasNft(true)
        router.push('/dashboard')
      } else {
        alert(data.error || '購入に失敗しました')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('購入に失敗しました')
    } finally {
      setPurchasing(null)
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
            <Gift className="h-8 w-8 text-red-600 mr-3" />
            SHOGUN NFT購入
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {userHasNft && (
          <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <p className="text-yellow-200">
                既にNFTを保有しています。1人1枚まで購入可能です。
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nftTypes.map((nft) => (
            <div key={nft.id} className="samurai-card rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-800 flex items-center justify-center">
                <Gift className="h-16 w-16 text-red-600" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{nft.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">価格:</span>
                    <span className="text-white font-semibold">${nft.price_usdt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">日利上限:</span>
                    <span className="text-red-400 font-semibold">{(nft.daily_return_rate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">最大収益:</span>
                    <span className="text-green-400 font-semibold">${(nft.price_usdt * 3).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(nft.id, nft.price_usdt)}
                  disabled={purchasing === nft.id || userHasNft}
                  className="samurai-button w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {purchasing === nft.id ? (
                    '購入中...'
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      購入
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 samurai-card rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">NFT投資ルール</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3">投資条件</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 1人1枚まで購入可能</li>
                <li>• 最大収益：投資額の300%まで</li>
                <li>• 300%達成後はNFTが機能停止</li>
                <li>• 日利は平日（月～金）のみ適用</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3">運用スケジュール</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 1週目：待機期間</li>
                <li>• 2週目：運用開始</li>
                <li>• 3週目：最初の報酬発生</li>
                <li>• 日本時間で計算</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
