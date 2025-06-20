import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js"
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

export async function GET() {
  try {
    console.log("=== ADMIN NFT API START ===")
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")
    
    console.log("Cookie store available:", !!cookieStore)
    console.log("Auth token found:", !!token)
    console.log("Token value length:", token?.value?.length || 0)

    if (!token) {
      console.log("No auth token found - returning 401")
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const { data: nfts, error } = await supabaseAdmin
      .from('nft_types')
      .select('*')
      .order('price_usdt', { ascending: true })

    if (error) {
      console.error('Error fetching NFTs:', error)
      return NextResponse.json({ success: false, message: "NFTの取得に失敗しました" }, { status: 500 })
    }

    const formattedNfts = (nfts || []).map(nft => ({
      id: nft.id.toString(),
      name: nft.name,
      price: nft.price_usdt,
      daily_rate: nft.daily_return_rate * 100,
      is_special: nft.is_special,
      is_active: nft.is_active !== false,
      image_url: nft.image_url || "/placeholder.svg"
    }))

    return NextResponse.json({ success: true, nfts: formattedNfts })
  } catch (error) {
    console.error("Error fetching admin NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "shogun-trade-jwt-secret-key") as any
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, message: "管理者権限が必要です" }, { status: 403 })
    }

    const { name, price, daily_rate, is_special, is_active, image_url } = await request.json()

    const { data: nft, error } = await supabaseAdmin
      .from('nft_types')
      .insert({
        name,
        price_usdt: price,
        daily_return_rate: daily_rate / 100,
        is_special,
        is_active,
        image_url: image_url || "/placeholder.svg"
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating NFT:', error)
      return NextResponse.json({ success: false, message: "NFTの作成に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true, nft })
  } catch (error) {
    console.error("Error creating NFT:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
