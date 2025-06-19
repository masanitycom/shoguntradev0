import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { userId, nftTypeId, assignedBy } = await request.json()

    if (!userId || !nftTypeId || !assignedBy) {
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    const { data: nftType, error: nftError } = await supabaseAdmin
      .from('nft_types')
      .select('*')
      .eq('id', nftTypeId)
      .eq('is_special', true)
      .single()

    if (nftError || !nftType) {
      return NextResponse.json(
        { error: '特別NFTが見つかりません' },
        { status: 404 }
      )
    }

    const { data: existingNft } = await supabaseAdmin
      .from('user_nfts')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingNft) {
      return NextResponse.json(
        { error: 'このユーザーは既にNFTを保有しています' },
        { status: 400 }
      )
    }

    const operationStartDate = new Date()
    operationStartDate.setDate(operationStartDate.getDate() + 7)

    const { data: userNft, error: insertError } = await supabaseAdmin
      .from('user_nfts')
      .insert({
        user_id: userId,
        nft_type_id: nftTypeId,
        purchase_price: nftType.price_usdt,
        operation_start_date: operationStartDate.toISOString(),
        max_earnings: nftType.price_usdt * 3,
        is_delivered: true,
        delivery_date: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: '特別NFTを正常に付与しました',
      userNft 
    })
  } catch (error) {
    console.error('Special NFT assignment error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
