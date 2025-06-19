import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: nftTypes, error } = await supabase
      .from('nft_types')
      .select('*')
      .eq('is_active', true)
      .eq('is_special', false)
      .order('price_usdt', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ nftTypes })
  } catch (error) {
    console.error('NFT fetch error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
