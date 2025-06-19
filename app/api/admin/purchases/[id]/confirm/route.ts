import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../../../lib/supabase'
import { processMLMBonuses } from '../../../../../../lib/reward-system'

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

    const { error: updateError } = await supabase
      .from('nft_purchases')
      .update({
        status: 'confirmed',
        payment_confirmed_at: new Date().toISOString()
      })
      .eq('id', purchaseId)

    if (updateError) {
      console.error('Error confirming purchase:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to confirm purchase' },
        { status: 500 }
      )
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        total_investment: purchase.price
      })
      .eq('id', purchase.user_id)

    if (profileError) {
      console.error('Error updating user investment:', profileError)
    }

    await processMLMBonuses(purchase.price, purchase.user_id)

    return NextResponse.json({
      success: true,
      message: 'Purchase confirmed successfully'
    })
  } catch (error) {
    console.error('Error confirming purchase:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
