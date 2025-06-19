import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const now = new Date()
    const dayOfWeek = now.getDay()
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({
        canApply: false,
        message: 'エアドロップタスクは平日（月～金）のみ申請可能です'
      })
    }

    const { data: userNft } = await supabase
      .from('user_nfts')
      .select(`
        *,
        nft_types (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!userNft) {
      return NextResponse.json({
        canApply: false,
        message: 'アクティブなNFTがありません'
      })
    }

    const operationStart = new Date(userNft.operation_start_date)
    const weeksSinceStart = Math.floor((now.getTime() - operationStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
    
    if (weeksSinceStart < 1) {
      return NextResponse.json({
        canApply: false,
        message: '運用開始から1週間経過後に申請可能です'
      })
    }

    const dailyReturn = userNft.purchase_price * userNft.nft_types.daily_return_rate
    const weeklyReward = dailyReturn * 5

    return NextResponse.json({
      canApply: true,
      weeklyReward,
      nftInfo: {
        name: userNft.nft_types.name,
        purchasePrice: userNft.purchase_price,
        totalEarnings: userNft.total_earnings,
        maxEarnings: userNft.max_earnings
      }
    })
  } catch (error) {
    console.error('Airdrop check error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { rewardType, surveyAnswers } = await request.json()

    if (rewardType === 'payout' && !surveyAnswers) {
      return NextResponse.json(
        { error: 'アンケート回答が必要です' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_type')
      .eq('id', user.id)
      .single()

    const feeRate = profile?.wallet_type === 'EVOカード' ? 0.055 : 0.08

    return NextResponse.json({
      message: 'エアドロップタスクを申請しました',
      feeRate,
      rewardType
    })
  } catch (error) {
    console.error('Airdrop application error:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
