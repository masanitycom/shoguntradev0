import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    const { data: userNft } = await supabase
      .from('user_nfts')
      .select(`
        *,
        nft_types (*)
      `)
      .eq('user_id', userId)
      .single()

    const { data: mlmLevel } = await supabase
      .from('mlm_levels')
      .select('*')
      .eq('level', profile.mlm_level)
      .single()

    return NextResponse.json({
      profile,
      userNft,
      mlmLevel
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
