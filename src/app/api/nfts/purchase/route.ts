import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nftTypeId, userId } = body

    const { data: existingNft } = await supabase
      .from('user_nfts')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingNft) {
      return NextResponse.json(
        { error: '1人1枚のNFTのみ購入可能です' },
        { status: 400 }
      )
    }

    const { data: nftType, error: nftError } = await supabase
      .from('nft_types')
      .select('*')
      .eq('id', nftTypeId)
      .single()

    if (nftError || !nftType) {
      return NextResponse.json(
        { error: 'NFTタイプが見つかりません' },
        { status: 404 }
      )
    }

    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('user_nfts')
      .insert({
        user_id: userId,
        nft_type_id: nftTypeId,
        purchase_price: nftType.price_usdt,
        daily_earnings: nftType.price_usdt * nftType.daily_return_rate
      })
      .select()
      .single()

    if (purchaseError) {
      return NextResponse.json(
        { error: purchaseError.message },
        { status: 400 }
      )
    }

    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('total_investment')
      .eq('id', userId)
      .single()

    if (currentProfile) {
      await supabaseAdmin
        .from('profiles')
        .update({ 
          total_investment: (currentProfile.total_investment || 0) + nftType.price_usdt
        })
        .eq('id', userId)
    }

    return NextResponse.json({
      message: 'NFT購入が完了しました',
      purchase
    })
  } catch (error) {
    console.error('NFT purchase error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
