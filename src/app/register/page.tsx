'use client'

import React, { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nameKana: '',
    userId: '',
    phone: '',
    usdtAddress: '',
    walletType: 'EVOカード' as 'TRC20' | 'ERC20' | 'BEP20' | 'EVOカード' | 'その他'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralId = searchParams.get('ref')

  const kanaRegex = /^[ァ-ヶー\s]*$/

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      setLoading(false)
      return
    }

    if (formData.userId.length < 6) {
      setError('ユーザーIDは6文字以上で入力してください')
      setLoading(false)
      return
    }

    if (!kanaRegex.test(formData.nameKana)) {
      setError('名前（カナ）はカタカナで入力してください')
      setLoading(false)
      return
    }

    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', formData.userId)
        .single()

      if (existingUser) {
        setError('このユーザーIDは既に使用されています')
        setLoading(false)
        return
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            name_kana: formData.nameKana,
            user_id: formData.userId,
            phone: formData.phone,
            usdt_address: formData.usdtAddress,
            wallet_type: formData.walletType,
            referrer_id: referralId,
            role: 'user'
          })

        if (profileError) throw profileError

        router.push('/dashboard')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen samurai-bg flex items-center justify-center px-4 py-8">
      <div className="samurai-card rounded-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <UserPlus className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">新規登録</h1>
          <p className="text-gray-400">SHOGUN TRADEアカウントを作成</p>
          {referralId && (
            <p className="text-red-400 mt-2">紹介ID: {referralId}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="samurai-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="山田太郎"
                required
              />
            </div>

            <div>
              <label htmlFor="nameKana" className="block text-sm font-medium text-gray-300 mb-2">
                名前（カナ）
              </label>
              <input
                id="nameKana"
                name="nameKana"
                type="text"
                value={formData.nameKana}
                onChange={handleInputChange}
                className="samurai-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="ヤマダタロウ"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
                ユーザーID（半角英数字6文字以上）
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                value={formData.userId}
                onChange={handleInputChange}
                className="samurai-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="yamada123"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                電話番号（ハイフンなし）
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="samurai-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="09012345678"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="samurai-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="yamada@example.com"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="samurai-input w-full px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="8文字以上"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="samurai-input w-full px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="パスワードを再入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="usdtAddress" className="block text-sm font-medium text-gray-300 mb-2">
                USDTアドレス（BEP20）※任意
              </label>
              <input
                id="usdtAddress"
                name="usdtAddress"
                type="text"
                value={formData.usdtAddress}
                onChange={handleInputChange}
                className="samurai-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="ウォレットアドレス（任意）"
              />
            </div>

            <div>
              <label htmlFor="walletType" className="block text-sm font-medium text-gray-300 mb-2">
                ウォレットタイプ※任意
              </label>
              <select
                id="walletType"
                name="walletType"
                value={formData.walletType}
                onChange={handleInputChange}
                className="samurai-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="EVOカード">EVOカード</option>
                <option value="その他">その他</option>
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="samurai-button w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            既にアカウントをお持ちですか？{' '}
            <Link href="/login" className="text-red-600 hover:text-red-500 font-semibold">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
    </div>}>
      <RegisterForm />
    </Suspense>
  )
}
