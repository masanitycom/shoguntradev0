import { supabase } from "./supabase"
import { MLM_RANKS, calculateUserRank } from './mlm-system'

export interface DailyReward {
  userId: string
  nftId: string
  amount: number
  date: string
  claimed: boolean
}

export interface WeeklyReward {
  userId: string
  amount: number
  week: string
  claimed: boolean
  compoundSelected: boolean
}

export async function calculateDailyRewards(userId: string): Promise<DailyReward[]> {
  const { data: userNFTs, error } = await supabase
    .from('nft_purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error || !userNFTs) {
    throw new Error('Failed to fetch user NFTs')
  }

  const rewards: DailyReward[] = []
  const today = new Date().toISOString().split('T')[0]

  for (const nft of userNFTs) {
    const dailyReturn = nft.price * (nft.daily_return_rate / 100)
    
    rewards.push({
      userId,
      nftId: nft.id,
      amount: dailyReturn,
      date: today,
      claimed: false
    })
  }

  return rewards
}

export async function calculateWeeklyRewards(userId: string): Promise<number> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw new Error('Failed to fetch user profile')
  }

  const { data: referralStats } = await supabase
    .from('profiles')
    .select('total_investment')
    .eq('referred_by', userId)

  const directVolume = referralStats?.reduce((sum: number, ref: any) => sum + (ref.total_investment || 0), 0) || 0
  const userRank = calculateUserRank(referralStats?.length || 0, directVolume)
  
  return directVolume * userRank.bonusPercentage
}

export async function processMLMBonuses(purchaseAmount: number, buyerId: string): Promise<void> {
  const { data: buyer, error } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', buyerId)
    .single()

  if (error || !buyer?.referred_by) {
    return
  }

  let currentReferrerId = buyer.referred_by
  let level = 1

  while (currentReferrerId && level <= 8) {
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentReferrerId)
      .single()

    if (referrerError || !referrer) {
      break
    }

    const { data: referralStats } = await supabase
      .from('profiles')
      .select('total_investment')
      .eq('referred_by', currentReferrerId)

    const directVolume = referralStats?.reduce((sum: number, ref: any) => sum + (ref.total_investment || 0), 0) || 0
    const userRank = calculateUserRank(referralStats?.length || 0, directVolume)
    
    if (userRank.level >= level) {
      const bonusAmount = purchaseAmount * (userRank.bonusPercentage / level)
      
      await supabase
        .from('profiles')
        .update({ 
          total_rewards: (referrer.total_rewards || 0) + bonusAmount 
        })
        .eq('id', currentReferrerId)

      await supabase
        .from('reward_transactions')
        .insert({
          user_id: currentReferrerId,
          amount: bonusAmount,
          type: 'mlm_bonus',
          level: level,
          from_user_id: buyerId,
          created_at: new Date().toISOString()
        })
    }

    currentReferrerId = referrer.referred_by
    level++
  }
}

export async function calculateTenkaBonus(userId: string): Promise<number> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return 0
  }

  if (profile.rank !== '将軍') {
    return 0
  }

  const { data: allUsers, error: usersError } = await supabase
    .from('profiles')
    .select('total_investment')

  if (usersError || !allUsers) {
    return 0
  }

  const totalPlatformVolume = allUsers.reduce((sum: number, user: any) => sum + (user.total_investment || 0), 0)
  return totalPlatformVolume * 0.01
}
