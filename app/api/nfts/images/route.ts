import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const REGULAR_NFTS = [
  {
    id: "shogun-nft-300",
    name: "SHOGUN NFT 300",
    description: "300 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 300,
    daily_rate: 0.5,
    is_special: false
  },
  {
    id: "shogun-nft-500",
    name: "SHOGUN NFT 500",
    description: "500 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 500,
    daily_rate: 0.5,
    is_special: false
  },
  {
    id: "shogun-nft-1000",
    name: "SHOGUN NFT 1,000",
    description: "1,000 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 1000,
    daily_rate: 1.0,
    is_special: false
  },
  {
    id: "shogun-nft-3000",
    name: "SHOGUN NFT 3,000",
    description: "3,000 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 3000,
    daily_rate: 1.0,
    is_special: false
  },
  {
    id: "shogun-nft-5000",
    name: "SHOGUN NFT 5,000",
    description: "5,000 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 5000,
    daily_rate: 1.0,
    is_special: false
  },
  {
    id: "shogun-nft-10000",
    name: "SHOGUN NFT 10,000",
    description: "10,000 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 10000,
    daily_rate: 1.25,
    is_special: false
  },
  {
    id: "shogun-nft-30000",
    name: "SHOGUN NFT 30,000",
    description: "30,000 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 30000,
    daily_rate: 1.5,
    is_special: false
  },
  {
    id: "shogun-nft-100000",
    name: "SHOGUN NFT 100,000",
    description: "100,000 USDT投資NFT",
    image: "/images/nft/placeholder.svg",
    price: 100000,
    daily_rate: 2.0,
    is_special: false
  }
]

const SPECIAL_NFTS = [
  {
    id: "shogun-nft-100",
    name: "SHOGUN NFT 100",
    description: "100 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 100,
    daily_rate: 0.5,
    is_special: true
  },
  {
    id: "shogun-nft-200",
    name: "SHOGUN NFT 200",
    description: "200 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 200,
    daily_rate: 0.5,
    is_special: true
  },
  {
    id: "shogun-nft-600",
    name: "SHOGUN NFT 600",
    description: "600 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 600,
    daily_rate: 0.5,
    is_special: true
  },
  {
    id: "shogun-nft-1100",
    name: "SHOGUN NFT 1,100",
    description: "1,100 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1100,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1177",
    name: "SHOGUN NFT 1,177",
    description: "1,177 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1177,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1217",
    name: "SHOGUN NFT 1,217",
    description: "1,217 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1217,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1227",
    name: "SHOGUN NFT 1,227",
    description: "1,227 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1227,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1300",
    name: "SHOGUN NFT 1,300",
    description: "1,300 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1300,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1350",
    name: "SHOGUN NFT 1,350",
    description: "1,350 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1350,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1500",
    name: "SHOGUN NFT 1,500",
    description: "1,500 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1500,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1600",
    name: "SHOGUN NFT 1,600",
    description: "1,600 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1600,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-1836",
    name: "SHOGUN NFT 1,836",
    description: "1,836 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 1836,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-2000",
    name: "SHOGUN NFT 2,000",
    description: "2,000 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 2000,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-2100",
    name: "SHOGUN NFT 2,100",
    description: "2,100 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 2100,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-3175",
    name: "SHOGUN NFT 3,175",
    description: "3,175 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 3175,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-4000",
    name: "SHOGUN NFT 4,000",
    description: "4,000 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 4000,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-6600",
    name: "SHOGUN NFT 6,600",
    description: "6,600 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 6600,
    daily_rate: 1.0,
    is_special: true
  },
  {
    id: "shogun-nft-8000",
    name: "SHOGUN NFT 8,000",
    description: "8,000 USDT特別NFT",
    image: "/images/nft/placeholder.svg",
    price: 8000,
    daily_rate: 1.0,
    is_special: true
  }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeSpecial = searchParams.get("include_special") === "true"
  
  let nfts = REGULAR_NFTS
  
  if (includeSpecial) {
    nfts = [...REGULAR_NFTS, ...SPECIAL_NFTS]
  }
  
  return NextResponse.json({
    success: true,
    nfts: nfts
  })
}
