import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const nftTypes = [
  { id: 1, name: 'SHOGUN NFT 300', description: '300 USDT投資NFT - 日利0.5%', price_usdt: 300, daily_return_rate: 0.005, category: 'regular', is_special: false },
  { id: 2, name: 'SHOGUN NFT 500', description: '500 USDT投資NFT - 日利0.6%', price_usdt: 500, daily_return_rate: 0.006, category: 'regular', is_special: false },
  { id: 3, name: 'SHOGUN NFT 1000', description: '1000 USDT投資NFT - 日利0.7%', price_usdt: 1000, daily_return_rate: 0.007, category: 'regular', is_special: false },
  { id: 4, name: 'SHOGUN NFT 3000', description: '3000 USDT投資NFT - 日利0.8%', price_usdt: 3000, daily_return_rate: 0.008, category: 'regular', is_special: false },
  { id: 5, name: 'SHOGUN NFT 5000', description: '5000 USDT投資NFT - 日利0.9%', price_usdt: 5000, daily_return_rate: 0.009, category: 'regular', is_special: false },
  { id: 6, name: 'SHOGUN NFT 10000', description: '10000 USDT投資NFT - 日利1.0%', price_usdt: 10000, daily_return_rate: 0.010, category: 'regular', is_special: false },
  { id: 7, name: 'SHOGUN NFT 50000', description: '50000 USDT投資NFT - 日利1.5%', price_usdt: 50000, daily_return_rate: 0.015, category: 'regular', is_special: false },
  { id: 8, name: 'SHOGUN NFT 100000', description: '100000 USDT投資NFT - 日利2.0%', price_usdt: 100000, daily_return_rate: 0.020, category: 'regular', is_special: false }
]

export async function GET() {
  try {
    const regularNfts = nftTypes.filter((nft) => !nft.is_special)

    return NextResponse.json({ success: true, nfts: regularNfts })
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

