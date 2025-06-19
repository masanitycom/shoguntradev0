import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data: specialNfts, error } = await supabaseAdmin
      .from('nft_types')
      .select('*')
      .eq('is_active', true)
      .eq('is_special', true)
      .order('price_usdt', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ specialNfts })
  } catch (error) {
    console.error('Special NFT fetch error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
