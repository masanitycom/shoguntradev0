export interface MLMRank {
  name: string
  level: number
  minDirectReferrals: number
  minTeamVolume: number
  bonusPercentage: number
}

export const MLM_RANKS: MLMRank[] = [
  { name: '足軽', level: 1, minDirectReferrals: 0, minTeamVolume: 0, bonusPercentage: 0.05 },
  { name: '侍', level: 2, minDirectReferrals: 3, minTeamVolume: 1000, bonusPercentage: 0.08 },
  { name: '武士', level: 3, minDirectReferrals: 5, minTeamVolume: 5000, bonusPercentage: 0.12 },
  { name: '騎馬武者', level: 4, minDirectReferrals: 8, minTeamVolume: 15000, bonusPercentage: 0.15 },
  { name: '旗本', level: 5, minDirectReferrals: 12, minTeamVolume: 35000, bonusPercentage: 0.18 },
  { name: '大名', level: 6, minDirectReferrals: 20, minTeamVolume: 75000, bonusPercentage: 0.22 },
  { name: '大将', level: 7, minDirectReferrals: 30, minTeamVolume: 150000, bonusPercentage: 0.25 },
  { name: '将軍', level: 8, minDirectReferrals: 50, minTeamVolume: 300000, bonusPercentage: 0.30 }
]

export function calculateUserRank(directReferrals: number, teamVolume: number): MLMRank {
  let currentRank = MLM_RANKS[0]
  
  for (const rank of MLM_RANKS) {
    if (directReferrals >= rank.minDirectReferrals && teamVolume >= rank.minTeamVolume) {
      currentRank = rank
    } else {
      break
    }
  }
  
  return currentRank
}

export function calculateReferralBonus(amount: number, referrerLevel: number): number {
  const rank = MLM_RANKS.find(r => r.level === referrerLevel) || MLM_RANKS[0]
  return amount * rank.bonusPercentage
}

export function calculateTeamVolume(userPurchases: number[], referralPurchases: number[][]): number {
  const directVolume = userPurchases.reduce((sum, amount) => sum + amount, 0)
  const teamVolume = referralPurchases.flat().reduce((sum, amount) => sum + amount, 0)
  return directVolume + teamVolume
}
