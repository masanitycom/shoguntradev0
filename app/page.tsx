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
      <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          animation: 'spin 1s linear infinite', 
          borderRadius: '50%', 
          height: '128px', 
          width: '128px', 
          borderBottom: '2px solid #10b981' 
        }}></div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '32px' }}>
          <Sword style={{ height: '48px', width: '48px', color: '#34d399', marginRight: '16px' }} />
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0 }}>
            <span style={{ color: '#ffffff' }}>SHOGUN </span>
            <span style={{ color: '#34d399' }}>TRADE</span>
          </h1>
        </div>
        <p style={{ fontSize: '20px', color: '#d1d5db', marginBottom: '48px' }}>
          天下統一への道 - 最高の投資体験
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/register')}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
          >
            新規登録
          </button>
          <button
            onClick={() => router.push('/login')}
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #059669',
              color: '#34d399',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
              (e.target as HTMLButtonElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.target as HTMLButtonElement).style.color = '#34d399';
            }}
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  )
}

