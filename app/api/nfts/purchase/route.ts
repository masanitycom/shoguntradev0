import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { getNFTById } from '../../../../lib/nft-system'

export async function POST(request: NextRequest) {
  try {
    const { nftId, userId } = await request.json()

    if (!nftId || !userId) {
      return NextResponse.json(
        { success: false, error: 'NFT ID and User ID are required' },
        { status: 400 }
      )
    }

    const nft = getNFTById(nftId)
    if (!nft) {
      return NextResponse.json(
        { success: false, error: 'NFT not found' },
        { status: 404 }
      )
    }

    const { data: existingPurchase } = await supabase
      .from('nft_purchases')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingPurchase) {
      return NextResponse.json(
        { success: false, error: 'User already owns an NFT' },
        { status: 400 }
      )
    }

    const maxRewards = nft.price * 3

    const { data: purchase, error } = await supabase
      .from('nft_purchases')
      .insert({
        user_id: userId,
        nft_type_id: nft.id,
        price: nft.price,
        daily_return_rate: nft.dailyReturnRate,
        max_rewards: maxRewards,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating NFT purchase:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create purchase' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      purchase
    })
  } catch (error) {
    console.error('Error processing NFT purchase:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

