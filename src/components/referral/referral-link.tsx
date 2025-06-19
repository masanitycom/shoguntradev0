'use client'

import React, { useState, useEffect } from 'react'
import { Copy, Share2, QrCode } from 'lucide-react'
import QRCode from 'qrcode'

interface ReferralLinkProps {
  baseUrl?: string
}

function ReferralLink({ baseUrl = 'https://shoguntradev0.vercel.app' }: ReferralLinkProps) {
  const [userId, setUserId] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showQR, setShowQR] = useState(false)

  const referralLink = userId ? `${baseUrl}/register?ref=${userId}` : ''

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUserId(data.user?.id || '')
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error)
      }
    }

    fetchUserId()
  }, [])

  useEffect(() => {
    if (!userId) return

    const generateQR = async () => {
      try {
        const qrUrl = await QRCode.toDataURL(referralLink, {
          width: 256,
          margin: 2,
          color: {
            dark: '#DC2626',
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error('QR code generation failed:', error)
      }
    }

    generateQR()
  }, [referralLink, userId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SHOGUN TRADE 紹介リンク',
          text: 'SHOGUN TRADEに参加して、NFT投資を始めましょう！',
          url: referralLink
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="samurai-card rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Share2 className="h-6 w-6 text-red-600 mr-2" />
        紹介リンク
      </h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralLink || 'Loading...'}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="samurai-button px-4 py-2 rounded-md text-white flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>{copied ? 'コピー済み' : 'コピー'}</span>
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={shareLink}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white flex items-center justify-center space-x-2 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>シェア</span>
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white flex items-center space-x-2 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            <span>QR</span>
          </button>
        </div>

        {showQR && qrCodeUrl && (
          <div className="flex justify-center pt-4">
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCodeUrl} alt="紹介リンクQRコード" className="w-48 h-48" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2">紹介方法</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• SNSでリンクをシェア</li>
          <li>• QRコードを印刷して配布</li>
          <li>• 友人や家族に直接送信</li>
          <li>• ブログやウェブサイトに掲載</li>
        </ul>
      </div>
    </div>
  )
}

export default ReferralLink
export { ReferralLink }
