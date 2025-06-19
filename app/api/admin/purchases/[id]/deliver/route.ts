import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchaseId = params.id

    const { data: purchase, error: fetchError } = await supabase
      .from('nft_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (fetchError || !purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase not found' },
        { status: 404 }
      )
    }

    if (purchase.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Purchase must be confirmed before delivery' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('nft_purchases')
      .update({
        status: 'delivered',
        nft_delivered_at: new Date().toISOString()
      })
      .eq('id', purchaseId)

    if (updateError) {
      console.error('Error delivering NFT:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to mark NFT as delivered' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'NFT marked as delivered successfully'
    })
  } catch (error) {
    console.error('Error delivering NFT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
