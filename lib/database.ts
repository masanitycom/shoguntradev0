import { supabase } from "./supabase"

// データベース接続テスト
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) throw error
    return { success: true, timestamp: new Date().toISOString() }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ユーザー関連のクエリ
export const userQueries = {
  // ユーザー登録
  createUser: async (userData: any) => {
    try {
      console.log('Creating user with data:', userData)
      const { data, error } = await supabase
        .from('profiles')
        .insert(userData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('User created successfully:', data)
      return { success: true, user: data }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error }
    }
  },

  // ユーザー認証
  authenticateUser: async (identifier: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},user_id.eq.${identifier}`)
        .single()

      if (error || !data) {
        return { success: false, error: 'ユーザーが見つかりません' }
      }

      return { success: true, user: data }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { success: false, error }
    }
  },

  // ユーザー情報取得
  getUserById: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      return { success: true, user: data }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { success: false, error }
    }
  },
}

// NFT関連のクエリ
export const nftQueries = {
  // NFT一覧取得
  getAllNfts: async () => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === '42P01') {
          return { success: true, nfts: [] }
        }
        throw error
      }

      return { success: true, nfts: data || [] }
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      return { success: false, error, nfts: [] }
    }
  },

  // ユーザーのNFT取得
  getUserNfts: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('nft_purchases')
        .select(`
          *,
          nfts (*)
        `)
        .eq('user_id', userId)

      if (error) {
        if (error.code === '42P01') {
          return { success: true, nfts: [] }
        }
        throw error
      }

      return { success: true, nfts: data || [] }
    } catch (error) {
      console.error('Error fetching user NFTs:', error)
      return { success: false, error, nfts: [] }
    }
  },

  // NFT購入
  purchaseNft: async (userId: string, nftId: string) => {
    try {
      const { data: existingPurchase } = await supabase
        .from('nft_purchases')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existingPurchase) {
        return { success: false, error: 'ユーザーは既にNFTを所有しています' }
      }

      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .select('*')
        .eq('id', nftId)
        .single()

      if (nftError || !nft) {
        return { success: false, error: 'NFTが見つかりません' }
      }

      if (!nft.is_active) {
        return { success: false, error: 'このNFTは現在購入できません' }
      }

      const { data, error } = await supabase
        .from('nft_purchases')
        .insert({
          user_id: userId,
          nft_id: nftId,
          purchase_price: nft.price,
          delivery_status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, purchase: data }
    } catch (error) {
      console.error('Error purchasing NFT:', error)
      return { success: false, error }
    }
  },

  getAllPurchases: async () => {
    try {
      const { data, error } = await supabase
        .from('nft_purchases')
        .select(`
          *,
          nfts (*),
          users (name, user_id, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, purchases: data || [] }
    } catch (error) {
      console.error('Error fetching purchases:', error)
      return { success: false, error, purchases: [] }
    }
  },

  updateDeliveryStatus: async (purchaseId: string, status: string) => {
    try {
      const updateData: any = {
        delivery_status: status,
        updated_at: new Date().toISOString()
      }

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('nft_purchases')
        .update(updateData)
        .eq('id', purchaseId)
        .select()
        .single()

      if (error) throw error

      return { success: true, purchase: data }
    } catch (error) {
      console.error('Error updating delivery status:', error)
      return { success: false, error }
    }
  },

  createNft: async (nftData: any) => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .insert(nftData)
        .select()
        .single()

      if (error) throw error

      return { success: true, nft: data }
    } catch (error) {
      console.error('Error creating NFT:', error)
      return { success: false, error }
    }
  },

  updateNft: async (nftId: string, nftData: any) => {
    try {
      const { data, error } = await supabase
        .from('nfts')
        .update({ ...nftData, updated_at: new Date().toISOString() })
        .eq('id', nftId)
        .select()
        .single()

      if (error) throw error

      return { success: true, nft: data }
    } catch (error) {
      console.error('Error updating NFT:', error)
      return { success: false, error }
    }
  },

  deleteNft: async (nftId: string) => {
    try {
      const { error } = await supabase
        .from('nfts')
        .delete()
        .eq('id', nftId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting NFT:', error)
      return { success: false, error }
    }
  },
}

// 報酬関連のクエリ
export const rewardQueries = {
  createRewardClaim: async (claim: {
    user_id: string;
    week_start: string;
    week_end: string;
    base_reward: number;
    referral_bonus: number;
    total_reward: number;
    is_claimed: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('weekly_rewards')
        .insert(claim)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating reward claim:', error)
      return null
    }
  },

  getRewardClaims: async (userId?: string) => {
    try {
      let query = supabase.from('weekly_rewards').select('*')
      
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting reward claims:', error)
      return []
    }
  },

  updateRewardClaim: async (id: number, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('weekly_rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating reward claim:', error)
      return null
    }
  },

  // 報酬計算（管理用）
  calculateRewards: async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_rewards')
        .select('*')

      if (error) throw error
      return { success: true, processedCount: data?.length || 0 }
    } catch (error) {
      console.error('Error calculating rewards:', error)
      return { success: false, processedCount: 0 }
    }
  },
}

// MLM関連のクエリ
export const mlmQueries = {
  getUserRank: async (userId: string) => {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (userError) throw userError

      const { data: purchases, error: purchasesError } = await supabase
        .from('nft_purchases')
        .select('purchase_price')
        .eq('user_id', userId)

      if (purchasesError) throw purchasesError

      const totalInvestment = purchases?.reduce((sum, p) => sum + p.purchase_price, 0) || 0

      const { data: referrals, error: referralsError } = await supabase
        .from('users')
        .select('user_id')
        .eq('referrer_id', userId)

      if (referralsError) throw referralsError

      const referralCount = referrals?.length || 0

      const ranks = [
        { name: "足軽", investmentRequired: 1000, referralsRequired: 0 },
        { name: "武将", investmentRequired: 1000, referralsRequired: 0 },
        { name: "代官", investmentRequired: 1000, referralsRequired: 0 },
        { name: "奉行", investmentRequired: 1000, referralsRequired: 0 },
        { name: "老中", investmentRequired: 1000, referralsRequired: 0 },
        { name: "大老", investmentRequired: 1000, referralsRequired: 0 },
        { name: "大名", investmentRequired: 1000, referralsRequired: 0 },
        { name: "将軍", investmentRequired: 1000, referralsRequired: 0 }
      ]

      let currentRank = ranks[0]
      let nextRank = ranks[1]

      for (let i = 0; i < ranks.length; i++) {
        if (totalInvestment >= ranks[i].investmentRequired && referralCount >= ranks[i].referralsRequired) {
          currentRank = ranks[i]
          nextRank = ranks[i + 1] || null
        } else {
          break
        }
      }

      return {
        success: true,
        rank: currentRank.name,
        investment: totalInvestment,
        referrals: referralCount,
        nextRankRequirement: nextRank ? {
          rank: nextRank.name,
          investmentRequired: nextRank.investmentRequired,
          referralsRequired: nextRank.referralsRequired
        } : null
      }
    } catch (error) {
      console.error('Error getting user rank:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  getReferralTree: async (userId: string, page: number = 1, limit: number = 20, parentId?: string) => {
    try {
      const targetUserId = parentId || userId
      const offset = (page - 1) * limit

      const { data: referrals, error: referralsError } = await supabase
        .from('users')
        .select(`
          user_id,
          name,
          email,
          created_at,
          referrer_id
        `)
        .eq('referrer_id', targetUserId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (referralsError) throw referralsError

      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', targetUserId)

      if (countError) throw countError

      const referralsWithPurchases = await Promise.all(
        (referrals || []).map(async (referral) => {
          const { data: purchases, error: purchasesError } = await supabase
            .from('nft_purchases')
            .select('purchase_price')
            .eq('user_id', referral.user_id)

          if (purchasesError) {
            console.error('Error fetching purchases for user:', referral.user_id, purchasesError)
          }

          const totalPurchases = purchases?.reduce((sum, p) => sum + p.purchase_price, 0) || 0

          const { data: childReferrals, error: childError } = await supabase
            .from('users')
            .select('user_id', { count: 'exact', head: true })
            .eq('referrer_id', referral.user_id)

          const childCount = childError ? 0 : (childReferrals?.length || 0)

          return {
            ...referral,
            totalPurchases,
            childCount,
            hasChildren: childCount > 0
          }
        })
      )

      return {
        success: true,
        referrals: referralsWithPurchases,
        totalCount: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    } catch (error) {
      console.error('Error getting referral tree:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  calculateRewards: async (userId: string) => {
    try {
      const { data: rewards, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      const totalRewards = rewards?.reduce((sum, r) => sum + r.amount, 0) || 0
      const claimedRewards = rewards?.filter(r => r.claimed).reduce((sum, r) => sum + r.amount, 0) || 0
      const pendingRewards = totalRewards - claimedRewards

      return {
        success: true,
        totalRewards,
        pendingRewards,
        claimedRewards
      }
    } catch (error) {
      console.error('Error calculating rewards:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// データベース初期化（テーブル作成）
export async function initializeDatabase() {
  // 実装...
  return { success: true }
}
