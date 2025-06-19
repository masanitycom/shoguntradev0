import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name, user_id')
        .eq('id', data.user.id)
        .single()

      return NextResponse.json({
        message: 'ログインに成功しました',
        user: data.user,
        profile
      })
    }

    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
