import { NextResponse } from "next/server"

const MLM_LEVELS = [
  {
    level: 1,
    name: "足軽",
    minInvestment: 1000,
    maxSeries: 0,
    otherSeries: 0,
    organizationTotal: 1000,
    distributionRate: 45,
    bonusRate: 0,
    description: "SHOGUN NFT 1,000以上保有、組織全体で1,000 USDT以上"
  },
  {
    level: 2,
    name: "武将",
    minInvestment: 1000,
    maxSeries: 3000,
    otherSeries: 1500,
    organizationTotal: 4500,
    distributionRate: 25,
    bonusRate: 0,
    description: "SHOGUN NFT 1,000以上保有、最大系列3,000 USDT、他系列全体1,500 USDT"
  },
  {
    level: 3,
    name: "代官",
    minInvestment: 1000,
    maxSeries: 5000,
    otherSeries: 2500,
    organizationTotal: 7500,
    distributionRate: 10,
    bonusRate: 0,
    description: "SHOGUN NFT 1,000以上保有、最大系列5,000 USDT、他系列全体2,500 USDT"
  },
  {
    level: 4,
    name: "奉行",
    minInvestment: 1000,
    maxSeries: 10000,
    otherSeries: 5000,
    organizationTotal: 15000,
    distributionRate: 6,
    bonusRate: 0,
    description: "SHOGUN NFT 1,000以上保有、最大系列10,000 USDT、他系列全体5,000 USDT"
  },
  {
    level: 5,
    name: "老中",
    minInvestment: 1000,
    maxSeries: 50000,
    otherSeries: 25000,
    organizationTotal: 75000,
    distributionRate: 5,
    bonusRate: 0,
    description: "SHOGUN NFT 1,000以上保有、最大系列50,000 USDT、他系列全体25,000 USDT"
  },
  {
    level: 6,
    name: "大老",
    minInvestment: 1000,
    maxSeries: 100000,
    otherSeries: 50000,
    organizationTotal: 150000,
    distributionRate: 4,
    bonusRate: 22,
    description: "SHOGUN NFT 1,000以上保有、最大系列100,000 USDT、他系列全体50,000 USDT"
  },
  {
    level: 7,
    name: "大名",
    minInvestment: 1000,
    maxSeries: 300000,
    otherSeries: 150000,
    organizationTotal: 450000,
    distributionRate: 3,
    bonusRate: 25,
    description: "SHOGUN NFT 1,000以上保有、最大系列300,000 USDT、他系列全体150,000 USDT"
  },
  {
    level: 8,
    name: "将軍",
    minInvestment: 1000,
    maxSeries: 600000,
    otherSeries: 500000,
    organizationTotal: 1100000,
    distributionRate: 2,
    bonusRate: 30,
    description: "SHOGUN NFT 1,000以上保有、最大系列600,000 USDT、他系列全体500,000 USDT"
  }
]

export async function GET() {
  return NextResponse.json({
    success: true,
    levels: MLM_LEVELS
  })
}
