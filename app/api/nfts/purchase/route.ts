import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js"
import { getNFTById } from '../../../../lib/nft-system'
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getNFTDatabaseId(nftId: string): number | null {
  const nftIdMap: { [key: string]: number } = {
    'nft-300': 1,
    'nft-500': 2,
    'nft-1000': 3,
    'nft-3000': 4,
    'nft-5000': 5,
    'nft-10000': 6,
    'nft-30000': 7,
    'nft-100000': 8,
    'nft-100': 9,
    'nft-200': 10,
    'nft-600': 11,
    'nft-1177': 12,
    'nft-1300': 13,
    'nft-1500': 14,
    'nft-2000': 15,
    'nft-6600': 16,
    'nft-8000': 17
  }
  return nftIdMap[nftId] || null
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    const userId = decoded.userId

    const { nftId } = await request.json()

    if (!nftId) {
      return NextResponse.json(
        { success: false, error: 'NFT ID is required' },
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

    const databaseNftId = getNFTDatabaseId(nftId)
    if (!databaseNftId) {
      return NextResponse.json(
        { success: false, error: 'Invalid NFT ID mapping' },
        { status: 400 }
      )
    }

    const { data: existingPurchase } = await supabaseAdmin
      .from('user_nfts')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingPurchase) {
      return NextResponse.json(
        { success: false, error: 'User already owns an NFT' },
        { status: 400 }
      )
    }

    const { data: purchase, error } = await supabaseAdmin
      .from('user_nfts')
      .insert({
        user_id: userId,
        nft_type_id: databaseNftId,
        purchase_price: nft.price
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

