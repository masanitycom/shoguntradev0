export interface NFTType {
  id: string
  name: string
  price: number
  dailyReturnRate: number
  isSpecial: boolean
  category: 'standard' | 'special'
  imageUrl?: string
  description?: string
}

export const STANDARD_NFTS: NFTType[] = [
  { id: 'nft-300', name: 'SHOGUN NFT300', price: 300, dailyReturnRate: 0.5, isSpecial: false, category: 'standard', description: '300 USDT投資、日利0.5%' },
  { id: 'nft-500', name: 'SHOGUN NFT500', price: 500, dailyReturnRate: 0.5, isSpecial: false, category: 'standard', description: '500 USDT投資、日利0.5%' },
  { id: 'nft-1000', name: 'SHOGUN NFT1000', price: 1000, dailyReturnRate: 1.25, isSpecial: false, category: 'standard', description: '1,000 USDT投資、日利1.25%（特別対応）' },
  { id: 'nft-3000', name: 'SHOGUN NFT3000', price: 3000, dailyReturnRate: 1.0, isSpecial: false, category: 'standard', description: '3,000 USDT投資、日利1.0%' },
  { id: 'nft-5000', name: 'SHOGUN NFT5000', price: 5000, dailyReturnRate: 1.0, isSpecial: false, category: 'standard', description: '5,000 USDT投資、日利1.0%' },
  { id: 'nft-10000', name: 'SHOGUN NFT10000', price: 10000, dailyReturnRate: 1.25, isSpecial: false, category: 'standard', description: '10,000 USDT投資、日利1.25%' },
  { id: 'nft-30000', name: 'SHOGUN NFT30000', price: 30000, dailyReturnRate: 1.5, isSpecial: false, category: 'standard', description: '30,000 USDT投資、日利1.5%' },
  { id: 'nft-100000', name: 'SHOGUN NFT100000', price: 100000, dailyReturnRate: 2.0, isSpecial: false, category: 'standard', description: '100,000 USDT投資、日利2.0%' }
]

export const SPECIAL_NFTS: NFTType[] = [
  { id: 'nft-100', name: 'SHOGUN NFT100', price: 100, dailyReturnRate: 0.5, isSpecial: true, category: 'special', description: '特例NFT 100 USDT、日利0.5%' },
  { id: 'nft-200', name: 'SHOGUN NFT200', price: 200, dailyReturnRate: 0.5, isSpecial: true, category: 'special', description: '特例NFT 200 USDT、日利0.5%' },
  { id: 'nft-600', name: 'SHOGUN NFT600', price: 600, dailyReturnRate: 0.5, isSpecial: true, category: 'special', description: '特例NFT 600 USDT、日利0.5%' },
  { id: 'nft-1177', name: 'SHOGUN NFT1177', price: 1177, dailyReturnRate: 1.0, isSpecial: true, category: 'special', description: '特例NFT 1,177 USDT、日利1.0%' },
  { id: 'nft-1300', name: 'SHOGUN NFT1300', price: 1300, dailyReturnRate: 1.0, isSpecial: true, category: 'special', description: '特例NFT 1,300 USDT、日利1.0%' },
  { id: 'nft-1500', name: 'SHOGUN NFT1500', price: 1500, dailyReturnRate: 1.0, isSpecial: true, category: 'special', description: '特例NFT 1,500 USDT、日利1.0%' },
  { id: 'nft-2000', name: 'SHOGUN NFT2000', price: 2000, dailyReturnRate: 1.0, isSpecial: true, category: 'special', description: '特例NFT 2,000 USDT、日利1.0%' },
  { id: 'nft-6600', name: 'SHOGUN NFT6600', price: 6600, dailyReturnRate: 1.25, isSpecial: true, category: 'special', description: '特例NFT 6,600 USDT、日利1.25%' },
  { id: 'nft-8000', name: 'SHOGUN NFT8000', price: 8000, dailyReturnRate: 1.25, isSpecial: true, category: 'special', description: '特例NFT 8,000 USDT、日利1.25%' }
]

export const ALL_NFTS: NFTType[] = [...STANDARD_NFTS, ...SPECIAL_NFTS]

export function getNFTById(id: string): NFTType | undefined {
  return ALL_NFTS.find(nft => nft.id === id)
}

export function calculateDailyReturn(nft: NFTType): number {
  return nft.price * (nft.dailyReturnRate / 100)
}

export function calculateMaxRewards(nft: NFTType): number {
  return nft.price * 3
}

export function calculateMaxReward(nftPrice: number): number {
  return nftPrice * 3
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP').format(price)
}

export function getNFTsByCategory(category: 'standard' | 'special'): NFTType[] {
  return ALL_NFTS.filter(nft => nft.category === category)
}

export function isNFTExpired(totalRewards: number, nftPrice: number): boolean {
  return totalRewards >= calculateMaxReward(nftPrice)
}

export function getDailyReturnRate(price: number, isSpecial: boolean = false): number {
  if (isSpecial) {
    if (price >= 100 && price <= 600) return 0.5
    if (price >= 1001 && price <= 5000) return 1.0
    if (price === 1000) return 1.25
    if (price >= 6600) return 1.25
    if (price >= 8000) return 1.25
  } else {
    if (price <= 500) return 0.5
    if (price >= 1000 && price <= 5000) return 1.0
    if (price === 10000) return 1.25
    if (price === 30000) return 1.5
    if (price === 100000) return 2.0
  }
  return 0.5
}
