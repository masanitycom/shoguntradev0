'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Sword } from 'lucide-react'

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen samurai-bg flex items-center justify-center">
      <div className="text-center px-4">
        <div className="flex justify-center items-center mb-8">
          <Sword className="h-12 w-12 text-green-500 mr-4" />
          <h1 className="text-5xl font-bold">
            <span className="text-white">SHOGUN </span>
            <span className="text-green-500">TRADE</span>
          </h1>
        </div>
        <p className="text-xl text-gray-300 mb-12">
          天下統一への道 - 最高の投資体験
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/register')}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
          >
            新規登録
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  )
}

