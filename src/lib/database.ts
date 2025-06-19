import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  usdt_address?: string
  wallet_type?: string
  referrer_id?: string
  user_id?: string
  role?: string
  password?: string
  created_at: string
  updated_at: string
}

export interface NFTType {
  id: number
  name: string
  description: string
  price_usdt: number
  daily_return_rate: number
  category: string
  image_url: string
  is_special: boolean
  created_at: string
  updated_at: string
}

export interface UserNFT {
  id: number
  user_id: string
  nft_type_id: number
  purchase_price: number
  purchase_date: string
  total_earned: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MLMLevel {
  id: number
  name: string
  name_english: string
  required_investment: number
  max_line_requirement: number
  other_lines_requirement: number
  distribution_rate: number
  bonus_rate?: number
  created_at: string
  updated_at: string
}

export interface RewardClaim {
  id: number
  user_id: string
  user_nft_id: number
  week_start: string
  week_end: string
  daily_rewards: number
  total_reward: number
  claim_type: 'payout' | 'compound'
  status: 'pending' | 'approved' | 'rejected'
  survey_satisfaction?: number
  survey_recommendation?: number
  created_at: string
  updated_at: string
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function getNFTTypes(includeSpecial: boolean = false): Promise<NFTType[]> {
  let query = supabase.from('nft_types').select('*')
  
  if (!includeSpecial) {
    query = query.eq('is_special', false)
  }

  const { data, error } = await query.order('price_usdt', { ascending: true })

  if (error) {
    console.error('Error fetching NFT types:', error)
    return []
  }

  return data || []
}

export async function getUserNFTs(userId: string): Promise<UserNFT[]> {
  const { data, error } = await supabase
    .from('user_nfts')
    .select(`
      *,
      nft_types (*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching user NFTs:', error)
    return []
  }

  return data || []
}

export async function getMLMLevels(): Promise<MLMLevel[]> {
  const { data, error } = await supabase
    .from('mlm_levels')
    .select('*')
    .order('required_investment', { ascending: true })

  if (error) {
    console.error('Error fetching MLM levels:', error)
    return []
  }

  return data || []
}

export async function createRewardClaim(claim: Omit<RewardClaim, 'id' | 'created_at' | 'updated_at'>): Promise<RewardClaim | null> {
  const { data, error } = await supabase
    .from('reward_claims')
    .insert(claim)
    .select()
    .single()

  if (error) {
    console.error('Error creating reward claim:', error)
    return null
  }

  return data
}

export async function getReferralStats(userId: string) {
  const { data: directReferrals, error: directError } = await supabase
    .from('profiles')
    .select('id, name, created_at')
    .eq('referrer_id', userId)

  if (directError) {
    console.error('Error fetching direct referrals:', directError)
    return { directCount: 0, indirectCount: 0, totalEarnings: 0 }
  }

  let indirectCount = 0
  for (const referral of directReferrals || []) {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', referral.id)
    
    indirectCount += count || 0
  }

  return {
    directCount: directReferrals?.length || 0,
    indirectCount,
    totalEarnings: 0 // Would calculate from reward_claims table
  }
}

export const nftQueries = {
  getAllNFTs: getNFTTypes,
  getUserNFTs,
  createUserNFT: async (userNFT: Omit<UserNFT, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('user_nfts')
      .insert(userNFT)
      .select()
      .single()

    if (error) {
      console.error('Error creating user NFT:', error)
      return null
    }

    return data
  },
  updateDeliveryStatus: async (purchaseId: string, status: string): Promise<{ success: boolean; purchase?: any; error?: string }> => {
    const { data, error } = await supabase
      .from('user_nfts')
      .update({ delivery_status: status })
      .eq('id', purchaseId)
      .select()
      .single()

    if (error) {
      console.error('Error updating delivery status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, purchase: data }
  },
  getAllPurchases: async (): Promise<{ success: boolean; purchases?: any[]; error?: string }> => {
    const { data, error } = await supabase
      .from('user_nfts')
      .select(`
        *,
        profiles!user_id(name, email),
        nft_types!nft_type_id(name, price_usdt)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all purchases:', error)
      return { success: false, error: error.message }
    }

    return { success: true, purchases: data }
  }
}

export const userQueries = {
  getUserById,
  createUser: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(user)
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return data
  },
  updateUser: async (id: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return data
  },
  authenticateUser: async (identifier: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.eq.${identifier},phone.eq.${identifier}`)
        .single()

      if (error || !data) {
        return { success: false, error: 'ユーザーが見つかりません' }
      }

      return { success: true, user: data }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { success: false, error: 'サーバーエラーが発生しました' }
    }
  }
}

export const rewardQueries = {
  createRewardClaim,
  getRewardClaims: async (userId?: string) => {
    let query = supabase.from('reward_claims').select('*')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reward claims:', error)
      return []
    }

    return data || []
  },
  updateRewardClaim: async (id: number, updates: Partial<RewardClaim>) => {
    const { data, error } = await supabase
      .from('reward_claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating reward claim:', error)
      return null
    }

    return data
  },
  calculateRewards: async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const { data: userNfts, error: nftError } = await supabase
        .from('user_nfts')
        .select(`
          *,
          profiles!user_id(name, email),
          nft_types!nft_type_id(name, price_usdt, daily_return_rate)
        `)
        .eq('is_active', true)
        .filter('total_earned', 'lt', 'purchase_price * 3') // Less than 300% return

      if (nftError) {
        console.error('Error fetching user NFTs:', nftError)
        return { success: false, error: nftError.message }
      }

      const rewardCalculations = userNfts?.map(async (userNft: any) => {
        const dailyReward = userNft.purchase_price * (userNft.nft_types.daily_return_rate / 100)
        const maxEarnings = userNft.purchase_price * 3 // 300% limit
        const newTotalEarned = userNft.total_earned + dailyReward

        const finalEarnings = Math.min(newTotalEarned, maxEarnings)
        const actualReward = finalEarnings - userNft.total_earned

        if (actualReward > 0) {
          await supabase
            .from('user_nfts')
            .update({ 
              total_earned: finalEarnings,
              is_active: finalEarnings < maxEarnings // Deactivate if 300% reached
            })
            .eq('id', userNft.id)

          await supabase
            .from('reward_claims')
            .insert({
              user_id: userNft.user_id,
              user_nft_id: userNft.id,
              reward_amount: actualReward,
              claim_type: 'daily_reward',
              status: 'pending'
            })
        }

        return { userNftId: userNft.id, reward: actualReward }
      }) || []

      await Promise.all(rewardCalculations)

      return { 
        success: true, 
        message: `報酬計算が完了しました。${userNfts?.length || 0}件のNFTを処理しました。` 
      }
    } catch (error) {
      console.error('Error calculating rewards:', error)
      return { success: false, error: 'サーバーエラーが発生しました' }
    }
  }
}

export const mlmQueries = {
  getMLMLevels,
  getReferralStats,
  getReferralTree: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, created_at, referrer_id')
      .eq('referrer_id', userId)

    if (error) {
      console.error('Error fetching referral tree:', error)
      return []
    }

    return data || []
  }
}
