import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      nameKana,
      userId,
      usdtAddress,
      walletType,
      referrerId
    } = body

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'このユーザーIDは既に使用されています' },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name: name,
          full_name_kana: nameKana,
          user_id: userId,
          usdt_address: usdtAddress,
          wallet_type: walletType,
          referrer_id: referrerId
        })

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 400 }
        )
      }

      if (referrerId) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', referrerId)
          .single()

        if (referrer) {
          await supabase
            .from('referral_tree')
            .insert({
              user_id: authData.user.id,
              referrer_id: referrer.id,
              level: 1
            })

          const { data: currentReferrer } = await supabase
            .from('profiles')
            .select('direct_referrals, total_referrals')
            .eq('id', referrer.id)
            .single()

          if (currentReferrer) {
            await supabase
              .from('profiles')
              .update({ 
                direct_referrals: (currentReferrer.direct_referrals || 0) + 1,
                total_referrals: (currentReferrer.total_referrals || 0) + 1
              })
              .eq('id', referrer.id)
          }
        }
      }

      return NextResponse.json({
        message: '登録が完了しました',
        user: authData.user
      })
    }

    return NextResponse.json(
      { error: '登録に失敗しました' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
